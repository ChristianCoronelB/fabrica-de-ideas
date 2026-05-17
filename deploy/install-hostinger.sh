#!/bin/bash
# ============================================================
# Fábrica de Ideas - Installation Script for Hostinger VPS
# Compatible with Ubuntu 22.04 / 24.04 LTS
# Version: 1.0.0
# ============================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

APP_NAME="fabrica-de-ideas"
APP_DIR="/opt/fabrica-de-ideas"
APP_USER="fabrica"
APP_GROUP="fabrica"
SERVICE_NAME="fabrica-de-ideas"
NODE_VERSION="20"
DB_PATH="${APP_DIR}/db/custom.db"
BACKUP_DIR="${APP_DIR}/backups"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Track the package source directory
PACKAGE_DIR=""
STEP=0
TOTAL_STEPS=24

# ============================================================
# Helper Functions
# ============================================================

print_step() {
    STEP=$((STEP + 1))
    echo -e "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${CYAN}[Paso ${STEP}/${TOTAL_STEPS}] $1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_ok() {
    echo -e "  ${GREEN}✓ $1${NC}"
}

print_warn() {
    echo -e "  ${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "  ${RED}✗ $1${NC}"
}

print_info() {
    echo -e "  ${CYAN}ℹ $1${NC}"
}

command_exists() {
    command -v "$1" &>/dev/null
}

generate_secret() {
    openssl rand -hex 32
}

# ============================================================
# Step 1: Check root/sudo
# ============================================================

step_check_root() {
    print_step "Verificando permisos de administrador"

    if [ "$(id -u)" -ne 0 ]; then
        print_error "Este script debe ejecutarse como root o con sudo."
        echo -e "  Ejemplo: sudo bash install-hostinger.sh"
        exit 1
    fi

    print_ok "Ejecutando como root"
}

# ============================================================
# Step 2: Detect OS
# ============================================================

step_detect_os() {
    print_step "Detectando sistema operativo"

    if [ ! -f /etc/os-release ]; then
        print_error "No se pudo detectar el sistema operativo."
        exit 1
    fi

    source /etc/os-release

    local os_name="${NAME:-Unknown}"
    local os_version="${VERSION_ID:-Unknown}"

    print_info "Sistema: ${os_name} ${os_version}"

    if [[ "${ID}" != "ubuntu" ]]; then
        print_warn "Este script está diseñado para Ubuntu. Puede no funcionar correctamente en ${os_name}."
        read -rp "  ¿Desea continuar de todas formas? (yes/no): " CONTINUE
        if [ "${CONTINUE}" != "yes" ]; then
            exit 1
        fi
    fi

    if [[ "${VERSION_ID}" != "22.04" ]] && [[ "${VERSION_ID}" != "24.04" ]]; then
        print_warn "Ubuntu ${VERSION_ID} no ha sido probado. Se recomienda 22.04 o 24.04 LTS."
    fi

    print_ok "Sistema operativo compatible"
}

# ============================================================
# Step 3: Update system packages
# ============================================================

step_update_system() {
    print_step "Actualizando paquetes del sistema"

    export DEBIAN_FRONTEND=noninteractive

    apt-get update -qq
    apt-get upgrade -y -qq
    apt-get dist-upgrade -y -qq

    print_ok "Sistema actualizado"
}

# ============================================================
# Step 4: Install Node.js 20 LTS
# ============================================================

step_install_nodejs() {
    print_step "Instalando Node.js ${NODE_VERSION} LTS"

    if command_exists node && [[ "$(node -v)" == "v${NODE_VERSION}"* ]]; then
        print_ok "Node.js $(node -v) ya está instalado"
        return
    fi

    # Install NodeSource setup script
    apt-get install -y -qq ca-certificates curl gnupg

    # Add NodeSource GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

    # Add NodeSource repository
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_VERSION}.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list > /dev/null

    apt-get update -qq
    apt-get install -y -qq nodejs

    # Verify installation
    print_ok "Node.js $(node -v) instalado"
    print_ok "npm $(npm -v) instalado"
}

# ============================================================
# Step 5: Install nginx
# ============================================================

step_install_nginx() {
    print_step "Instalando nginx"

    if command_exists nginx; then
        print_ok "nginx ya está instalado ($(nginx -v 2>&1))"
        return
    fi

    apt-get install -y -qq nginx
    systemctl enable nginx
    systemctl start nginx

    print_ok "nginx instalado y habilitado"
}

# ============================================================
# Step 6: Install sqlite3
# ============================================================

step_install_sqlite3() {
    print_step "Instalando sqlite3"

    if command_exists sqlite3; then
        print_ok "sqlite3 ya está instalado ($(sqlite3 --version))"
        return
    fi

    apt-get install -y -qq sqlite3

    print_ok "sqlite3 instalado ($(sqlite3 --version))"
}

# ============================================================
# Step 7: Create app user
# ============================================================

step_create_user() {
    print_step "Creando usuario de la aplicación"

    if id "${APP_USER}" &>/dev/null; then
        print_ok "Usuario '${APP_USER}' ya existe"
        return
    fi

    useradd --system --no-create-home --shell /bin/false "${APP_USER}"
    print_ok "Usuario '${APP_USER}' creado"
}

# ============================================================
# Step 8: Create app directory
# ============================================================

step_create_directory() {
    print_step "Creando directorio de la aplicación"

    if [ -d "${APP_DIR}" ]; then
        print_warn "El directorio ${APP_DIR} ya existe"
    else
        mkdir -p "${APP_DIR}"
        print_ok "Directorio ${APP_DIR} creado"
    fi

    # Create subdirectories
    mkdir -p "${APP_DIR}/db"
    mkdir -p "${APP_DIR}/public/uploads"
    mkdir -p "${BACKUP_DIR}"
    mkdir -p "${APP_DIR}/logs"

    print_ok "Subdirectorios creados"
}

# ============================================================
# Step 9: Copy source code
# ============================================================

step_copy_source() {
    print_step "Copiando código fuente"

    # Determine the package source
    if [ -d "${SCRIPT_DIR}/app" ]; then
        PACKAGE_DIR="${SCRIPT_DIR}/app"
    elif [ -d "${SCRIPT_DIR}/../app" ]; then
        PACKAGE_DIR="${SCRIPT_DIR}/../app"
    else
        # Ask user for the package location
        echo -e "  ${YELLOW}No se encontró el directorio 'app' del paquete.${NC}"
        read -rp "  Ingrese la ruta al código fuente extraído: " SOURCE_PATH

        if [ ! -d "${SOURCE_PATH}" ]; then
            print_error "Ruta no encontrada: ${SOURCE_PATH}"
            exit 1
        fi
        PACKAGE_DIR="${SOURCE_PATH}"
    fi

    print_info "Copiando desde: ${PACKAGE_DIR}"

    # Copy source code (excluding unnecessary files)
    rsync -a --delete \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='dist' \
        --exclude='backups' \
        --exclude='dev.log' \
        --exclude='agent-ctx' \
        --exclude='examples' \
        --exclude='mini-services' \
        --exclude='.zscripts' \
        --exclude='download' \
        --exclude='*.db' \
        --exclude='*.db-journal' \
        --exclude='*.db-wal' \
        --exclude='*.db-shm' \
        --exclude='.git' \
        --exclude='deploy' \
        "${PACKAGE_DIR}/" "${APP_DIR}/"

    print_ok "Código fuente copiado a ${APP_DIR}"
}

# ============================================================
# Step 10: Install dependencies
# ============================================================

step_install_deps() {
    print_step "Instalando dependencias"

    cd "${APP_DIR}"

    npm install --legacy-peer-deps --production=false 2>&1 | tail -5

    print_ok "Dependencias instaladas"
}

# ============================================================
# Step 11: Generate Prisma client
# ============================================================

step_prisma_generate() {
    print_step "Generando cliente Prisma"

    cd "${APP_DIR}"

    npx prisma generate

    print_ok "Cliente Prisma generado"
}

# ============================================================
# Step 12: Create .env file
# ============================================================

step_create_env() {
    print_step "Creando archivo de configuración .env"

    cd "${APP_DIR}"

    if [ -f "${APP_DIR}/.env" ]; then
        print_warn "El archivo .env ya existe. Se creará .env.new como respaldo."
        ENV_FILE="${APP_DIR}/.env.new"
    else
        ENV_FILE="${APP_DIR}/.env"
    fi

    JWT_SECRET=$(generate_secret)
    PASSWORD_SALT=$(generate_secret)

    cat > "${ENV_FILE}" << EOF
# ============================================================
# Fábrica de Ideas - Environment Configuration
# Generated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')
# ============================================================

# Database
DATABASE_URL="file:../db/custom.db"

# Authentication
JWT_SECRET="${JWT_SECRET}"
PASSWORD_SALT="${PASSWORD_SALT}"

# Application
NODE_ENV=production
PORT=3000
EOF

    print_ok "Archivo .env creado con secretos generados"
    print_info "JWT_SECRET: ${JWT_SECRET:0:16}..."
    print_info "PASSWORD_SALT: ${PASSWORD_SALT:0:16}..."
}

# ============================================================
# Step 13: Push database schema
# ============================================================

step_push_schema() {
    print_step "Inicializando base de datos"

    cd "${APP_DIR}"

    npx prisma db push --skip-generate

    # Fix permissions
    chown -R "${APP_USER}:${APP_GROUP}" "${APP_DIR}/db"

    print_ok "Esquema de base de datos aplicado"
}

# ============================================================
# Step 14: Build Next.js app
# ============================================================

step_build_app() {
    print_step "Construyendo la aplicación Next.js"

    cd "${APP_DIR}"

    npm run build 2>&1 | tail -10

    print_ok "Aplicación construida exitosamente"
}

# ============================================================
# Step 15: Copy static files and public to standalone
# ============================================================

step_copy_standalone() {
    print_step "Configurando servidor standalone"

    cd "${APP_DIR}"

    # Copy static files to standalone
    if [ -d "${APP_DIR}/.next/static" ] && [ -d "${APP_DIR}/.next/standalone" ]; then
        cp -r "${APP_DIR}/.next/static" "${APP_DIR}/.next/standalone/.next/static"
        print_ok "Archivos estáticos copiados"
    else
        print_warn "No se encontró .next/static o .next/standalone. Se usará el build completo."
    fi

    # Copy public directory to standalone
    if [ -d "${APP_DIR}/.next/standalone" ] && [ -d "${APP_DIR}/public" ]; then
        cp -r "${APP_DIR}/public" "${APP_DIR}/.next/standalone/public"
        print_ok "Directorio public copiado"
    fi

    # Copy Prisma files to standalone
    if [ -d "${APP_DIR}/.next/standalone" ]; then
        mkdir -p "${APP_DIR}/.next/standalone/prisma"
        cp -r "${APP_DIR}/prisma/schema.prisma" "${APP_DIR}/.next/standalone/prisma/"
        mkdir -p "${APP_DIR}/.next/standalone/node_modules/.prisma"
        cp -r "${APP_DIR}/node_modules/.prisma/." "${APP_DIR}/.next/standalone/node_modules/.prisma/" 2>/dev/null || true
        cp -r "${APP_DIR}/node_modules/@prisma/." "${APP_DIR}/.next/standalone/node_modules/@prisma/" 2>/dev/null || true
        print_ok "Archivos Prisma copiados"
    fi

    # Copy .env to standalone
    if [ -f "${APP_DIR}/.env" ] && [ -d "${APP_DIR}/.next/standalone" ]; then
        cp "${APP_DIR}/.env" "${APP_DIR}/.next/standalone/.env"
        print_ok "Archivo .env copiado"
    fi
}

# ============================================================
# Step 16: Set permissions
# ============================================================

step_set_permissions() {
    print_step "Configurando permisos"

    # Set ownership
    chown -R "${APP_USER}:${APP_GROUP}" "${APP_DIR}"

    # Set specific permissions
    chmod 755 "${APP_DIR}"
    chmod 640 "${APP_DIR}/.env"
    chmod -R 755 "${APP_DIR}/db"
    chmod -R 755 "${APP_DIR}/public"
    chmod -R 755 "${APP_DIR}/backups"

    # Make sure db is writable
    chown "${APP_USER}:${APP_GROUP}" "${APP_DIR}/db"
    [ -f "${DB_PATH}" ] && chown "${APP_USER}:${APP_GROUP}" "${DB_PATH}"

    # Uploads writable
    chown -R "${APP_USER}:${APP_GROUP}" "${APP_DIR}/public/uploads"

    print_ok "Permisos configurados"
}

# ============================================================
# Step 17: Install systemd service
# ============================================================

step_install_service() {
    print_step "Instalando servicio systemd"

    # Check if the service file exists in the package
    local service_source=""
    if [ -f "${SCRIPT_DIR}/configs/fabrica-de-ideas.service" ]; then
        service_source="${SCRIPT_DIR}/configs/fabrica-de-ideas.service"
    elif [ -f "${APP_DIR}/deploy/configs/fabrica-de-ideas.service" ]; then
        service_source="${APP_DIR}/deploy/configs/fabrica-de-ideas.service"
    else
        # Create the service file inline
        service_source="/tmp/fabrica-de-ideas.service"
        cat > "${service_source}" << 'EOF'
[Unit]
Description=Fabrica de Ideas - Next.js Application
After=network.target

[Service]
Type=simple
User=fabrica
Group=fabrica
WorkingDirectory=/opt/fabrica-de-ideas/.next/standalone
ExecStart=/usr/bin/node /opt/fabrica-de-ideas/.next/standalone/server.js
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
Restart=always
RestartSec=10
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths=/opt/fabrica-de-ideas/db
ReadWritePaths=/opt/fabrica-de-ideas/public/uploads
ReadWritePaths=/opt/fabrica-de-ideas/backups
StandardOutput=journal
StandardError=journal
SyslogIdentifier=fabrica-de-ideas

[Install]
WantedBy=multi-user.target
EOF
    fi

    cp "${service_source}" "/etc/systemd/system/${SERVICE_NAME}.service"
    systemctl daemon-reload
    systemctl enable "${SERVICE_NAME}"

    print_ok "Servicio systemd instalado y habilitado"
}

# ============================================================
# Step 18: Configure nginx
# ============================================================

step_configure_nginx() {
    print_step "Configurando nginx"

    # Prompt for domain or IP
    echo -e "  ${CYAN}¿Cómo accederá a la aplicación?${NC}"
    echo -e "  1) Por dirección IP (configuración por defecto)"
    echo -e "  2) Por dominio (ej: fabrica.midominio.com)"
    read -rp "  Seleccione (1 o 2): " NGINX_CHOICE

    local nginx_conf=""

    if [ "${NGINX_CHOICE}" = "2" ]; then
        read -rp "  Ingrese su dominio (ej: fabrica.midominio.com): " DOMAIN_NAME

        if [ -z "${DOMAIN_NAME}" ]; then
            print_warn "Dominio vacío, usando configuración por IP"
            NGINX_CHOICE="1"
        else
            # Check for domain config template
            if [ -f "${SCRIPT_DIR}/configs/nginx-domain.conf" ]; then
                nginx_conf="${SCRIPT_DIR}/configs/nginx-domain.conf"
            elif [ -f "${APP_DIR}/deploy/configs/nginx-domain.conf" ]; then
                nginx_conf="${APP_DIR}/deploy/configs/nginx-domain.conf"
            fi

            if [ -n "${nginx_conf}" ]; then
                sed "s/TU_DOMINIO_AQUI/${DOMAIN_NAME}/g" "${nginx_conf}" > /etc/nginx/sites-available/fabrica-de-ideas
            else
                # Create inline
                cat > /etc/nginx/sites-available/fabrica-de-ideas << EOF
server {
    listen 80;
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public";
    }
}
EOF
            fi
            print_ok "nginx configurado para dominio: ${DOMAIN_NAME}"
        fi
    fi

    if [ "${NGINX_CHOICE}" != "2" ]; then
        # IP-based configuration
        if [ -f "${SCRIPT_DIR}/configs/nginx-default.conf" ]; then
            nginx_conf="${SCRIPT_DIR}/configs/nginx-default.conf"
        elif [ -f "${APP_DIR}/deploy/configs/nginx-default.conf" ]; then
            nginx_conf="${APP_DIR}/deploy/configs/nginx-default.conf"
        fi

        if [ -n "${nginx_conf}" ]; then
            cp "${nginx_conf}" /etc/nginx/sites-available/fabrica-de-ideas
        else
            cat > /etc/nginx/sites-available/fabrica-de-ideas << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public";
    }
}
NGINXEOF
        fi
        print_ok "nginx configurado para acceso por IP"
    fi

    # Enable the site
    ln -sf /etc/nginx/sites-available/fabrica-de-ideas /etc/nginx/sites-enabled/fabrica-de-ideas

    # Remove default site if it exists
    rm -f /etc/nginx/sites-enabled/default

    # Test nginx configuration
    nginx -t 2>/dev/null

    if [ $? -eq 0 ]; then
        systemctl reload nginx
        print_ok "nginx recargado con nueva configuración"
    else
        print_error "Error en la configuración de nginx. Revise el archivo."
        nginx -t
        exit 1
    fi
}

# ============================================================
# Step 19: Start service
# ============================================================

step_start_service() {
    print_step "Iniciando el servicio"

    systemctl start "${SERVICE_NAME}"

    # Wait and verify
    sleep 3

    if systemctl is-active --quiet "${SERVICE_NAME}"; then
        print_ok "Servicio iniciado exitosamente"
    else
        print_error "El servicio no se inició correctamente."
        echo -e "  Revise los logs con: journalctl -u ${SERVICE_NAME} -n 50"
        journalctl -u "${SERVICE_NAME}" -n 20 --no-pager
        exit 1
    fi
}

# ============================================================
# Step 20: Run seed if DB is empty
# ============================================================

step_seed_database() {
    print_step "Verificando datos iniciales"

    cd "${APP_DIR}"

    # Check if database has any users
    local user_count
    user_count=$(sqlite3 "${DB_PATH}" "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")

    if [ "${user_count}" = "0" ]; then
        print_info "Base de datos vacía. Ejecutando seed..."

        # Install tsx globally if not available
        if ! command_exists tsx; then
            npm install -g tsx 2>&1 | tail -3
        fi

        # Run seed
        npx tsx prisma/seed.ts 2>&1 | tail -10

        if [ $? -eq 0 ]; then
            print_ok "Datos iniciales cargados exitosamente"
        else
            print_warn "Error al ejecutar seed. Puede ejecutarlo manualmente:"
            echo -e "  cd ${APP_DIR} && npx tsx prisma/seed.ts"
        fi
    else
        print_ok "Base de datos ya contiene datos (${user_count} usuarios). Saltando seed."
    fi
}

# ============================================================
# Step 21: Set up backup cron job
# ============================================================

step_setup_backup_cron() {
    print_step "Configurando respaldos automáticos"

    # Check for backup script in package
    local backup_script=""
    if [ -f "${SCRIPT_DIR}/scripts/backup-cron.sh" ]; then
        backup_script="${SCRIPT_DIR}/scripts/backup-cron.sh"
    elif [ -f "${APP_DIR}/deploy/scripts/backup-cron.sh" ]; then
        backup_script="${APP_DIR}/deploy/scripts/backup-cron.sh"
    fi

    if [ -n "${backup_script}" ]; then
        cp "${backup_script}" "${APP_DIR}/scripts/backup-cron.sh"
    fi

    # Ensure the script exists
    if [ ! -f "${APP_DIR}/scripts/backup-cron.sh" ]; then
        mkdir -p "${APP_DIR}/scripts"
        cat > "${APP_DIR}/scripts/backup-cron.sh" << 'CRONEOF'
#!/bin/bash
set -euo pipefail
APP_DIR="/opt/fabrica-de-ideas"
BACKUP_DIR="${APP_DIR}/backups"
DB_PATH="${APP_DIR}/db/custom.db"
UPLOADS_DIR="${APP_DIR}/public/uploads"
LOG_FILE="${BACKUP_DIR}/backup.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MAX_DUMPS=5
mkdir -p "${BACKUP_DIR}"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup" >> "${LOG_FILE}"
if [ -f "${DB_PATH}" ]; then
    sqlite3 "${DB_PATH}" ".dump" > "${BACKUP_DIR}/db_dump_${TIMESTAMP}.sql"
    gzip -f "${BACKUP_DIR}/db_dump_${TIMESTAMP}.sql"
fi
if [ -d "${UPLOADS_DIR}" ]; then
    mkdir -p "${BACKUP_DIR}/uploads"
    rsync -a --delete "${UPLOADS_DIR}/" "${BACKUP_DIR}/uploads/"
fi
DUMP_COUNT=$(ls -1 "${BACKUP_DIR}"/db_dump_*.sql.gz 2>/dev/null | wc -l)
if [ "${DUMP_COUNT}" -gt "${MAX_DUMPS}" ]; then
    DELETE_COUNT=$((DUMP_COUNT - MAX_DUMPS))
    ls -1t "${BACKUP_DIR}"/db_dump_*.sql.gz | tail -n "${DELETE_COUNT}" | xargs rm -f
fi
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed" >> "${LOG_FILE}"
CRONEOF
    fi

    chmod +x "${APP_DIR}/scripts/backup-cron.sh"
    chown "${APP_USER}:${APP_GROUP}" "${APP_DIR}/scripts/backup-cron.sh"

    # Add cron job (every 5 minutes)
    local cron_entry="*/5 * * * * ${APP_DIR}/scripts/backup-cron.sh"

    # Check if cron is already set up
    if crontab -l 2>/dev/null | grep -q "backup-cron.sh"; then
        print_ok "Cron de respaldo ya existe"
    else
        (crontab -l 2>/dev/null; echo "${cron_entry}") | crontab -
        print_ok "Cron de respaldo configurado (cada 5 minutos)"
    fi
}

# ============================================================
# Step 22: Optional - Install SSL with Let's Encrypt
# ============================================================

step_install_ssl() {
    print_step "SSL con Let's Encrypt (Opcional)"

    echo -e "  ${CYAN}¿Desea instalar certificado SSL con Let's Encrypt?${NC}"
    echo -e "  Esto requiere un dominio configurado previamente."
    read -rp "  Instalar SSL? (yes/no): " INSTALL_SSL

    if [ "${INSTALL_SSL}" != "yes" ]; then
        print_info "SSL omitido. Puede instalarlo más tarde con certbot."
        return
    fi

    # Install certbot
    apt-get install -y -qq certbot python3-certbot-nginx

    # Get domain
    read -rp "  Ingrese el dominio para el SSL (ej: fabrica.midominio.com): " SSL_DOMAIN

    if [ -z "${SSL_DOMAIN}" ]; then
        print_warn "Dominio vacío. Omitiendo SSL."
        return
    fi

    # Obtain certificate
    certbot --nginx -d "${SSL_DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email 2>&1 | tail -10

    if [ $? -eq 0 ]; then
        print_ok "Certificado SSL instalado para ${SSL_DOMAIN}"

        # Set up auto-renewal
        systemctl enable certbot.timer
        systemctl start certbot.timer

        print_ok "Renovación automática configurada"
    else
        print_warn "Error al instalar SSL. Verifique que el dominio apunte a este servidor."
    fi
}

# ============================================================
# Step 23: Optional - Configure firewall
# ============================================================

step_configure_firewall() {
    print_step "Configuración de firewall (Opcional)"

    echo -e "  ${CYAN}¿Desea configurar el firewall (ufw)?${NC}"
    echo -e "  Esto permitirá solo los puertos necesarios (22, 80, 443)."
    read -rp "  Configurar firewall? (yes/no): " INSTALL_FIREWALL

    if [ "${INSTALL_FIREWALL}" != "yes" ]; then
        print_info "Firewall omitido. Puede configurarlo más tarde con ufw."
        return
    fi

    apt-get install -y -qq ufw

    # Configure rules
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS

    # Enable (with caution - don't lock out SSH)
    echo "y" | ufw enable

    ufw status verbose

    print_ok "Firewall configurado (puertos 22, 80, 443 permitidos)"
}

# ============================================================
# Step 24: Show summary
# ============================================================

step_show_summary() {
    print_step "¡Instalación completada!"

    local SERVER_IP
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "SU_IP_AQUI")

    echo ""
    echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║       Fábrica de Ideas - Instalación Completada         ║${NC}"
    echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BOLD}📍 Acceso a la aplicación:${NC}"
    echo -e "   URL:  ${CYAN}http://${SERVER_IP}${NC}"
    echo -e "   Puerto: 80 (nginx) → 3000 (Node.js)"
    echo ""
    echo -e "${BOLD}👤 Credenciales por defecto (datos seed):${NC}"
    echo -e "   Admin:        ${CYAN}admin@fabrica.edu${NC} / ${CYAN}admin123${NC}"
    echo -e "   Participante: ${CYAN}maria@fabrica.edu${NC} / ${CYAN}participante123${NC}"
    echo -e "   Evaluador:    ${CYAN}carlos@fabrica.edu${NC} / ${CYAN}evaluador123${NC}"
    echo ""
    echo -e "${BOLD}📂 Directorios importantes:${NC}"
    echo -e "   Aplicación:  ${APP_DIR}"
    echo -e "   Base de datos: ${DB_PATH}"
    echo -e "   Subidas:     ${APP_DIR}/public/uploads"
    echo -e "   Respaldos:   ${BACKUP_DIR}"
    echo -e "   Config .env: ${APP_DIR}/.env"
    echo ""
    echo -e "${BOLD}🔧 Comandos útiles:${NC}"
    echo -e "   Ver estado:     ${CYAN}sudo systemctl status ${SERVICE_NAME}${NC}"
    echo -e "   Ver logs:       ${CYAN}sudo journalctl -u ${SERVICE_NAME} -f${NC}"
    echo -e "   Reiniciar:      ${CYAN}sudo systemctl restart ${SERVICE_NAME}${NC}"
    echo -e "   Detener:        ${CYAN}sudo systemctl stop ${SERVICE_NAME}${NC}"
    echo -e "   Restaurar:      ${CYAN}sudo bash ${APP_DIR}/deploy/scripts/restore.sh${NC}"
    echo -e "   Respaldar:      ${CYAN}sudo bash ${APP_DIR}/scripts/backup-cron.sh${NC}"
    echo ""
    echo -e "${BOLD}🔄 Actualizar la aplicación:${NC}"
    echo -e "   1. Extraer nuevo paquete en /tmp/"
    echo -e "   2. Copiar código: ${CYAN}sudo rsync -a /tmp/app/ ${APP_DIR}/${NC}"
    echo -e "   3. Instalar deps: ${CYAN}cd ${APP_DIR} && sudo npm install --legacy-peer-deps${NC}"
    echo -e "   4. Construir:     ${CYAN}cd ${APP_DIR} && sudo npm run build${NC}"
    echo -e "   5. Reiniciar:     ${CYAN}sudo systemctl restart ${SERVICE_NAME}${NC}"
    echo ""
    echo -e "${BOLD}🔒 Seguridad:${NC}"
    echo -e "   - Cambie las contraseñas por defecto inmediatamente"
    echo -e "   - Revise los secretos en ${APP_DIR}/.env"
    echo -e "   - Configure SSL si usa un dominio"
    echo -e "   - Active el firewall con ufw"
    echo ""
    echo -e "${GREEN}¡Gracias por instalar Fábrica de Ideas! 🎉${NC}"
    echo ""
}

# ============================================================
# Main execution
# ============================================================

main() {
    echo ""
    echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║     Fábrica de Ideas - Instalador para Hostinger VPS    ║${NC}"
    echo -e "${BOLD}${GREEN}║                    Versión 1.0.0                        ║${NC}"
    echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Este script instalará la aplicación completa en su servidor."
    echo -e "Requiere Ubuntu 22.04 o 24.04 LTS."
    echo ""
    read -rp "Presione Enter para continuar o Ctrl+C para cancelar..."

    # Execute all steps
    step_check_root
    step_detect_os
    step_update_system
    step_install_nodejs
    step_install_nginx
    step_install_sqlite3
    step_create_user
    step_create_directory
    step_copy_source
    step_install_deps
    step_prisma_generate
    step_create_env
    step_push_schema
    step_build_app
    step_copy_standalone
    step_set_permissions
    step_install_service
    step_configure_nginx
    step_start_service
    step_seed_database
    step_setup_backup_cron
    step_install_ssl
    step_configure_firewall
    step_show_summary
}

main "$@"
