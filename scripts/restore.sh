#!/bin/bash
# Restore script for Fábrica de Ideas
# Restores database and uploads from backup
# Idempotent - safe to run multiple times

cd /home/z/my-project

BACKUP_DIR="./backups"
UPLOADS_DIR="./public/uploads"
BACKUP_UPLOADS_DIR="./backups/uploads"
DB_PATH="./db/custom.db"
DUMP_FILE="./backups/database_dump.sql"

log() {
  echo "[restore] $1"
}

# Check if backup dump exists
if [ ! -f "$DUMP_FILE" ]; then
  log "No database dump found at $DUMP_FILE, nothing to restore"
  log "This is normal for a fresh installation"
  exit 0
fi

log "Backup dump found, starting restore..."

# Step 1: Restore database
if [ -f "$DB_PATH" ]; then
  log "Database file exists, will overwrite with backup"
fi

# Ensure db directory exists
mkdir -p ./db

# Try bun restore script first (handles the SQL properly)
log "Restoring database via bun script..."
bun run /home/z/my-project/scripts/restore.ts

if [ $? -ne 0 ]; then
  # Fallback: try sqlite3 directly
  if command -v sqlite3 &> /dev/null; then
    log "Bun restore failed, trying sqlite3 restore..."
    # Remove existing db and recreate from dump
    rm -f "$DB_PATH"
    sqlite3 "$DB_PATH" < "$DUMP_FILE"
    if [ $? -eq 0 ]; then
      log "Database restored via sqlite3"
    else
      log "ERROR: sqlite3 restore also failed"
      exit 1
    fi
  else
    log "ERROR: Both bun and sqlite3 restore failed"
    exit 1
  fi
fi

# Step 2: Restore uploads from backup
if [ -d "$BACKUP_UPLOADS_DIR" ]; then
  log "Restoring uploads from backup..."
  mkdir -p "$UPLOADS_DIR"
  
  file_count=$(ls -1 "$BACKUP_UPLOADS_DIR" 2>/dev/null | wc -l)
  if [ "$file_count" -gt 0 ]; then
    # Copy files that don't exist in destination or are different
    cp -u "$BACKUP_UPLOADS_DIR"/* "$UPLOADS_DIR"/ 2>/dev/null || true
    log "Uploads restored ($file_count files in backup)"
  else
    log "No upload files in backup"
  fi
else
  log "No backup uploads directory found"
fi

# Step 3: Commit restore state to git
log "Committing restore state to git..."
git add -A 2>/dev/null || true
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "restore-from-backup $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || true
  log "Restore committed to git"
else
  log "No changes to commit after restore"
fi

log "Restore completed successfully"
