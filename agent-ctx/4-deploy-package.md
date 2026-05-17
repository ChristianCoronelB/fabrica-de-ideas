# Task 4: Deployment Package for Hostinger VPS
**Agent**: deploy-agent
**Completed:** 2026-05-17

## What was done:

### 1. Created deploy/package.sh
- Packaging script that creates a clean temp directory at /tmp/fabrica-package
- Copies source code excluding: node_modules, .next, dist, backups, dev.log, agent-ctx, examples, mini-services, .zscripts, download, *.db, *.db-journal
- Copies deploy/ configs into the package
- Creates .env.production with DATABASE_URL, JWT_SECRET, PASSWORD_SALT placeholders, NODE_ENV=production, PORT=3000
- Creates INSTALL.txt with quick instructions
- Generates tar.gz named `fabrica-de-ideas-v1.0.0.tar.gz` in `/home/z/my-project/download/`
- Creates .sha256 and .md5 checksum files
- **Executed successfully**: Package created (6.6M), SHA256: 337e99548303b8ac18575745e2f0b4f8412548749ce27122914d1e9bdc26f5ff

### 2. Created deploy/Dockerfile
- Multi-stage Docker build:
  - Stage 1 (deps): node:20-alpine, installs python3, make, g++
  - Stage 2 (builder): copies package.json + lock, npm ci, copies source, prisma generate, next build
  - Stage 3 (runner): node:20-alpine, copies standalone + static + public + prisma, non-root user (nextjs:nodejs), exposes 3000, healthcheck with wget, CMD node server.js

### 3. Created deploy/docker-compose.yml
- Service with build: ., restart: always, port 80:3000
- Volumes: fabrica-db (/app/db), fabrica-uploads (/app/public/uploads), fabrica-backups (/app/backups)
- Environment: DATABASE_URL, NODE_ENV=production, JWT_SECRET, PASSWORD_SALT

### 4. Created deploy/install-hostinger.sh
- Comprehensive 24-step installation script for Ubuntu 22.04/24.04
- Steps: check root, detect OS, update system, install Node.js 20 LTS, install nginx, install sqlite3, create app user (fabrica), create app directory (/opt/fabrica-de-ideas), copy source, install deps (npm install --legacy-peer-deps), generate Prisma client, create .env with generated secrets, push DB schema, build Next.js, copy static/public/prisma to standalone, set permissions, install systemd service, configure nginx (prompt for IP or domain), start service, seed DB if empty (uses npx tsx), setup backup cron (every 5 min), optional SSL with Let's Encrypt, optional firewall (ufw), show summary with credentials and commands

### 5. Created deploy/configs/fabrica-de-ideas.service
- systemd service unit file
- User: fabrica, WorkingDirectory: /opt/fabrica-de-ideas/.next/standalone
- ExecStart: /usr/bin/node /opt/fabrica-de-ideas/.next/standalone/server.js
- Environment: NODE_ENV=production, PORT=3000, HOSTNAME=0.0.0.0
- Restart=always, RestartSec=10
- Security: NoNewPrivileges, ProtectSystem=strict, ProtectHome, PrivateTmp
- ReadWritePaths for db, uploads, backups

### 6. Created deploy/configs/nginx-default.conf
- Nginx config for IP access: listen 80, server_name _
- client_max_body_size 25M
- proxy_pass to 127.0.0.1:3000 with WebSocket headers (Upgrade, Connection)
- proxy_read_timeout 300s
- Static asset caching (/_next/static/ 365d, /uploads/ 30d)

### 7. Created deploy/configs/nginx-domain.conf
- Same as nginx-default but with TU_DOMINIO_AQUI placeholder
- www to non-www redirect
- Commented-out HTTPS server block with SSL config for certbot setup
- HTTP to HTTPS redirect block (commented)

### 8. Created deploy/scripts/backup-cron.sh
- sqlite3 dump of database to gzipped SQL file
- rsync uploads to backup directory
- Rotation: keeps last 5 SQL dumps
- Logs to backup.log

### 9. Created deploy/scripts/restore.sh
- Lists available backups, prompts user to select one
- Confirmation prompt before proceeding
- Stops service, restores DB from SQL dump, restores uploads, restarts service
- Verifies service is running after restore
- Color-coded output

### 10. Created deploy/README.md
- Comprehensive deployment guide with:
  - Prerequisites (VPS plan requirements table)
  - Quick installation (4 steps)
  - Docker alternative (5 steps)
  - Package structure diagram
  - Administration commands (service, DB, backup/restore, nginx)
  - Update process (8 detailed steps)
  - Security recommendations (8 items)
  - Troubleshooting (8 common issues with solutions)
  - Monitoring commands

### 11. Git Commit
- Committed as: "Add deployment package v1.0.0 for Hostinger VPS"
- 17 files changed, 2076 insertions
