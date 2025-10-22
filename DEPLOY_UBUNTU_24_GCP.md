# Guía Completa: Desplegar en Ubuntu 24.04 - Google Cloud VM

Esta guía contiene **todos los comandos exactos** para desplegar tu aplicación React + Express con PostgreSQL y certificado SSL en una máquina virtual de Google Cloud con Ubuntu 24.04.

---

## 📋 PARTE 1: CREAR Y CONFIGURAR LA VM EN GOOGLE CLOUD

### 1.1 Crear la Máquina Virtual

1. Ve a Google Cloud Console: https://console.cloud.google.com/
2. Ve a **Compute Engine** → **VM instances**
3. Haz clic en **"CREATE INSTANCE"**
4. Configura:
   - **Name**: `vaneandrade-server`
   - **Region**: `us-central1` (o el más cercano a México)
   - **Machine type**: `e2-small` (2 vCPUs, 2 GB RAM) - suficiente para empezar
   - **Boot disk**: 
     - Click "CHANGE"
     - Operating system: **Ubuntu**
     - Version: **Ubuntu 24.04 LTS**
     - Boot disk type: **Balanced persistent disk**
     - Size: **20 GB** (mínimo)
   - **Firewall**: 
     - ✅ Allow HTTP traffic
     - ✅ Allow HTTPS traffic
5. Haz clic en **"CREATE"**

### 1.2 Configurar IP Estática (Importante)

```bash
# Desde Google Cloud Console:
# 1. Ve a VPC Network → External IP addresses
# 2. Encuentra la IP de tu VM (tipo "Ephemeral")
# 3. Click en el menú → "Reserve static address"
# 4. Nombre: vaneandrade-ip
# 5. Click "RESERVE"
```

**Anota esta IP - la necesitarás para el DNS**

### 1.3 Configurar Reglas de Firewall Adicionales

```bash
# En Google Cloud Console:
# VPC Network → Firewall → CREATE FIREWALL RULE

# Regla 1: SSH (si no existe)
Nombre: allow-ssh
Targets: All instances in the network
Source IP ranges: 0.0.0.0/0
Protocols and ports: tcp:22

# Regla 2: HTTP
Nombre: allow-http
Targets: All instances in the network
Source IP ranges: 0.0.0.0/0
Protocols and ports: tcp:80

# Regla 3: HTTPS
Nombre: allow-https
Targets: All instances in the network
Source IP ranges: 0.0.0.0/0
Protocols and ports: tcp:443
```

---

## 💻 PARTE 2: CONECTARSE Y CONFIGURAR EL SERVIDOR

### 2.1 Conectarse a la VM

**Opción A: Desde Google Cloud Console (más fácil)**
```bash
# Click en "SSH" junto a tu VM en Compute Engine
```

**Opción B: Desde tu terminal local**
```bash
# Primero, obtener el comando de conexión
# En Google Cloud Console → Compute Engine → VM instances
# Click en "SSH" → "View gcloud command"
# Copiar y pegar en tu terminal
```

### 2.2 Actualizar el Sistema

```bash
# Conectado a tu VM, ejecuta:

# Actualizar lista de paquetes
sudo apt update

# Actualizar todos los paquetes instalados
sudo apt upgrade -y

# Instalar herramientas básicas
sudo apt install -y curl wget git build-essential software-properties-common
```

---

## 🔧 PARTE 3: INSTALAR SOFTWARE NECESARIO

### 3.1 Instalar Node.js 20 LTS

```bash
# Descargar e instalar NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node -v
# Debe mostrar: v20.x.x

npm -v
# Debe mostrar: 10.x.x
```

### 3.2 Instalar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar Nginx
sudo systemctl start nginx

# Habilitar para que inicie automáticamente
sudo systemctl enable nginx

# Verificar estado
sudo systemctl status nginx
# Presiona 'q' para salir

# Verificar que funciona
curl http://localhost
# Deberías ver HTML de la página por defecto de Nginx
```

### 3.3 Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Verificar que esté corriendo
sudo systemctl status postgresql
# Presiona 'q' para salir
```

### 3.4 Instalar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalación
pm2 --version
```

### 3.5 Configurar Firewall UFW

```bash
# Habilitar UFW
sudo ufw enable
# Presiona 'y' para confirmar

# Permitir SSH (¡IMPORTANTE! No te bloquees)
sudo ufw allow 22/tcp
sudo ufw allow ssh

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 'Nginx Full'

# Verificar reglas
sudo ufw status
```

---

## 🗄️ PARTE 4: CONFIGURAR POSTGRESQL

### 4.1 Crear Usuario y Base de Datos

```bash
# Cambiar a usuario postgres
sudo -i -u postgres

# Entrar a PostgreSQL
psql

# Dentro de PostgreSQL, ejecutar estos comandos:
# (Reemplaza con tus propios valores)

CREATE DATABASE vaneandrade_db;

CREATE USER vaneandrade_user WITH ENCRYPTED PASSWORD 'Tu_Password_Seguro_123!';

GRANT ALL PRIVILEGES ON DATABASE vaneandrade_db TO vaneandrade_user;

# En PostgreSQL 15+ necesitas también:
\c vaneandrade_db

GRANT ALL ON SCHEMA public TO vaneandrade_user;

# Salir de PostgreSQL
\q

# Salir del usuario postgres
exit
```

### 4.2 Configurar Acceso Remoto (si es necesario)

```bash
# Editar archivo de configuración
sudo nano /etc/postgresql/16/main/postgresql.conf

# Buscar la línea (Ctrl+W):
#listen_addresses = 'localhost'

# Cambiar a:
listen_addresses = 'localhost'
# (Dejar en localhost si solo accedes desde la misma máquina)

# Guardar: Ctrl+O, Enter, Ctrl+X

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 4.3 Anotar la URL de Conexión

```bash
# Tu DATABASE_URL será:
# postgresql://vaneandrade_user:Tu_Password_Seguro_123!@localhost:5432/vaneandrade_db
```

---

## 📦 PARTE 5: SUBIR Y CONFIGURAR TU APLICACIÓN

### 5.1 Preparar el Código en tu Computadora Local

```bash
# EN TU COMPUTADORA LOCAL (no en el servidor):

# Ir a la carpeta de tu proyecto
cd /ruta/a/tu/proyecto

# Asegurarte de que node_modules esté en .gitignore
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore

# Si usas Git, hacer commit
git add .
git commit -m "Preparar para deploy"
git push origin main
```

### 5.2 Opción A: Clonar desde Git (Recomendado)

```bash
# EN EL SERVIDOR:

# Crear directorio para aplicaciones
mkdir -p ~/apps
cd ~/apps

# Clonar tu repositorio (reemplaza con tu URL)
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git vaneandrade

# Entrar al directorio
cd vaneandrade
```

### 5.2 Opción B: Subir Archivos Manualmente

```bash
# EN TU COMPUTADORA LOCAL:

# Ir a la carpeta padre de tu proyecto
cd /ruta/donde/esta/tu/proyecto

# Comprimir el proyecto
tar -czf vaneandrade.tar.gz --exclude=node_modules --exclude=.git vaneandrade/

# Subir al servidor (reemplaza IP_DE_TU_VM)
gcloud compute scp vaneandrade.tar.gz vaneandrade-server:~/ --zone=us-central1-a

# O si usas SCP normal:
# scp vaneandrade.tar.gz usuario@IP_DE_TU_VM:~/
```

```bash
# EN EL SERVIDOR:

# Descomprimir
cd ~
tar -xzf vaneandrade.tar.gz

# Mover a carpeta apps
mkdir -p ~/apps
mv vaneandrade ~/apps/
cd ~/apps/vaneandrade
```

### 5.3 Instalar Dependencias

```bash
# EN EL SERVIDOR:
cd ~/apps/vaneandrade

# Instalar dependencias
npm install

# Esto puede tardar varios minutos...
```

### 5.4 Crear Archivo .env

```bash
# Crear archivo de variables de entorno
nano .env
```

**Agregar este contenido (reemplaza con tus valores):**

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://vaneandrade_user:Tu_Password_Seguro_123!@localhost:5432/vaneandrade_db
SESSION_SECRET=genera_un_secreto_aleatorio_muy_largo_y_seguro_aqui_12345
```

**Guardar:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 5.5 Ejecutar Migraciones de Base de Datos

```bash
# Ejecutar migraciones
npm run db:push

# Deberías ver mensajes de éxito
```

### 5.6 Compilar el Proyecto

```bash
# Compilar frontend y backend
npm run build

# Verificar que se creó la carpeta dist
ls -la dist/

# Deberías ver archivos compilados
```

---

## ⚙️ PARTE 6: CONFIGURAR PM2

### 6.1 Crear Archivo de Configuración PM2

```bash
cd ~/apps/vaneandrade

# Crear archivo de configuración
nano ecosystem.config.js
```

**Agregar este contenido:**

```javascript
module.exports = {
  apps: [{
    name: "vaneandrade-app",
    script: "./dist/index.js",
    instances: 2,
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: "500M",
    env_production: {
      NODE_ENV: "production",
      PORT: 5000
    },
    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true,
    kill_timeout: 5000,
    listen_timeout: 3000
  }]
};
```

**Guardar:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 6.2 Crear Carpeta de Logs

```bash
mkdir -p ~/apps/vaneandrade/logs
```

### 6.3 Iniciar la Aplicación con PM2

```bash
# Iniciar aplicación
pm2 start ecosystem.config.js --env production

# Ver estado
pm2 list

# Ver logs en tiempo real
pm2 logs vaneandrade-app

# Presiona Ctrl+C para salir de los logs
```

### 6.4 Configurar PM2 para Inicio Automático

```bash
# Generar script de inicio
pm2 startup

# Copiar y ejecutar el comando que PM2 te muestra
# Se verá similar a:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u TU_USUARIO --hp /home/TU_USUARIO

# EJECUTAR ESE COMANDO QUE TE MOSTRÓ

# Guardar configuración actual
pm2 save

# Verificar que se guardó
pm2 list
```

---

## 🌐 PARTE 7: CONFIGURAR NGINX

### 7.1 Crear Archivo de Configuración de Nginx

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/vaneandrade.com
```

**Agregar este contenido (reemplaza vaneandrade.com con tu dominio):**

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name vaneandrade.com www.vaneandrade.com;
    
    # Logs
    access_log /var/log/nginx/vaneandrade.access.log;
    error_log /var/log/nginx/vaneandrade.error.log;
    
    # Proxy a la aplicación Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # Headers WebSocket
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers proxy
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache
        proxy_cache_bypass $http_upgrade;
    }
    
    # Tamaño máximo de archivos subidos
    client_max_body_size 50M;
}
```

**Guardar:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 7.2 Habilitar el Sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/vaneandrade.com /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Deberías ver:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar estado
sudo systemctl status nginx
```

### 7.3 Verificar que Funciona

```bash
# Probar localmente
curl http://localhost

# Deberías ver HTML de tu aplicación

# Probar con la IP pública
curl http://TU_IP_PUBLICA

# También deberías ver tu aplicación
```

---

## 🔐 PARTE 8: CONFIGURAR DNS

### 8.1 Configurar Registro A en tu Proveedor de Dominios

**Ve a donde compraste vaneandrade.com y configura:**

```
Tipo: A
Host/Nombre: @ (o deja en blanco)
Valor/Apunta a: LA_IP_ESTATICA_DE_TU_VM_GCP
TTL: 3600 (o automático)

Tipo: A
Host/Nombre: www
Valor/Apunta a: LA_IP_ESTATICA_DE_TU_VM_GCP
TTL: 3600 (o automático)
```

### 8.2 Esperar Propagación DNS

```bash
# Verificar DNS desde el servidor
nslookup vaneandrade.com

# Debería mostrar tu IP

# O usar dig
dig vaneandrade.com

# Verificar en línea:
# https://dnschecker.org/#A/vaneandrade.com
```

---

## 🔒 PARTE 9: INSTALAR CERTIFICADO SSL (Let's Encrypt)

### 9.1 Instalar Certbot

```bash
# Instalar Certbot con plugin de Nginx
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Obtener Certificado SSL

```bash
# IMPORTANTE: Asegúrate de que el DNS ya esté propagado antes de este paso

# Obtener certificado (modo interactivo)
sudo certbot --nginx -d vaneandrade.com -d www.vaneandrade.com

# Responder las preguntas:
# Email: tu@email.com
# Términos: A (Agree)
# Compartir email: N (No)
# Redirect HTTP a HTTPS: 2 (Sí, recomendado)
```

**Modo no interactivo (alternativa):**
```bash
sudo certbot --nginx \
  -d vaneandrade.com \
  -d www.vaneandrade.com \
  --non-interactive \
  --agree-tos \
  -m tu@email.com \
  --redirect
```

### 9.3 Verificar Certificado

```bash
# Verificar que se instaló
sudo certbot certificates

# Probar renovación automática
sudo certbot renew --dry-run

# Verificar que el timer de renovación esté activo
sudo systemctl status certbot.timer
```

### 9.4 Probar HTTPS

```bash
# Desde el servidor
curl https://vaneandrade.com

# Desde tu navegador:
# https://vaneandrade.com
# Deberías ver el candado 🔒
```

---

## ✅ PARTE 10: VERIFICACIÓN FINAL

### 10.1 Verificar Todos los Servicios

```bash
# PostgreSQL
sudo systemctl status postgresql

# Nginx
sudo systemctl status nginx

# PM2
pm2 status

# UFW Firewall
sudo ufw status
```

### 10.2 Ver Logs

```bash
# Logs de la aplicación (PM2)
pm2 logs vaneandrade-app

# Logs de Nginx (acceso)
sudo tail -f /var/log/nginx/vaneandrade.access.log

# Logs de Nginx (errores)
sudo tail -f /var/log/nginx/vaneandrade.error.log

# Logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### 10.3 Probar la Aplicación

```bash
# Visitar en tu navegador:
https://vaneandrade.com

# Verificar:
# ✅ El sitio carga correctamente
# ✅ Hay candado de seguridad (HTTPS)
# ✅ Todas las funcionalidades funcionan
# ✅ El formulario de contacto funciona
# ✅ Las imágenes cargan
```

---

## 🔄 PARTE 11: ACTUALIZAR LA APLICACIÓN (Deployments Futuros)

### 11.1 Script de Actualización Rápida

```bash
# Crear script de actualización
nano ~/update-app.sh
```

**Contenido del script:**

```bash
#!/bin/bash

echo "🚀 Actualizando aplicación..."

# Ir al directorio
cd ~/apps/vaneandrade

# Hacer backup de .env
cp .env .env.backup

# Obtener últimos cambios
git pull origin main

# Instalar dependencias nuevas (si las hay)
npm install

# Ejecutar migraciones (si las hay)
npm run db:push

# Compilar
npm run build

# Reiniciar aplicación
pm2 reload vaneandrade-app

# Ver estado
pm2 status

echo "✅ Actualización completa!"
```

**Hacer ejecutable:**
```bash
chmod +x ~/update-app.sh
```

### 11.2 Actualizar en el Futuro

```bash
# Conectarte al servidor
gcloud compute ssh vaneandrade-server --zone=us-central1-a

# Ejecutar el script
~/update-app.sh

# Ver logs
pm2 logs vaneandrade-app
```

---

## 🆘 PARTE 12: SOLUCIÓN DE PROBLEMAS

### Error: 502 Bad Gateway

```bash
# Verificar que la app esté corriendo
pm2 status

# Ver logs de la app
pm2 logs vaneandrade-app --lines 50

# Reiniciar la app
pm2 restart vaneandrade-app

# Verificar puerto 5000
sudo netstat -tlnp | grep :5000
```

### Error: No se puede conectar a la base de datos

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Intentar conectar manualmente
psql -U vaneandrade_user -d vaneandrade_db -h localhost

# Verificar .env
cat ~/apps/vaneandrade/.env | grep DATABASE_URL
```

### Error: Certbot falla al generar certificado

```bash
# Verificar que el dominio apunte a tu IP
nslookup vaneandrade.com

# Verificar que Nginx esté corriendo
sudo systemctl status nginx

# Verificar puertos abiertos
sudo ufw status

# Intentar de nuevo
sudo certbot --nginx -d vaneandrade.com -d www.vaneandrade.com
```

### Ver uso de recursos

```bash
# CPU y memoria
htop
# (Instalar con: sudo apt install htop)

# Espacio en disco
df -h

# Uso de memoria
free -h

# Procesos de Node
ps aux | grep node
```

---

## 📊 COMANDOS ÚTILES DE REFERENCIA

### PM2

```bash
pm2 list                          # Ver todas las apps
pm2 logs                          # Ver logs en tiempo real
pm2 logs --lines 200              # Ver últimas 200 líneas
pm2 monit                         # Monitor en tiempo real
pm2 restart vaneandrade-app       # Reiniciar app
pm2 reload vaneandrade-app        # Reload sin downtime
pm2 stop vaneandrade-app          # Detener app
pm2 delete vaneandrade-app        # Eliminar app
pm2 save                          # Guardar configuración
pm2 flush                         # Limpiar logs
```

### Nginx

```bash
sudo nginx -t                     # Probar configuración
sudo systemctl restart nginx      # Reiniciar Nginx
sudo systemctl reload nginx       # Recargar config
sudo systemctl status nginx       # Ver estado
sudo tail -f /var/log/nginx/error.log  # Ver errores
```

### PostgreSQL

```bash
sudo systemctl restart postgresql     # Reiniciar PostgreSQL
sudo systemctl status postgresql      # Ver estado
sudo -u postgres psql                 # Entrar a PostgreSQL
psql -U vaneandrade_user -d vaneandrade_db  # Conectar como usuario
```

### Certbot

```bash
sudo certbot certificates         # Ver certificados
sudo certbot renew               # Renovar manualmente
sudo certbot renew --dry-run     # Probar renovación
sudo certbot delete              # Eliminar certificado
```

---

## 🎯 CHECKLIST FINAL

Antes de considerarlo completo, verifica:

- [ ] VM creada en Google Cloud con IP estática
- [ ] Ubuntu 24.04 actualizado
- [ ] Node.js 20 instalado
- [ ] Nginx instalado y corriendo
- [ ] PostgreSQL instalado y corriendo
- [ ] PM2 instalado
- [ ] Firewall configurado (UFW y GCP)
- [ ] Base de datos creada
- [ ] Código subido al servidor
- [ ] Dependencias instaladas
- [ ] .env configurado
- [ ] Migraciones ejecutadas
- [ ] Proyecto compilado (npm run build)
- [ ] PM2 configurado y app corriendo
- [ ] PM2 configurado para inicio automático
- [ ] Nginx configurado
- [ ] DNS configurado (registro A)
- [ ] DNS propagado
- [ ] Certificado SSL instalado
- [ ] HTTPS funcionando
- [ ] Aplicación accesible en https://vaneandrade.com

---

## 📝 NOTAS FINALES

**Costos de Google Cloud:**
- e2-small: ~$15-25 USD/mes
- IP estática: ~$3 USD/mes
- Total estimado: ~$20-30 USD/mes

**Seguridad adicional recomendada:**
- Cambiar puerto SSH (opcional)
- Instalar fail2ban
- Configurar backups automáticos
- Monitoreo con Uptime checks

**Performance:**
- Considera usar PM2 en modo cluster (ya configurado)
- Implementar cache con Redis (opcional)
- Usar CDN para assets estáticos (opcional)

---

¡Tu aplicación está ahora en producción con HTTPS! 🎉
