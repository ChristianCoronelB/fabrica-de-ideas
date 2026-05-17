#!/bin/bash
# Auto-Backup Daemon for Fábrica de Ideas
# Runs in an infinite loop, backing up every 5 minutes
# Uses sqlite3 for DB dump with fallback to bun backup script
# Commits everything to git for persistence across container resets

cd /home/z/my-project

BACKUP_DIR="./backups"
UPLOADS_DIR="./public/uploads"
BACKUP_UPLOADS_DIR="./backups/uploads"
DB_PATH="./db/custom.db"
DUMP_FILE="./backups/database_dump.sql"
LOG_FILE="./backups/backup.log"
INTERVAL=300  # 5 minutes

mkdir -p "$BACKUP_DIR" "$BACKUP_UPLOADS_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Auto-backup daemon started (PID: $$)"

while true; do
  # Step 1: Ensure backup directories exist
  mkdir -p "$BACKUP_DIR" "$BACKUP_UPLOADS_DIR"

  # Step 2: Dump the database
  if [ -f "$DB_PATH" ]; then
    log "Dumping database..."
    
    # Try sqlite3 first (faster and more reliable)
    if command -v sqlite3 &> /dev/null; then
      sqlite3 "$DB_PATH" ".dump" > "$DUMP_FILE" 2>> "$LOG_FILE"
      if [ $? -eq 0 ]; then
        log "Database dumped successfully via sqlite3"
      else
        log "sqlite3 dump failed, trying bun backup script..."
        bun run /home/z/my-project/scripts/backup.ts >> "$LOG_FILE" 2>&1
      fi
    else
      # Fallback to bun backup script
      log "sqlite3 not found, using bun backup script..."
      bun run /home/z/my-project/scripts/backup.ts >> "$LOG_FILE" 2>&1
    fi
  else
    log "Database file not found at $DB_PATH, skipping dump"
  fi

  # Step 3: Sync uploads to backup
  if [ -d "$UPLOADS_DIR" ]; then
    log "Syncing uploads..."
    # Use cp with update flag (only copy if newer)
    cp -u "$UPLOADS_DIR"/* "$BACKUP_UPLOADS_DIR"/ 2>> "$LOG_FILE" || true
    log "Uploads synced"
  else
    log "Uploads directory not found, skipping sync"
  fi

  # Step 4: Commit to git (the key persistence mechanism)
  log "Committing backup to git..."
  git add backups/ db/ 2>> "$LOG_FILE" || true
  
  # Only commit if there are changes
  if ! git diff --cached --quiet 2>/dev/null; then
    git commit -m "daemon-backup $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
      log "Git commit successful"
    else
      log "Git commit failed (may be no changes or lock issue)"
    fi
  else
    log "No changes to commit"
  fi

  # Step 5: Wait for next interval
  log "Waiting ${INTERVAL}s until next backup..."
  sleep "$INTERVAL"
done
