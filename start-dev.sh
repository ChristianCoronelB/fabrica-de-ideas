#!/bin/bash
# Auto-restart dev server supervisor with auto-restore and auto-backup
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=1536"

# Auto-restore from backup before starting server
echo "[$(date)] Checking for backup to restore..." >> /home/z/my-project/dev.log
bun run /home/z/my-project/scripts/restore.ts >> /home/z/my-project/dev.log 2>&1

# Start auto-backup daemon in background (bash loop - more reliable than Node.js daemon)
echo "[$(date)] Starting auto-backup daemon..." >> /home/z/my-project/dev.log
bash /home/z/my-project/scripts/auto-backup-daemon.sh >> /home/z/my-project/backups/backup.log 2>&1 &
BACKUP_PID=$!
echo "[$(date)] Auto-backup daemon started (PID: $BACKUP_PID)" >> /home/z/my-project/dev.log

# Run initial backup to ensure current state is saved
echo "[$(date)] Running initial backup..." >> /home/z/my-project/dev.log
bun run /home/z/my-project/scripts/backup.ts >> /home/z/my-project/backups/backup.log 2>&1

while true; do
  echo "[$(date)] Starting Next.js dev server..." >> /home/z/my-project/dev.log
  node node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 3s..." >> /home/z/my-project/dev.log
  sleep 3
done
