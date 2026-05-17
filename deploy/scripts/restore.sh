#!/bin/bash
# ============================================================
# Fábrica de Ideas - Restore from Backup
# Restores database and uploads from a backup dump
# ============================================================

set -euo pipefail

APP_DIR="/opt/fabrica-de-ideas"
BACKUP_DIR="${APP_DIR}/backups"
DB_PATH="${APP_DIR}/db/custom.db"
UPLOADS_DIR="${APP_DIR}/public/uploads"
SERVICE_NAME="fabrica-de-ideas"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Fábrica de Ideas - Restore from Backup ===${NC}"

# Check if running as root or with sudo
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root or with sudo${NC}"
    exit 1
fi

# List available backups
echo -e "${YELLOW}Available database backups:${NC}"
if ls "${BACKUP_DIR}"/db_dump_*.sql.gz &>/dev/null; then
    ls -lht "${BACKUP_DIR}"/db_dump_*.sql.gz | head -20
else
    echo -e "${RED}No database backups found!${NC}"
    exit 1
fi

# Prompt for backup file
echo ""
read -rp "Enter the backup filename to restore (e.g., db_dump_20260512_143000.sql.gz): " BACKUP_FILE

if [ -z "${BACKUP_FILE}" ]; then
    echo -e "${RED}No backup file specified. Aborting.${NC}"
    exit 1
fi

BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
if [ ! -f "${BACKUP_PATH}" ]; then
    echo -e "${RED}Backup file not found: ${BACKUP_PATH}${NC}"
    exit 1
fi

# Confirmation prompt
echo -e "${YELLOW}WARNING: This will replace the current database with the backup.${NC}"
echo -e "${YELLOW}The application will be stopped during the restore process.${NC}"
read -rp "Are you sure you want to proceed? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# 1. Stop the service
echo -e "${YELLOW}Stopping service...${NC}"
systemctl stop "${SERVICE_NAME}" 2>/dev/null || true
echo -e "${GREEN}Service stopped.${NC}"

# 2. Restore database
echo -e "${YELLOW}Restoring database...${NC}"
BACKUP_TEMP="${BACKUP_PATH%.gz}"

gunzip -k -f "${BACKUP_PATH}" 2>/dev/null || true

# Remove existing database and restore from dump
rm -f "${DB_PATH}" "${DB_PATH}-wal" "${DB_PATH}-shm"
sqlite3 "${DB_PATH}" < "${BACKUP_TEMP}"

# Clean up temp file
rm -f "${BACKUP_TEMP}"

# Fix permissions
chown fabrica:fabrica "${DB_PATH}"
chmod 640 "${DB_PATH}"

echo -e "${GREEN}Database restored from: ${BACKUP_FILE}${NC}"

# 3. Restore uploads
if [ -d "${BACKUP_DIR}/uploads" ]; then
    echo -e "${YELLOW}Restoring uploads...${NC}"
    rsync -a --delete "${BACKUP_DIR}/uploads/" "${UPLOADS_DIR}/"
    chown -R fabrica:fabrica "${UPLOADS_DIR}"
    echo -e "${GREEN}Uploads restored.${NC}"
fi

# 4. Restart the service
echo -e "${YELLOW}Starting service...${NC}"
systemctl start "${SERVICE_NAME}"
echo -e "${GREEN}Service started.${NC}"

# 5. Verify
sleep 2
if systemctl is-active --quiet "${SERVICE_NAME}"; then
    echo -e "${GREEN}=== Restore completed successfully! ===${NC}"
    echo -e "${GREEN}The application is running and serving on port 3000.${NC}"
else
    echo -e "${RED}=== Warning: Service failed to start after restore ===${NC}"
    echo -e "${YELLOW}Check logs with: journalctl -u ${SERVICE_NAME} -n 50${NC}"
    exit 1
fi
