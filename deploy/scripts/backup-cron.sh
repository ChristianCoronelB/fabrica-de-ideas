#!/bin/bash
# ============================================================
# Fábrica de Ideas - Backup Cron Script
# Runs periodically to backup database and uploads
# ============================================================

set -euo pipefail

APP_DIR="/opt/fabrica-de-ideas"
BACKUP_DIR="${APP_DIR}/backups"
DB_PATH="${APP_DIR}/db/custom.db"
UPLOADS_DIR="${APP_DIR}/public/uploads"
LOG_FILE="${BACKUP_DIR}/backup.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MAX_DUMPS=5

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "${LOG_FILE}"
}

log "=== Starting backup ==="

# 1. SQLite database dump
if [ -f "${DB_PATH}" ]; then
    DUMP_FILE="${BACKUP_DIR}/db_dump_${TIMESTAMP}.sql"
    sqlite3 "${DB_PATH}" ".dump" > "${DUMP_FILE}" 2>/dev/null
    gzip -f "${DUMP_FILE}"
    log "Database dump created: ${DUMP_FILE}.gz"
else
    log "WARNING: Database file not found at ${DB_PATH}"
fi

# 2. Rsync uploads
if [ -d "${UPLOADS_DIR}" ]; then
    mkdir -p "${BACKUP_DIR}/uploads"
    rsync -a --delete "${UPLOADS_DIR}/" "${BACKUP_DIR}/uploads/" 2>/dev/null
    log "Uploads synced to ${BACKUP_DIR}/uploads/"
else
    log "WARNING: Uploads directory not found at ${UPLOADS_DIR}"
fi

# 3. Rotation - keep last MAX_DUMPS SQL dumps
DUMP_COUNT=$(ls -1 "${BACKUP_DIR}"/db_dump_*.sql.gz 2>/dev/null | wc -l)
if [ "${DUMP_COUNT}" -gt "${MAX_DUMPS}" ]; then
    DELETE_COUNT=$((DUMP_COUNT - MAX_DUMPS))
    ls -1t "${BACKUP_DIR}"/db_dump_*.sql.gz | tail -n "${DELETE_COUNT}" | xargs rm -f
    log "Rotated ${DELETE_COUNT} old dump(s), keeping last ${MAX_DUMPS}"
fi

log "=== Backup completed ==="
