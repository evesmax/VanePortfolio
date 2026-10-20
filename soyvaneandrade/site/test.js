import app from "./server.js";
const srv = app.listen(0); const base = `http://localhost:${srv.address().port}`;
const post = (b) => fetch(base + "/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => [r.status, await r.json()]);
const results = [
  ["valido", await post({ tipo: "Contacto", nombre: "Ana Pérez", telefono: "3312345678", correo: "ana@example.com", tema: "Modalidad 40", mensaje: "Hola <b>" })],
  ["sin tel", await post({ nombre: "Ana", telefono: "12" })],
  ["bot", await post({ nombre: "x", telefono: "1", website: "spam" })],
  ["pagina", [ (await fetch(base + "/")).status ]],
];
for (const r of results) console.log(r[0], JSON.stringify(r[1]));
srv.close();
