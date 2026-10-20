# Soy Vane Andrade — sitio de asesoría financiera

Destino: **vaneandrade.com** (la fotografía pasa a **fotos.vaneandrade.com**).
Esta carpeta vive temporalmente en la rama `soyvaneandrade` de VanePortfolio,
hasta que exista el repositorio `evesmax/SoyVaneAndrade`; entonces se mueve su contenido a la raíz de ese repo.

- `index.src.html` — fuente de la página (las imágenes van como marcadores `{{...}}`).
- `photos/` — fotos de fondo; `img/` — retrato y logo.
- `python3 build.py` — genera `site/public/` (y un `index.html` de vista previa con todo embebido).
- `site/` — lo que se publica: servidor Node (`server.js`) que sirve la página y envía los formularios por correo. Ver `site/README.md`.
