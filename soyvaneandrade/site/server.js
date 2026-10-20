// Sitio de Vanessa Andrade: sirve la página y envía los formularios al correo.
import express from "express";
import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const TO = process.env.MAIL_TO || "asesorvaneandrade@gmail.com";
const USER = process.env.GMAIL_USER;              // cuenta de Gmail que envía
const PASS = process.env.GMAIL_APP_PASSWORD;      // contraseña de aplicación de Google

// Sin credenciales (desarrollo) los correos se imprimen en consola en lugar de enviarse.
const transport = USER && PASS
  ? nodemailer.createTransport({ service: "gmail", auth: { user: USER, pass: PASS } })
  : nodemailer.createTransport({ jsonTransport: true });

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express.json({ limit: "20kb" }));

// Límite simple: 5 envíos por IP cada 10 minutos.
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 5;
}

const clean = (v, max) => String(v ?? "").replace(/\r/g, "").trim().slice(0, max);
const esc = (v) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

app.post("/api/contact", async (req, res) => {
  const b = req.body || {};
  if (clean(b.website, 200)) return res.json({ ok: true }); // trampa para bots
  if (limited(req.ip)) return res.status(429).json({ ok: false, error: "Demasiados envíos. Intenta más tarde." });

  const d = {
    tipo: clean(b.tipo, 60) || "Contacto",
    nombre: clean(b.nombre, 120),
    telefono: clean(b.telefono, 20).replace(/\D/g, ""),
    correo: clean(b.correo, 160),
    tema: clean(b.tema, 80),
    mensaje: clean(b.mensaje, 3000),
    resumen: clean(b.resumen, 4000),
    novedades: clean(b.novedades, 4),
  };
  if (d.nombre.length < 2 || d.telefono.length < 10) return res.status(400).json({ ok: false, error: "Faltan nombre o WhatsApp." });
  const correoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo);

  const rows = [
    ["Tipo", d.tipo], ["Nombre", d.nombre], ["WhatsApp", d.telefono],
    ["Correo", d.correo], ["Tema", d.tema], ["Mensaje", d.mensaje], ["Resumen", d.resumen], ["Acepta recibir novedades", d.novedades],
  ].filter(([, v]) => v);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n\n") + `\n\nResponder por WhatsApp: https://wa.me/52${d.telefono.slice(-10)}`;
  const html = `<h2 style="font-family:Arial,sans-serif;color:#071C17">${esc(d.tipo)} desde vaneandrade.com</h2>
<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows.map(([k, v]) =>
    `<tr><td style="padding:6px 12px;color:#59675F;vertical-align:top">${esc(k)}</td><td style="padding:6px 12px;white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>
<p style="font-family:Arial,sans-serif"><a href="https://wa.me/52${d.telefono.slice(-10)}">Responder por WhatsApp</a></p>`;

  try {
    const info = await transport.sendMail({
      from: `"Sitio vaneandrade.com" <${USER || "no-reply@vaneandrade.com"}>`,
      to: TO,
      replyTo: correoOk ? `"${d.nombre.replace(/"/g, "")}" <${d.correo}>` : undefined,
      subject: `${d.tipo}: ${d.nombre}${d.tema ? " · " + d.tema : ""}`,
      text, html,
    });
    if (!USER) console.log("[correo de prueba]", info.message.toString());
    res.json({ ok: true });
  } catch (err) {
    console.error("Error al enviar correo:", err.message);
    res.status(502).json({ ok: false, error: "No se pudo enviar." });
  }
});

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"], maxAge: "1h" }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, "public", "index.html")));

export default app;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => console.log(`Sitio en http://localhost:${PORT}`));
}
