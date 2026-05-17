# Fábrica de Ideas - Guía de Despliegue para Hostinger VPS

## 📋 Requisitos Previos

### Plan VPS Recomendado
| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 1 núcleo | 2 núcleos |
| RAM | 1 GB | 2 GB |
| Almacenamiento | 10 GB | 25 GB |
| SO | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Red | 1 IP pública | 1 IP + dominio |

### Requisitos de Software
- Ubuntu 22.04 o 24.04 LTS
- Acceso root o sudo
- Conexión a Internet

---

## 🚀 Instalación Rápida (Recomendado)

### Paso 1: Subir el paquete al servidor

```bash
# Desde su máquina local
scp fabrica-de-ideas-v1.0.0.tar.gz root@SU_IP_DEL_SERVIDOR:/tmp/
```

### Paso 2: Extraer el paquete

```bash
# En el servidor
cd /tmp
tar xzf fabrica-de-ideas-v1.0.0.tar.gz
```

### Paso 3: Ejecutar el instalador

```bash
cd /tmp/fabrica-de-ideas-v1.0.0
sudo bash deploy/install-hostinger.sh
```

El instalador lo guiará a través de 24 pasos que incluyen:
1. Verificación de permisos
2. Detección de sistema operativo
3. Actualización de paquetes del sistema
4. Instalación de Node.js 20 LTS
5. Instalación de nginx
6. Instalación de sqlite3
7. Creación del usuario de la aplicación
8. Creación del directorio de la aplicación
9. Copia del código fuente
10. Instalación de dependencias
11. Generación del cliente Prisma
12. Creación del archivo .env con secretos
13. Inicialización de la base de datos
14. Construcción de la aplicación
15. Configuración del servidor standalone
16. Configuración de permisos
17. Instalación del servicio systemd
18. Configuración de nginx
19. Inicio del servicio
20. Carga de datos iniciales (seed)
21. Configuración de respaldos automáticos
22. Instalación opcional de SSL
23. Configuración opcional de firewall
24. Resumen de la instalación

### Paso 4: Acceder a la aplicación

Abra su navegador y visite:
- **Por IP**: `http://SU_IP_DEL_SERVIDOR`
- **Por dominio**: `http://su-dominio.com`

### Credenciales por defecto (datos seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@fabrica.edu | admin123 |
| Participante | maria@fabrica.edu | participante123 |
| Evaluador | carlos@fabrica.edu | evaluador123 |

> ⚠️ **IMPORTANTE**: Cambie estas contraseñas inmediatamente después del primer inicio de sesión.

---

## 🐳 Alternativa: Despliegue con Docker

### Requisitos
- Docker y Docker Compose instalados
- Mínimo 2 GB RAM

### Paso 1: Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

### Paso 2: Preparar el paquete

```bash
cd /tmp
tar xzf fabrica-de-ideas-v1.0.0.tar.gz
cd fabrica-de-ideas-v1.0.0
```

### Paso 3: Configurar variables de entorno

```bash
# Crear archivo .env con secretos generados
cat > .env << EOF
JWT_SECRET=$(openssl rand -hex 32)
PASSWORD_SALT=$(openssl rand -hex 32)
EOF
```

### Paso 4: Construir y ejecutar

```bash
# Construir y ejecutar con Docker Compose
docker compose -f deploy/docker-compose.yml up -d --build

# Ver logs
docker compose -f deploy/docker-compose.yml logs -f
```

### Paso 5: Inicializar la base de datos

```bash
# Ejecutar migración y seed
docker compose -f deploy/docker-compose.yml exec fabrica-de-ideas npx prisma db push
docker compose -f deploy/docker-compose.yml exec fabrica-de-ideas npx tsx prisma/seed.ts
```

### Comandos Docker útiles

```bash
# Ver estado
docker compose -f deploy/docker-compose.yml ps

# Reiniciar
docker compose -f deploy/docker-compose.yml restart

# Detener
docker compose -f deploy/docker-compose.yml down

# Ver logs
docker compose -f deploy/docker-compose.yml logs -f fabrica-de-ideas
```

---

## 📁 Estructura del Paquete

```
fabrica-de-ideas-v1.0.0/
├── app/                           # Código fuente de la aplicación
│   ├── prisma/                    # Esquema de base de datos y seed
│   ├── src/                       # Código fuente Next.js
│   ├── public/                    # Archivos estáticos
│   ├── package.json               # Dependencias
│   ├── next.config.ts             # Configuración Next.js
│   └── .env.production            # Variables de entorno (plantilla)
├── deploy/                        # Archivos de despliegue
│   ├── configs/                   # Configuraciones
│   │   ├── fabrica-de-ideas.service  # Servicio systemd
│   │   ├── nginx-default.conf        # nginx para IP
│   │   └── nginx-domain.conf         # nginx para dominio
│   ├── scripts/                   # Scripts de utilidad
│   │   ├── backup-cron.sh            # Script de respaldo
│   │   └── restore.sh               # Script de restauración
│   ├── Dockerfile                 # Build de Docker
│   ├── docker-compose.yml         # Docker Compose
│   ├── install-hostinger.sh       # Script de instalación
│   ├── package.sh                 # Script de empaquetado
│   └── README.md                  # Esta guía
└── INSTALL.txt                    # Instrucciones rápidas
```

---

## 🔧 Comandos de Administración

### Servicio

```bash
# Ver estado
sudo systemctl status fabrica-de-ideas

# Iniciar
sudo systemctl start fabrica-de-ideas

# Detener
sudo systemctl stop fabrica-de-ideas

# Reiniciar
sudo systemctl restart fabrica-de-ideas

# Ver logs en tiempo real
sudo journalctl -u fabrica-de-ideas -f

# Ver últimas 100 líneas de logs
sudo journalctl -u fabrica-de-ideas -n 100
```

### Base de datos

```bash
# Ubicación de la base de datos
/opt/fabrica-de-ideas/db/custom.db

# Verificar integridad
sqlite3 /opt/fabrica-de-ideas/db/custom.db "PRAGMA integrity_check;"

# Ver tablas
sqlite3 /opt/fabrica-de-ideas/db/custom.db ".tables"

# Contar usuarios
sqlite3 /opt/fabrica-de-ideas/db/custom.db "SELECT COUNT(*) FROM User;"

# Aplicar migraciones (después de actualizar)
cd /opt/fabrica-de-ideas && npx prisma db push
```

### Respaldo y Restauración

```bash
# Ejecutar respaldo manual
sudo bash /opt/fabrica-de-ideas/scripts/backup-cron.sh

# Restaurar desde respaldo
sudo bash /opt/fabrica-de-ideas/deploy/scripts/restore.sh

# Ver respaldos disponibles
ls -lht /opt/fabrica-de-ideas/backups/db_dump_*.sql.gz
```

### nginx

```bash
# Verificar configuración
sudo nginx -t

# Recargar configuración
sudo systemctl reload nginx

# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Ver logs de error
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Proceso de Actualización

### Actualización estándar

1. **Preparar el nuevo paquete** en su máquina local:
   ```bash
   bash deploy/package.sh
   ```

2. **Subir y extraer** en el servidor:
   ```bash
   scp fabrica-de-ideas-v1.0.0.tar.gz root@SU_IP:/tmp/
   cd /tmp && tar xzf fabrica-de-ideas-v1.0.0.tar.gz
   ```

3. **Respaldar la base de datos** actual:
   ```bash
   sudo bash /opt/fabrica-de-ideas/scripts/backup-cron.sh
   ```

4. **Copiar el nuevo código**:
   ```bash
   sudo rsync -a --exclude='node_modules' --exclude='.next' --exclude='db' \
     --exclude='public/uploads' --exclude='backups' --exclude='.env' \
     /tmp/fabrica-de-ideas-v1.0.0/app/ /opt/fabrica-de-ideas/
   ```

5. **Instalar dependencias y construir**:
   ```bash
   cd /opt/fabrica-de-ideas
   sudo npm install --legacy-peer-deps
   sudo npx prisma generate
   sudo npx prisma db push
   sudo npm run build
   ```

6. **Copiar archivos standalone**:
   ```bash
   sudo cp -r .next/static .next/standalone/.next/static
   sudo cp -r public .next/standalone/public
   sudo cp -r prisma .next/standalone/prisma
   sudo cp .env .next/standalone/.env
   sudo mkdir -p .next/standalone/node_modules/.prisma
   sudo cp -r node_modules/.prisma/ .next/standalone/node_modules/.prisma/
   sudo cp -r node_modules/@prisma/ .next/standalone/node_modules/@prisma/
   ```

7. **Reiniciar el servicio**:
   ```bash
   sudo systemctl restart fabrica-de-ideas
   ```

8. **Verificar**:
   ```bash
   sudo systemctl status fabrica-de-ideas
   curl -I http://localhost:3000
   ```

---

## 🔒 Recomendaciones de Seguridad

### 1. Cambiar contraseñas por defecto
Inmediatamente después de la instalación, cambie las contraseñas de todos los usuarios seed a través de la interfaz de administración.

### 2. Proteger el archivo .env
```bash
chmod 600 /opt/fabrica-de-ideas/.env
chown fabrica:fabrica /opt/fabrica-de-ideas/.env
```

### 3. Configurar firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

### 4. Instalar SSL con Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d su-dominio.com
```

### 5. Deshabilitar acceso root por SSH
```bash
# Editar /etc/ssh/sshd_config
PermitRootLogin no
# Crear un usuario con sudo antes de hacer esto
```

### 6. Instalar fail2ban
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 7. Actualizaciones automáticas de seguridad
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 8. Rotar secretos periódicamente
Genere nuevos valores para `JWT_SECRET` y `PASSWORD_SALT` en el archivo `.env`. Tenga en cuenta que cambiar `PASSWORD_SALT` invalidará todas las contraseñas existentes.

---

## 🛠️ Solución de Problemas

### La aplicación no inicia

```bash
# Verificar estado del servicio
sudo systemctl status fabrica-de-ideas

# Ver logs detallados
sudo journalctl -u fabrica-de-ideas -n 100 --no-pager

# Verificar que el puerto 3000 está en uso
sudo ss -tlnp | grep 3000

# Verificar permisos del directorio
ls -la /opt/fabrica-de-ideas/

# Verificar que el archivo .env existe
cat /opt/fabrica-de-ideas/.env
```

### Error 502 Bad Gateway

- La aplicación Node.js no está corriendo:
  ```bash
  sudo systemctl restart fabrica-de-ideas
  ```

- El puerto 3000 no está disponible:
  ```bash
  sudo ss -tlnp | grep 3000
  ```

- nginx no puede conectar al backend:
  ```bash
  curl http://127.0.0.1:3000
  ```

### Error en la base de datos

```bash
# Verificar integridad
sqlite3 /opt/fabrica-de-ideas/db/custom.db "PRAGMA integrity_check;"

# Verificar permisos
ls -la /opt/fabrica-de-ideas/db/

# Corregir permisos
sudo chown -R fabrica:fabrica /opt/fabrica-de-ideas/db/
```

### La aplicación consume demasiada memoria

```bash
# Ver uso de memoria
ps aux --sort=-%mem | head -10

# Limitar memoria de Node.js (editar el servicio systemd)
# Agregar: Environment=NODE_OPTIONS=--max-old-space-size=512
sudo systemctl daemon-reload
sudo systemctl restart fabrica-de-ideas
```

### Archivos subidos no se guardan

```bash
# Verificar permisos del directorio de uploads
ls -la /opt/fabrica-de-ideas/public/uploads/

# Corregir permisos
sudo chown -R fabrica:fabrica /opt/fabrica-de-ideas/public/uploads/
sudo chmod -R 755 /opt/fabrica-de-ideas/public/uploads/
```

### Los respaldos no se ejecutan

```bash
# Verificar crontab
crontab -l

# Ejecutar respaldo manual para probar
sudo bash /opt/fabrica-de-ideas/scripts/backup-cron.sh

# Ver logs de respaldo
cat /opt/fabrica-de-ideas/backups/backup.log
```

### Restablecer la base de datos

> ⚠️ **ADVERTENCIA**: Esto eliminará todos los datos.

```bash
sudo systemctl stop fabrica-de-ideas
sudo rm -f /opt/fabrica-de-ideas/db/custom.db
cd /opt/fabrica-de-ideas
sudo npx prisma db push
sudo npx tsx prisma/seed.ts
sudo systemctl start fabrica-de-ideas
```

---

## 📊 Monitoreo

### Verificar salud de la aplicación

```bash
# Healthcheck simple
curl -s http://localhost:3000 | head -5

# Verificar tiempo de respuesta
curl -o /dev/null -s -w "Tiempo: %{time_total}s\n" http://localhost:3000
```

### Monitorear recursos

```bash
# CPU y memoria del proceso
ps -p $(pgrep -f "server.js" | head -1) -o pid,ppid,%cpu,%mem,etime,cmd

# Espacio en disco
df -h /opt/fabrica-de-ideas/

# Tamaño de la base de datos
du -h /opt/fabrica-de-ideas/db/custom.db

# Tamaño de uploads
du -h /opt/fabrica-de-ideas/public/uploads/
```

---

## 📞 Soporte

Para problemas o consultas:
1. Revise los logs: `sudo journalctl -u fabrica-de-ideas -n 50`
2. Consulte esta guía de solución de problemas
3. Verifique que el sistema cumple con los requisitos mínimos

---

*Fábrica de Ideas v1.0.0 - Guía de Despliegue*
