# Guía Completa de Despliegue en Ubuntu 22.04

Esta guía te llevará paso a paso para desplegar tu aplicación React + Express en un servidor Ubuntu 22.04 con certificado SSL gratuito.

## 📋 Requisitos Previos

- Servidor Ubuntu 22.04 con acceso SSH
- Dominio apuntando a la IP de tu servidor (registro DNS tipo A)
- Acceso root o sudo

---

## 🚀 Paso 1: Preparación del Servidor

### 1.1 Conectarse al Servidor
```bash
ssh root@TU_IP_SERVIDOR
# o si tienes un usuario diferente:
ssh tu_usuario@TU_IP_SERVIDOR
```

### 1.2 Actualizar el Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Instalar Node.js 20 (LTS)
```bash
# Agregar repositorio de NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node -v   # Debería mostrar v20.x.x
npm -v    # Debería mostrar 10.x.x
```

### 1.4 Instalar Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

### 1.5 Instalar PostgreSQL
```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Verificar que esté corriendo
sudo systemctl status postgresql
```

### 1.6 Instalar PM2 (Gestor de Procesos)
```bash
sudo npm install -g pm2
pm2 --version
```

### 1.7 Instalar Git
```bash
sudo apt install git -y
git --version
```

### 1.8 Configurar Firewall
```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH (¡IMPORTANTE! o te quedarás bloqueado)
sudo ufw allow ssh
sudo ufw allow 22

# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'

# Verificar reglas
sudo ufw status
```

---

## 🗄️ Paso 2: Configurar PostgreSQL

### 2.1 Crear Usuario y Base de Datos
```bash
# Cambiar a usuario postgres
sudo -u postgres psql

# Dentro de PostgreSQL, ejecutar:
CREATE DATABASE tu_nombre_db;
CREATE USER tu_usuario WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE tu_nombre_db TO tu_usuario;
\q
```

### 2.2 Guardar la URL de Conexión
Anota tu URL de conexión, la necesitarás más adelante:
```
postgresql://tu_usuario:tu_password_seguro@localhost:5432/tu_nombre_db
```

---

## 📦 Paso 3: Subir tu Aplicación al Servidor

### 3.1 Crear Directorio para Aplicaciones
```bash
mkdir -p ~/apps
cd ~/apps
```

### 3.2 Opción A: Clonar desde Git (Recomendado)
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 3.2 Opción B: Subir Archivos Manualmente
Desde tu computadora local:
```bash
# Comprimir tu proyecto (excluyendo node_modules)
tar -czf mi-app.tar.gz --exclude=node_modules tu-carpeta-proyecto/

# Subir al servidor
scp mi-app.tar.gz tu_usuario@TU_IP_SERVIDOR:~/apps/

# En el servidor, descomprimir
cd ~/apps
tar -xzf mi-app.tar.gz
cd tu-carpeta-proyecto
```

---

## 🔧 Paso 4: Configurar Variables de Entorno

### 4.1 Crear Archivo .env
```bash
cd ~/apps/tu-proyecto
nano .env
```

### 4.2 Agregar las Variables (ajusta según tu aplicación)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tu_usuario:tu_password_seguro@localhost:5432/tu_nombre_db

# Agrega otras variables que necesites
# Por ejemplo:
# SESSION_SECRET=un_secreto_muy_seguro_y_aleatorio
```

Guarda con `Ctrl+O`, Enter, `Ctrl+X`

---

## 🏗️ Paso 5: Compilar la Aplicación

### 5.1 Instalar Dependencias
```bash
cd ~/apps/tu-proyecto
npm install
```

### 5.2 Ejecutar Migraciones de Base de Datos
```bash
# Asegúrate de que DATABASE_URL esté configurado
npm run db:push
```

### 5.3 Compilar el Proyecto
```bash
npm run build
```

Este comando creará:
- Carpeta `dist/` con el backend compilado
- Frontend compilado (dentro de `dist/public` o similar)

---

## ⚙️ Paso 6: Configurar PM2

### 6.1 Crear Archivo de Configuración PM2
```bash
nano ecosystem.config.js
```

### 6.2 Agregar esta Configuración
```javascript
module.exports = {
  apps: [{
    name: "mi-app",
    script: "./dist/index.js",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    max_memory_restart: "500M",
    env_production: {
      NODE_ENV: "production",
      PORT: 5000
    },
    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true
  }]
};
```

### 6.3 Crear Carpeta de Logs
```bash
mkdir -p logs
```

### 6.4 Iniciar la Aplicación con PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 list
pm2 logs
```

### 6.5 Configurar Inicio Automático al Reiniciar el Servidor
```bash
# Generar script de inicio
pm2 startup

# Copiar y ejecutar el comando que PM2 te muestra
# Se verá similar a:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u tu_usuario --hp /home/tu_usuario

# Guardar la lista de procesos
pm2 save
```

---

## 🌐 Paso 7: Configurar Nginx como Proxy Inverso

### 7.1 Crear Archivo de Configuración de Nginx
```bash
sudo nano /etc/nginx/sites-available/tudominio.com
```

### 7.2 Agregar esta Configuración (SIN SSL por ahora)
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Guarda con `Ctrl+O`, Enter, `Ctrl+X`

### 7.3 Habilitar el Sitio
```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/tudominio.com /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Si todo está bien, reiniciar nginx
sudo systemctl restart nginx
```

### 7.4 Verificar que Funciona
Abre tu navegador y visita: `http://tudominio.com`
Deberías ver tu aplicación funcionando (aunque aún sin HTTPS).

---

## 🔒 Paso 8: Instalar Certificado SSL con Let's Encrypt

### 8.1 Instalar Certbot
```bash
# Instalar Certbot con plugin de Nginx
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 Obtener Certificado SSL
```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

**Sigue las instrucciones:**
1. Ingresa tu correo electrónico
2. Acepta los términos de servicio (Y)
3. Decide si quieres compartir tu email (N es seguro)
4. Certbot detectará automáticamente tu configuración de Nginx
5. Elige la opción 2 para redireccionar HTTP a HTTPS

### 8.3 Verificar Certificado
Visita: `https://tudominio.com`
¡Deberías ver el candado de seguridad! 🔒

### 8.4 Verificar Auto-Renovación
Los certificados de Let's Encrypt duran 90 días. Certbot configura auto-renovación:

```bash
# Probar renovación (sin aplicar cambios)
sudo certbot renew --dry-run

# Ver estado del timer de renovación
sudo systemctl status certbot.timer
```

---

## ✅ Paso 9: Verificación Final

### 9.1 Verificar Aplicación
```bash
# Ver logs de PM2
pm2 logs

# Ver estado de PM2
pm2 status

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### 9.2 Probar tu Sitio
1. Visita `https://tudominio.com`
2. Verifica que el certificado SSL funcione (candado verde)
3. Prueba todas las funcionalidades de tu app

---

## 🔄 Paso 10: Actualizar tu Aplicación (Deploy Futuro)

Cuando hagas cambios y necesites actualizar:

```bash
# 1. Conectarte al servidor
ssh tu_usuario@TU_IP_SERVIDOR

# 2. Ir a tu proyecto
cd ~/apps/tu-proyecto

# 3. Hacer backup (opcional pero recomendado)
pm2 save

# 4. Obtener últimos cambios
git pull origin main
# o sube los archivos nuevos

# 5. Instalar dependencias si hay nuevas
npm install

# 6. Ejecutar migraciones si las hay
npm run db:push

# 7. Compilar
npm run build

# 8. Reiniciar aplicación (sin downtime)
pm2 reload mi-app

# 9. Verificar logs
pm2 logs mi-app
```

---

## 🆘 Solución de Problemas Comunes

### Problema 1: Error 502 Bad Gateway
```bash
# Verificar que la aplicación esté corriendo
pm2 status

# Ver logs de la aplicación
pm2 logs mi-app

# Reiniciar la aplicación
pm2 restart mi-app
```

### Problema 2: No se genera el Certificado SSL
```bash
# Verificar que el dominio apunte a tu servidor
ping tudominio.com

# Verificar DNS (debe mostrar la IP de tu servidor)
nslookup tudominio.com

# Verificar que el puerto 80 esté abierto
sudo ufw status

# Intentar de nuevo
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

### Problema 3: Error de Base de Datos
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar conexión
sudo -u postgres psql -c "SELECT version();"

# Verificar DATABASE_URL en .env
cat ~/apps/tu-proyecto/.env | grep DATABASE_URL
```

### Problema 4: La Aplicación No Inicia
```bash
# Ver logs detallados
pm2 logs mi-app --lines 100

# Intentar correr manualmente para ver errores
cd ~/apps/tu-proyecto
NODE_ENV=production node dist/index.js
```

---

## 📊 Comandos Útiles de PM2

```bash
pm2 list                    # Ver todas las aplicaciones
pm2 logs mi-app            # Ver logs en tiempo real
pm2 monit                  # Monitor en tiempo real
pm2 restart mi-app         # Reiniciar aplicación
pm2 stop mi-app            # Detener aplicación
pm2 delete mi-app          # Eliminar de PM2
pm2 save                   # Guardar configuración actual
pm2 logs --lines 200       # Ver últimas 200 líneas de logs
pm2 flush                  # Limpiar todos los logs
```

---

## 🔐 Mejoras de Seguridad Adicionales (Opcional)

### Cambiar Puerto SSH
```bash
sudo nano /etc/ssh/sshd_config
# Cambiar Port 22 a Port 2222 (o el que prefieras)
sudo systemctl restart sshd

# Actualizar firewall
sudo ufw allow 2222
sudo ufw delete allow 22
```

### Configurar Fail2Ban (protección contra ataques)
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Backups Automáticos de Base de Datos
```bash
# Crear script de backup
nano ~/backup-db.sh
```

Contenido del script:
```bash
#!/bin/bash
BACKUP_DIR=~/backups/postgres
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U tu_usuario tu_nombre_db > $BACKUP_DIR/backup_$DATE.sql
# Mantener solo los últimos 7 backups
ls -t $BACKUP_DIR/backup_*.sql | tail -n +8 | xargs -r rm
```

Hacer ejecutable y agregar a cron:
```bash
chmod +x ~/backup-db.sh
crontab -e
# Agregar esta línea para backup diario a las 2 AM:
0 2 * * * ~/backup-db.sh
```

---

## 📞 Notas Finales

- **Certificados SSL**: Se renuevan automáticamente cada 60 días
- **PM2**: Reinicia automáticamente tu app si falla
- **Nginx**: Sirve como proxy inverso y balanceador de carga
- **PostgreSQL**: Base de datos en producción

**¡Tu aplicación ya está en producción con HTTPS! 🎉**

Si tienes problemas, revisa los logs:
- PM2: `pm2 logs`
- Nginx: `sudo tail -f /var/log/nginx/error.log`
- PostgreSQL: `sudo tail -f /var/log/postgresql/postgresql-14-main.log`
