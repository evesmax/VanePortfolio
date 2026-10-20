# vaneandrade.com — sitio de asesoría financiera

Página en `public/index.html`; `server.js` la sirve y envía los formularios a asesorvaneandrade@gmail.com.

## Activar el envío de correos (una sola vez)
1. En la cuenta de Google que enviará los correos, activa la verificación en dos pasos.
2. Crea una contraseña de aplicación: myaccount.google.com → Seguridad → Contraseñas de aplicaciones.
3. En Cloud Run (servicio `vanefinanzas`, proyecto `qss-vaneandrade`) agrega las variables:
   - `GMAIL_USER` = la cuenta que envía (puede ser asesorvaneandrade@gmail.com)
   - `GMAIL_APP_PASSWORD` = la contraseña de aplicación (mejor como secreto de Secret Manager)
   - `MAIL_TO` (opcional) = a dónde llegan los mensajes; por defecto asesorvaneandrade@gmail.com

Sin esas variables el sitio funciona, pero los mensajes solo se imprimen en los registros y no llegan al correo.

## Probar en local
    npm install
    npm test     # prueba el envío con un transporte falso
    npm start    # http://localhost:8080

## Dominios
- `vaneandrade.com` → este servicio (`vanefinanzas`).
- `fotos.vaneandrade.com` → el servicio actual de fotografía (`vaneportfolio`).
