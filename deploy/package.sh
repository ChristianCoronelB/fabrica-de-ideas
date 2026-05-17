#!/bin/bash
# ============================================================
# Fábrica de Ideas - Package Creation Script
# Creates a deployment tar.gz for production deployment
# Version: 1.0.0
# ============================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="/home/z/my-project"
TEMP_DIR="/tmp/fabrica-package"
OUTPUT_DIR="${PROJECT_DIR}/download"
PACKAGE_NAME="fabrica-de-ideas-v1.0.0"
TAR_FILE="${OUTPUT_DIR}/${PACKAGE_NAME}.tar.gz"

echo -e "${CYAN}=== Fábrica de Ideas - Creando paquete de despliegue ===${NC}"
echo ""

# Step 1: Clean up any previous package
echo -e "${YELLOW}[1/7] Limpiando directorio temporal...${NC}"
rm -rf "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}/${PACKAGE_NAME}"

# Step 2: Copy source code (excluding unnecessary files)
echo -e "${YELLOW}[2/7] Copiando código fuente...${NC}"
rsync -a \
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
    "${PROJECT_DIR}/" "${TEMP_DIR}/${PACKAGE_NAME}/app/"

echo -e "  ${GREEN}✓ Código fuente copiado${NC}"

# Step 3: Copy deploy configs into the package
echo -e "${YELLOW}[3/7] Copiando configuraciones de despliegue...${NC}"

# Copy the entire deploy directory
if [ -d "${PROJECT_DIR}/deploy" ]; then
    cp -r "${PROJECT_DIR}/deploy" "${TEMP_DIR}/${PACKAGE_NAME}/deploy"
    echo -e "  ${GREEN}✓ Directorio deploy/ copiado${NC}"
else
    echo -e "  ${RED}✗ Directorio deploy/ no encontrado${NC}"
fi

# Step 4: Create .env.production file
echo -e "${YELLOW}[4/7] Creando archivo .env.production...${NC}"
cat > "${TEMP_DIR}/${PACKAGE_NAME}/app/.env.production" << 'EOF'
# ============================================================
# Fábrica de Ideas - Production Environment
# IMPORTANT: Change all secret values before deploying!
# ============================================================

# Database
DATABASE_URL="file:../db/custom.db"

# Authentication - CHANGE THESE!
JWT_SECRET=CHANGE_ME_GENERATE_A_RANDOM_SECRET
PASSWORD_SALT=CHANGE_ME_GENERATE_A_RANDOM_SALT

# Application
NODE_ENV=production
PORT=3000
EOF

echo -e "  ${GREEN}✓ .env.production creado${NC}"

# Step 5: Create installation instructions
echo -e "${YELLOW}[5/7] Creando instrucciones de instalación...${NC}"
cat > "${TEMP_DIR}/${PACKAGE_NAME}/INSTALL.txt" << 'EOF'
============================================
Fábrica de Ideas - Instrucciones de Instalación
============================================

Requisitos:
- VPS con Ubuntu 22.04 o 24.04 LTS
- Mínimo 1GB RAM, 10GB almacenamiento
- Acceso root o sudo

Instalación rápida:
1. Suba el archivo tar.gz a su servidor:
   scp fabrica-de-ideas-v1.0.0.tar.gz root@SU_SERVIDOR:/tmp/

2. Extraiga el paquete:
   cd /tmp && tar xzf fabrica-de-ideas-v1.0.0.tar.gz

3. Ejecute el instalador:
   cd fabrica-de-ideas-v1.0.0
   sudo bash deploy/install-hostinger.sh

4. Siga las instrucciones en pantalla.

Para más detalles, consulte deploy/README.md
EOF

echo -e "  ${GREEN}✓ INSTALL.txt creado${NC}"

# Step 6: Create tar.gz
echo -e "${YELLOW}[6/7] Creando archivo tar.gz...${NC}"

# Ensure output directory exists
mkdir -p "${OUTPUT_DIR}"

# Remove old package if exists
rm -f "${TAR_FILE}" "${TAR_FILE}.sha256" "${TAR_FILE}.md5"

# Create the tarball
cd "${TEMP_DIR}"
tar czf "${TAR_FILE}" "${PACKAGE_NAME}"

# Get file size
FILE_SIZE=$(du -h "${TAR_FILE}" | cut -f1)

echo -e "  ${GREEN}✓ Paquete creado: ${TAR_FILE} (${FILE_SIZE})${NC}"

# Step 7: Create checksums
echo -e "${YELLOW}[7/7] Generando checksums...${NC}"

# SHA256
sha256sum "${TAR_FILE}" > "${TAR_FILE}.sha256"
echo -e "  ${GREEN}✓ SHA256: $(cut -d' ' -f1 "${TAR_FILE}.sha256")${NC}"

# MD5
md5sum "${TAR_FILE}" > "${TAR_FILE}.md5"
echo -e "  ${GREEN}✓ MD5:   $(cut -d' ' -f1 "${TAR_FILE}.md5")${NC}"

# Clean up
rm -rf "${TEMP_DIR}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ¡Paquete creado exitosamente!                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Archivo:    ${CYAN}${TAR_FILE}${NC}"
echo -e "  Tamaño:     ${CYAN}${FILE_SIZE}${NC}"
echo -e "  SHA256:     ${CYAN}${TAR_FILE}.sha256${NC}"
echo -e "  MD5:        ${CYAN}${TAR_FILE}.md5${NC}"
echo ""
echo -e "Para verificar integridad:"
echo -e "  ${CYAN}sha256sum -c ${TAR_FILE}.sha256${NC}"
echo -e "  ${CYAN}md5sum -c ${TAR_FILE}.md5${NC}"
echo ""
