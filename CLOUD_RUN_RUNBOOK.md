# Runbook de migración a Cloud Run

Producto de migrar `wwwqss` (9 sep 2026) y `qssintelligence` (11-12 sep 2026) de
Replit a Google Cloud Run. Complementa el plan de fases de migración
(cost/priorización) con los problemas técnicos reales que aparecieron al
ejecutarlas. **Actualiza este archivo con cada proyecto nuevo** — cópialo al repo
del siguiente proyecto a migrar y agrega lo que encuentres ahí.

Proyectos en el portafolio que comparten este mismo stack (Vite + Express + TS +
Drizzle + Neon): wwwqss (migrado), qssintelligence (migrado), qnexusapp (migrado),
Rentia Manager, Trooxer, qfacturahub, HolaKura, QPulseMes, NexusTransporte, qcampusone.

**Diferencia clave entre las dos migraciones hechas:** wwwqss no tenía object
storage propio de Replit; qssintelligence sí (en uso real), lo que obligó a
reescribir el cliente de storage además de migrar datos y base de datos. Los
próximos cuatro proyectos con storage (HolaKura, QPulseMes, NexusTransporte,
qcampusone) van a necesitar el mismo tratamiento — ver el Paso 5bis.

---

## Paso 0 — Verificación de dependencias ocultas (hacer PRIMERO, siempre)

El hallazgo más caro de toda la migración: que el código no tenga imports de Replit
**no significa** que los servicios que usa sean tuyos.

- [ ] **¿Quién es dueño de la base de datos?** Entra a console.neon.tech con TU
      cuenta y busca el hostname exacto de `DATABASE_URL`. Si no aparece, la creó
      Replit a su nombre — migrarla es obligatorio antes de apagar Replit, no
      opcional después.
- [ ] **¿Usa `@replit/object-storage`?** Mismo problema de ownership, con archivos
      en vez de filas. Confirma dónde vive el bucket real antes de asumir nada.
- [ ] **¿Hay imports de paquetes de desarrollo a nivel de módulo?**
      `grep -rn "from \"vite\"" server/` — si algo importa `vite` fuera de un
      bloque condicional de desarrollo, el build de producción lo va a necesitar
      igual, aunque nunca se ejecute esa rama.
- [ ] **¿Hay clientes de servicios externos instanciados fuera de una función?**
      `grep -rn "^const.*= new " server/` — un `new GoogleGenAI(...)` a nivel de
      módulo truena el arranque si falta la key, aunque la ruta que lo usa nunca
      se llame.
- [ ] **¿El puerto está hardcodeado?** `grep -n "port" server/index.ts` — si no
      lee `process.env.PORT`, no toques el código: usa `--port=N` en el deploy de
      Cloud Run.
- [ ] **¿Qué session store usa?** Si es `memorystore` (memoria), fija
      `--max-instances=1` en Cloud Run en vez de reescribir código.
- [ ] **¿Existe `.gitignore`?** Créalo *antes* de generar cualquier archivo local
      con credenciales.
- [ ] **¿El schema de Drizzle/Neon que existe en el repo está realmente
      conectado al código que corre?** Que exista `shared/schema.ts` +
      `drizzle.config.ts` (y que este último exija `DATABASE_URL`) no prueba
      que `server/storage.ts` use Postgres de verdad — puede ser una
      implementación 100% `MemStorage` (Maps en memoria) que nunca importa un
      cliente de DB, con el schema ahí solo para un `db:push` que nadie corre
      en producción. `grep -rn "drizzle-orm\|@neondatabase" server/storage.ts`
      — si no aparece nada, no hay DB real, y por lo tanto tampoco hay "dueño
      de base de datos" que migrar en el Paso 9 (aplica igual el resto de
      pasos, pero saltas 5 y 9 por completo). Visto en VanePortfolio: `npm run
      db:push` habría fallado sin `DATABASE_URL`, pero el server nunca lo
      necesita porque `storage.ts` es puro `MemStorage` — el efecto real es
      que cualquier dato que la app "guarda" (ej. envíos de un formulario) se
      pierde en cada scale-to-zero, sin que el código lo declare en ningún
      lado. Confirmar con el usuario si eso es aceptable antes de migrar, no
      asumir que hay que arreglarlo ni que está bien dejarlo así.
- [ ] **¿El código hardcodea nombres de modelos de IA?**
      `grep -rn "gemini-\|gpt-\|claude-" server/` — los proveedores retiran
      modelos con el tiempo (nos pasó con `gemini-2.0-flash` a mitad de esta
      migración: 404 `is no longer available` en producción). Si vas a tocar
      ese archivo de todos modos, aprovecha para hacerlo configurable
      (constante centralizada + fallback si el modelo elegido ya no existe)
      en vez de solo cambiar el string por el que funciona hoy.
- [ ] **¿Las dependencias que vas a instalar corren en el Node del Dockerfile?**
      Antes de dar por bueno un `npm install <paquete-nuevo>` a mitad de la
      migración (ej. reemplazar un cliente de Replit), revisa su `engines` en
      `node_modules/<paquete>/package.json` — `@google-cloud/storage@8` exige
      Node ≥22, y el Dockerfile de este runbook usaba `node:20-alpine`. `npm
      ci` solo *advierte* (`EBADENGINE`), no falla, así que el build pasa
      igual y el problema queda invisible hasta que ese código realmente se
      ejecuta. Ajusta el `FROM` del Dockerfile a la versión que pida el
      paquete más nuevo.
- [ ] **¿Hay rutas que llaman APIs de pago sin autenticación?** En Replit el
      tráfico era mínimo y conocido; en Cloud Run con `--allow-unauthenticated`
      cualquiera en internet puede pegarle. Busca rutas que llamen a un LLM,
      hagan upload a storage, o cualquier otra cosa facturable, y confirma que
      tengan el middleware de auth de la app — si no lo tienen, es una vía de
      abuso anónimo contra tu presupuesto real. Se encontró uno así en
      qssintelligence (`/api/transcribe` sin `authMiddleware`). En HolaKura
      apareció una ruta similar (`/api/generate-image`) pero resultó ser
      código muerto — nunca se monta en `server/index.ts` — confirmar siempre
      con un grep de dónde se registra la ruta antes de asumir que está viva.
- [ ] **¿Usa el "AI Integrations" de Replit (Gemini/otros) en vez de una API
      key propia?** `grep -rn "AI_INTEGRATIONS_" server/` — este proxy
      (`baseUrl` + `apiKey` apuntando a `AI_INTEGRATIONS_GEMINI_BASE_URL`) solo
      funciona dentro de Replit. Hay que generar una API key real (Google AI
      Studio o Vertex AI) y quitar el `httpOptions.baseUrl`. Visto en HolaKura
      en 6 sitios (`chat/routes.ts`, `image/client.ts`, 4 rutas en
      `routes.ts`) — aprovecha el cambio para centralizar el cliente en un solo
      módulo en vez de reinstanciar `GoogleGenAI` en cada ruta.
- [ ] **¿Usa el conector genérico de terceros de Replit para credenciales (no
      el proxy de IA)?** `grep -rn "REPLIT_CONNECTORS_HOSTNAME\|REPL_IDENTITY\|WEB_REPL_RENEWAL"
      server/` — distinto de `AI_INTEGRATIONS_*`: esta es la plomería genérica
      de Replit para conectores de terceros (también se usa para conectores de
      Google/Slack en otros proyectos), que trae la API key real desde el
      backend de conexiones de Replit en runtime. Solo funciona dentro de
      Replit. Visto en Trooxer para el envío de email vía Resend
      (`REPLIT_CONNECTORS_HOSTNAME` + `REPL_IDENTITY`/`WEB_REPL_RENEWAL`
      resolviendo la `RESEND_API_KEY` real). Reemplázalo leyendo la key
      directo del entorno (ej. `RESEND_API_KEY`); si el usuario todavía no
      tiene una key real, está bien dejar una falla controlada (log +
      resultado de error) en vez de bloquear el resto de la migración por eso.
- [ ] **¿El frontend usa alias de Vite (`resolve.alias` en `vite.config.ts`)
      que apunten a un directorio de assets?** Confirma que `.dockerignore`
      no excluya ese directorio — el build de Vite corre **en build time**
      dentro del Dockerfile, así que si el directorio falta en el contexto,
      `vite build` falla con `ENOENT` dentro del stage builder aunque esos
      archivos nunca terminen en la imagen final de runtime. Visto en Trooxer
      con `attached_assets/` (alias `@assets`) excluido por `.dockerignore` —
      ver Paso 3.
- [ ] **¿`npm ci` corre limpio desde cero, sin `node_modules` ni lockfile viejo en
      caché?** `rm -rf node_modules package-lock.json && npm install` una vez al
      inicio. En qnexusapp esto reveló un bug de npm/arborist (`Cannot read
      properties of null (reading 'edgesOut')`) resolviendo peer deps opcionales
      de `vitest` — rompía **cualquier** install limpio, no solo el de Docker, y
      no tenía nada que ver con la migración en sí. Si pasa: agregar
      `legacy-peer-deps=true` a un `.npmrc` (no solo pasar el flag a mano, porque
      `npm ci` en el Dockerfile necesita el mismo modo de resolución con el que
      se generó el lockfile) y regenerar el lockfile. Sin esto, el Paso 3
      (Dockerfile) falla desde el primer `npm ci` y parece un problema del
      Dockerfile cuando no lo es.
- [ ] **¿Hay un flag `isProduction` basado en `REPLIT_DEPLOYMENT` o
      `REPLIT_DOMAINS`?** `grep -rn "REPLIT_DEPLOYMENT\|REPLIT_DOMAINS\|REPL_IDENTITY\|WEB_REPL_RENEWAL" server/`
      — cualquier lógica que decida "soy producción" con una variable que solo
      existe en Replit se evalúa **siempre a `false`** en Cloud Run, aunque
      `NODE_ENV=production` esté seteado. En HolaKura esto hacía que Stripe
      usara las keys de test y la verificación de webhook equivocada en
      producción real (`stripeClient.ts`, `webhookHandlers.ts`). Cambiar la
      condición a `process.env.NODE_ENV === "production"` — normalmente no
      rompe el comportamiento en Replit porque `npm run start` ya setea
      `NODE_ENV=production` ahí también.
- [ ] **¿Hay `cron.schedule()` / trabajos periódicos en memoria del proceso
      (`node-cron`, `setInterval`, etc.)?** `grep -rn "node-cron\|cron\.schedule"
      server/`. Con `--min-instances=0` Cloud Run apaga el contenedor entero
      cuando no hay tráfico HTTP — los timers en memoria mueren con el
      proceso y **no hay nada que los reviva por horario**, solo una petición
      real. Si la lógica que el cron protege tiene un camino "on-read"
      alternativo (ver Trooxer: `AuctionService.closeIfExpired` se llama
      desde las rutas cada vez que se toca una subasta, y el cron de 30 min
      queda solo como red de respaldo para lo que nadie visita), el riesgo es
      bajo. Si NO lo tiene (ver Trooxer: `ExceptionHandlerService.checkDelays`,
      sin equivalente on-read) el trabajo simplemente no corre durante
      ventanas sin tráfico, sin error visible — riesgo real si depende de
      alertar en (casi) tiempo real. No es un problema nuevo de Cloud
      Run si el `deploymentTarget` de Replit ya era `autoscale` (también
      apaga instancias inactivas) — vale la pena decirlo así al usuario en
      vez de presentarlo como una regresión de la migración. Arreglo
      correcto cuando haga falta: mover el trabajo a **Cloud Scheduler**
      pegándole a un endpoint HTTP protegido — esa petición externa es lo
      que despierta el contenedor en cero. `--min-instances=1` también lo
      arregla pero paga 24/7, contradice el objetivo de costo de
      `min-instances=0`.

---

## Paso 1 — Herramientas locales

```bash
brew install --cask google-cloud-sdk
gcloud auth login
```

Si el Paso 0 encontró que la base de datos es de Replit (va a serlo casi
siempre), instala también el cliente de Postgres — lo vas a necesitar en el
Paso 9:

```bash
brew install libpq
# libpq queda sin enlazar al PATH por defecto (no reescribe el psql del sistema);
# usa la ruta completa o enlázalo tú mismo:
#   $(brew --prefix libpq)/bin/pg_dump, pg_restore, psql
```

> **Gotcha:** Docker Desktop vía `brew install --cask docker` falla pidiendo
> contraseña interactiva de sudo. Instálalo manual desde docker.com (el `.dmg`,
> arrastrar a Aplicaciones, abrir y aceptar permisos ahí).

> **Gotcha:** el navegador no se abre solo en `gcloud auth login` dentro de un
> entorno de agente. Copia la URL impresa y ábrela tú mismo — el redirect a
> `localhost` lo captura igual el proceso que ya está corriendo.

---

## Paso 2 — Proyecto GCP: presupuesto antes que nada

Orden exacto, no cambiarlo: crear proyecto → enlazar billing → **presupuesto** →
recién ahí habilitar APIs que cobran.

```bash
gcloud projects create qss-<NOMBRE> --name="QSS - <NOMBRE>"
gcloud config set project qss-<NOMBRE>
gcloud billing projects link qss-<NOMBRE> --billing-account=<ID>

gcloud services enable billingbudgets.googleapis.com --project=qss-<NOMBRE>
gcloud billing budgets create --billing-account=<ID> \
  --display-name="<NOMBRE> - presupuesto mensual" \
  --budget-amount=10 --filter-projects=projects/qss-<NOMBRE> \
  --threshold-rule=percent=0.5 --threshold-rule=percent=0.9 --threshold-rule=percent=1.0

gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com \
  iamcredentials.googleapis.com --project=qss-<NOMBRE>
gcloud config set run/region us-central1
```

> **Gotcha:** `billingbudgets.googleapis.com` no está habilitada por default — el
> primer intento de crear presupuesto falla y da la URL para habilitarla.
> Habilítala y reintenta.

> **Gotcha:** `--budget-amount=N` se interpreta en la moneda nativa de la
> cuenta de billing, no en USD — no hay flag `--currency-code` en este
> `gcloud`. Antes de fijar el monto, `gcloud billing accounts describe
> <ID>` (o `gcloud billing budgets list --billing-account=<ID>` para ver
> qué usaron proyectos anteriores) para saber en qué moneda estás. Pasó en
> esta migración: la cuenta está en MXN, así que `--budget-amount=10` creó
> un presupuesto de 10 MXN (~$0.50 USD) en vez de "$10" — tan bajo que
> dispara las 3 alertas de inmediato con cualquier uso real. wwwqss y
> qss-intelligence quedaron igual de bajos (10 MXN) sin que nadie lo
> notara; HolaKura sí usó 200 MXN. Confirmar el monto real con el usuario
> en la moneda de la cuenta, no asumir que el número es USD.

---

## Paso 3 — Dockerfile: los dos errores que sí importan

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
# Runtime env required (ajustar a lo que tu app realmente necesite):
# DATABASE_URL, SESSION_SECRET, y cualquier API key / GCS_BUCKET_NAME que use
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

> **CRÍTICO:** `ENV NODE_ENV=production` antes de `npm ci` hace que npm omita
> devDependencies, sin importar si quitaste `--omit=dev` del comando. Va
> *después* del install, nunca antes — este orden causó el primer crash real
> (`Cannot find package 'vite'`).

> **Gotcha:** si el build corre en Mac Apple Silicon, la imagen sale en `arm64` y
> Cloud Run la rechaza (`must support amd64/linux`). Construir siempre con
> `docker buildx build --platform linux/amd64 ...`.

> **Gotcha:** `node:20-alpine` es el punto de partida, no un valor fijo. Si
> durante la migración instalas una dependencia nueva (ej. reemplazar
> `@replit/object-storage` por `@google-cloud/storage`), revisa su `engines`
> — puede exigir una versión de Node mayor a la del Dockerfile. `npm ci` no
> falla por esto (solo un warning `EBADENGINE`), así que el build pasa limpio
> y el problema solo aparece cuando ese código corre de verdad en producción.
> Súbele la versión al `FROM` en ambos stages si hace falta (ver Paso 0).

> **Gotcha:** no excluyas del `.dockerignore` un directorio de assets que el
> frontend referencia vía alias de Vite (`resolve.alias` en `vite.config.ts`).
> En Trooxer, `.dockerignore` excluía `attached_assets/` completo (parece
> razonable — no hace falta en el runtime final), pero el frontend importa
> imágenes de ahí vía el alias `@assets` **en build time**: `vite build`
> corre dentro del stage `builder`, así que si el directorio no está en el
> contexto de build, falla con `ENOENT` ahí mismo. El build multi-stage solo
> copia `dist` al final, así que incluir el directorio en el contexto no
> cuesta nada en la imagen de runtime — no hay razón real para excluirlo.

---

## Paso 4 — Prueba local antes de tocar la nube

```bash
docker build -t <app>:local .
docker run -d --name <app>-test \
  --env-file conn.env.docker \
  -e SESSION_SECRET="$(openssl rand -base64 32)" \
  -p 5050:5000 \
  <app>:local
docker logs <app>-test
```

Si arranca y responde 200 en `/`, ya validaste el build completo gratis, antes de
gastar un solo segundo de Cloud Run.

> **Gotcha:** un 200 en `/` solo prueba que el servidor arrancó — no que la
> conexión a la base de datos funciona. Pega también a una ruta que sí
> consulte la DB con un dato que sabes que no existe (ej. login con un
> usuario inventado): si responde 401/404 en vez de 500, la conexión real
> funciona de punta a punta. Barato de verificar aquí, caro de descubrir ya
> en Cloud Run.

---

## Paso 5 — Secrets + permisos mínimos

```bash
grep "^DATABASE_URL=" conn.env.docker | cut -d= -f2- | \
  gcloud secrets create DATABASE_URL --data-file=- --project=qss-<NOMBRE>

PROJECT_NUMBER=$(gcloud projects describe qss-<NOMBRE> --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" --project=qss-<NOMBRE>
```

Extrae valores directo del archivo local con `grep | cut` hacia un pipe — nunca
los imprimas en pantalla para copiarlos a mano.

---

## Paso 5bis — Object Storage de Replit (si el Paso 0 lo detectó en uso real)

`@replit/object-storage` autentica vía el sidecar de Replit — **no funciona
fuera de Replit, bajo ninguna circunstancia**. No es solo migrar los datos:
hay que reescribir el cliente. El bucket real detrás es GCS, así que el
reemplazo es directo con `@google-cloud/storage` (Application Default
Credentials, sin manejar keys a mano):

```typescript
import { Storage } from "@google-cloud/storage";

export class ObjectNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ObjectNotFoundError';
  }
}

export class ObjectStorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) throw new Error("GCS_BUCKET_NAME must be set");
    this.bucketName = bucketName;
    this.storage = new Storage();
  }

  private get bucket() {
    return this.storage.bucket(this.bucketName);
  }

  async uploadFromBuffer(objectPath: string, buffer: Buffer): Promise<void> {
    await this.bucket.file(objectPath).save(buffer);
  }

  async downloadAsBuffer(objectPath: string): Promise<Buffer> {
    const file = this.bucket.file(objectPath);
    const [exists] = await file.exists();
    if (!exists) throw new ObjectNotFoundError(`Object not found: ${objectPath}`);
    const [buffer] = await file.download();
    return buffer;
  }

  async deleteObject(objectPath: string): Promise<void> {
    await this.bucket.file(objectPath).delete({ ignoreNotFound: true });
  }

  async listFiles(prefix?: string): Promise<string[]> {
    const [files] = await this.bucket.getFiles(prefix ? { prefix } : {});
    return files.map((f) => f.name);
  }
}
```

Mantén el mismo nombre de clase y firmas de métodos que el original — así el
código que lo consume (rutas) no necesita cambios.

**Crear el bucket destino y darle acceso a Cloud Run:**

```bash
gcloud storage buckets create gs://<app>-storage \
  --project=qss-<NOMBRE> --location=us-central1 --uniform-bucket-level-access

PROJECT_NUMBER=$(gcloud projects describe qss-<NOMBRE> --format="value(projectNumber)")
gcloud storage buckets add-iam-policy-binding gs://<app>-storage \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

**Migrar los objetos existentes — corre DENTRO del Shell de Replit**, porque
solo ahí `@replit/object-storage` tiene credenciales válidas:

```bash
gcloud iam service-accounts create migration-temp --project=qss-<NOMBRE>
gcloud storage buckets add-iam-policy-binding gs://<app>-storage \
  --member="serviceAccount:migration-temp@qss-<NOMBRE>.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
gcloud iam service-accounts keys create /tmp/migration-key.json \
  --iam-account=migration-temp@qss-<NOMBRE>.iam.gserviceaccount.com
```

Pega el contenido completo de `/tmp/migration-key.json` como Secret de Replit
(`GCP_MIGRATION_KEY_JSON`) — **y reinicia el Repl completo después de
guardarlo**, no solo la pestaña del Shell (ver gotcha abajo). Luego, en el
Shell de Replit, crea temporalmente `migrate-storage.ts`:

```typescript
import { Client } from "@replit/object-storage";
import { Storage } from "@google-cloud/storage";
import fs from "fs";

fs.writeFileSync("/tmp/key.json", process.env.GCP_MIGRATION_KEY_JSON!);
const dst = new Storage({ keyFilename: "/tmp/key.json" });
const dstBucket = dst.bucket("<app>-storage");
const src = new Client();

async function main() {
  const list = await src.list();
  if (!list.ok) throw new Error(list.error.message);
  for (const obj of list.value) {
    const result = await src.downloadAsBytes(obj.name);
    if (!result.ok) { console.error("skip", obj.name, result.error); continue; }
    await dstBucket.file(obj.name).save(result.value[0]);
    console.log("copied", obj.name);
  }
  console.log(`done: ${list.value.length} objects`);
}
main();
```

```bash
npx tsx migrate-storage.ts
```

**Verificar conteo en ambos lados** (no dar por buena la migración solo
porque terminó sin errores — mismo principio que el Paso 9 con la DB):

```bash
# en Replit Shell: new Client().list() y contar .value.length
# local:
gcloud storage ls "gs://<app>-storage/**" | wc -l
```

**Limpieza:** borrar la key local, la service account temporal, y el Secret
`GCP_MIGRATION_KEY_JSON` + el script `migrate-storage.ts` de Replit.

```bash
gcloud iam service-accounts keys delete <KEY_ID> \
  --iam-account=migration-temp@qss-<NOMBRE>.iam.gserviceaccount.com
gcloud iam service-accounts delete migration-temp@qss-<NOMBRE>.iam.gserviceaccount.com
rm /tmp/migration-key.json
```

> **Gotcha:** un Secret nuevo en Replit no siempre llega al entorno de una
> pestaña de Shell ya abierta. Si `env | cut -d= -f1 | grep <NOMBRE_SECRET>`
> no muestra nada después de guardarlo, reinicia el Repl completo (no solo
> abras una pestaña nueva) y vuelve a intentar.

> **Gotcha:** `gcloud iam service-accounts keys list` para la SA temporal puede
> mostrar dos keys aunque solo hayas creado una — GCP genera una key
> Google-managed automáticamente que no puedes borrar (`keys delete` da
> `NOT_FOUND`) y no es un problema. Filtra con `--managed-by=user` para ver
> solo la que de verdad creaste y necesitas limpiar.

En el deploy (Paso 6), agrega `GCS_BUCKET_NAME` como env var (no es
secreto, no hace falta Secret Manager para esto):

```bash
--set-env-vars="GCS_BUCKET_NAME=<app>-storage"
```

---

## Paso 6 — Deploy a Cloud Run

```bash
gcloud run deploy <app> \
  --image=us-central1-docker.pkg.dev/qss-<NOMBRE>/<app>/web:v1 \
  --region=us-central1 --port=5000 --allow-unauthenticated \
  --min-instances=0 --max-instances=1 --memory=512Mi --cpu=1 \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,SESSION_SECRET=SESSION_SECRET:latest"
```

`min-instances=0` (paga solo si hay visitas) + `max-instances=1` (evita el
problema de sesiones en memoria sin tocar código) es el default correcto para
cualquiera de estos proyectos de tráfico bajo.

---

## Paso 7 — Dominio y DNS

> **CRÍTICO:** antes de cambiar cualquier registro, `gcloud dns record-sets list
> --zone=<zona>` y busca **registros MX**. Si hay correo (Google Workspace), esos
> registros no se tocan bajo ninguna circunstancia.

La zona DNS puede no estar en el proyecto GCP recién creado — búscala en *todos*
los proyectos existentes: `gcloud dns managed-zones list --project=<cada uno>`.

1. **Antes de correr `gcloud domains verify`**, revisa si el dominio ya está
   verificado en tu cuenta: `gcloud domains list-user-verified`. Si ya
   aparece (normal si administras varios proyectos del mismo dominio), te
   saltas todo el paso de TXT nuevo. Si no aparece, recién ahí `gcloud
   domains verify <dominio>` → agregar el TXT que dé Search Console **sin
   borrar** el TXT que ya exista (un nombre puede tener varios valores TXT a
   la vez).
2. Crear el mapeo: `gcloud beta run domain-mappings create --service=<app>
   --domain=<dominio> --region=us-central1` → da las IPs/CNAME exactos que pide.
3. Apex (dominio raíz): registros **A + AAAA**. Subdominios (`www`): **CNAME** a
   `ghs.googlehosted.com.`
4. Aplicar los registros nuevos.

> **Gotcha:** un CNAME no puede coexistir con ningún otro tipo de registro en el
> mismo nombre. Si el subdominio ya tiene un TXT de verificación de Replit, hay
> que quitarlo en la misma transacción en la que se agrega el CNAME, o la
> transacción entera falla.

> **Gotcha:** agregar el TXT de `google-site-verification` a la zona **no** es
> suficiente por sí solo, aunque `dig` confirme que ya propagó — Google no
> re-chequea solo. Hay que volver a la pestaña de Search Console y darle clic a
> "Verificar" ahí; recién eso hace que aparezca en `gcloud domains
> list-user-verified`. En qnexusapp el primer token generado quedó huérfano
> (el usuario reinició el flujo de Search Console y generó un token nuevo) —
> si el token que agregaste no verifica después de un rato, pide uno nuevo en
> vez de seguir reintentando con el viejo. Confirma también que sea la misma
> cuenta de Google que usa `gcloud` (`gcloud config get-value account`) y que
> el tipo de propiedad en Search Console sea "Dominio", no "Prefijo de URL".

> **Gotcha:** justo después de emitir el certificado es normal ver fallas SSL
> intermitentes por unos minutos mientras el borde global de Google propaga el
> cert a todos sus nodos. No es un error de configuración — esperar y reintentar.

> **Gotcha:** si el `curl` del sistema en Mac muestra `SSL_ERROR_SYSCALL` de
> forma intermitente, es LibreSSL negociando HTTP/2 de forma inconsistente — un
> problema del cliente local, no del servidor. Probar con `--http1.1` o
> simplemente reintentar.

En vez de reintentar el `curl` a mano cada rato, esperar el certificado con un
poll en background que avisa solo cuando esté listo:

```bash
until [ "$(gcloud beta run domain-mappings describe --domain=<dominio> \
  --region=us-central1 --project=qss-<NOMBRE> --format=json 2>/dev/null | \
  jq -r '.status.conditions[] | select(.type=="Ready") | .status')" = "True" ]; do
  sleep 20
done
echo "CERT_READY"
```

---

## Paso 8 — CI/CD sin llaves estáticas

Workload Identity Federation en vez de exportar una llave JSON de service
account — GitHub se autentica por cada corrida, sin secreto de larga duración
que se pueda filtrar.

```bash
gcloud iam service-accounts create github-deployer --project=qss-<NOMBRE>
# roles: run.developer, artifactregistry.writer, serviceAccountUser (sobre la SA de runtime)

gcloud iam workload-identity-pools create github-pool --location=global
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global --workload-identity-pool=github-pool \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="attribute.repository=='<usuario>/<repo>'" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

> **Gotcha:** una service account recién creada tarda unos segundos en
> propagarse — si el siguiente `add-iam-policy-binding` falla con "does not
> exist", solo reintentar.

El workflow de GitHub Actions solo necesita re-especificar `--image` en cada
deploy — Cloud Run conserva la config previa (puerto, secrets, min/max
instancias) de la revisión anterior.

---

## Paso 9 — Migrar el dueño de la base de datos

Si el Paso 0 encontró que la base es de Replit, no tuya, esto no es opcional.

**Antes de crear la base nueva en console.neon.tech:** al copiar el connection
string, Neon ofrece dos: el **pooled** (hostname con `-pooler`, el que
recomienda por default) y el **directo**. Usa el **directo** como `DST_URL` —
en un proyecto Neon nuevo el pooled puede traer el `search_path` vacío
(visto con Postgres 18) y además rechaza el parámetro `options`, así que ni
siquiera se puede forzar el `search_path` por ese lado. El directo no tiene
ninguno de los dos problemas y para una app de tráfico bajo como estas no
hay downside real en usarlo como `DATABASE_URL` de producción.

```bash
pg_dump "$SRC_URL" -Fc --no-owner --no-acl -f /tmp/backup.dump
pg_restore -d "$DST_URL" --no-owner --no-acl -v /tmp/backup.dump

# Si SELECT count(*) FROM <tabla> (SIN calificar schema — así es como
# Drizzle genera las queries) falla con "relation does not exist" aunque
# \dt muestre la tabla, es el search_path vacío. Arreglarlo así:
psql "$DST_URL" -c "ALTER ROLE <usuario_de_la_url> SET search_path TO public;"
# Si sigues conectado por el endpoint pooled esto NO se refleja — confirma
# que $DST_URL es el directo (sin "-pooler" en el host).

# verificar tabla por tabla, con la MISMA forma de query que usa la app
# (sin calificar schema) — no solo con "public.tabla":
for TABLE in tabla1 tabla2 tabla3; do
  psql "$SRC_URL" -t -c "SELECT count(*) FROM $TABLE"
  psql "$DST_URL" -t -c "SELECT count(*) FROM $TABLE"
done

# apuntar Cloud Run a la base nueva (una versión nueva del secret no basta,
# Cloud Run resuelve el secret al crear la revisión, no en vivo):
echo "$DST_URL" | gcloud secrets versions add DATABASE_URL --data-file=-
gcloud run services update <app> --region=us-central1 \
  --update-secrets="DATABASE_URL=DATABASE_URL:latest"
```

> **CRÍTICO:** comparar conteos de filas tabla por tabla entre origen y destino
> antes de dar por buena la migración — no asumir que `pg_restore` sin errores
> significa datos completos. Y compararlos con la query SIN calificar schema,
> no con `public.tabla` — un conteo calificado puede dar bien mientras la app
> real sigue rota.

> **Gotcha:** no compares tabla por tabla con un `for`/`while` en bash que abre
> una conexión `psql` nueva por tabla (68 tablas × 2 lados = 136 conexiones) —
> en esta migración ese loop se colgó indefinidamente sin error visible
> (interacción rara entre `read` del loop y el stdin de `psql`, o límite de
> conexiones concurrentes de Neon). Genera en su lugar **una sola query
> `UNION ALL`** que cuenta las N tablas de un jalón y córrela una vez por lado:
> ```bash
> { echo "SELECT 'tabla1' AS tbl, count(*) FROM tabla1"
>   echo "UNION ALL SELECT 'tabla2', count(*) FROM tabla2"
>   # ...
>   echo "ORDER BY 1;"
> } > count-query.sql
> psql "$SRC_URL" -t -A -F'|' -f count-query.sql < /dev/null > src-counts.txt
> psql "$DST_URL" -t -A -F'|' -f count-query.sql < /dev/null > dst-counts.txt
> diff src-counts.txt dst-counts.txt
> ```
> Una sola conexión por lado, resultado determinista, y un `diff` en vez de
> comparar a ojo.

Borrar el archivo de dump local al terminar — es un snapshot completo de datos
de producción, no debe quedar suelto en `/tmp`.

---

## Paso 10 — Apagar Replit

En cuanto la base de datos nueva esté verificada y Cloud Run la esté usando,
**pausar Replit de inmediato** — no esperar la semana de respaldo planeada
originalmente. Una vez que hay dos bases distintas, dejar Replit activo es un
riesgo real de que alguien escriba ahí datos que nunca se van a sincronizar.

---

## Referencia rápida de síntomas

| Síntoma | Causa | Solución |
|---|---|---|
| `Cannot find package 'vite'` | `NODE_ENV=production` antes del install | Mover el `ENV` después de `npm ci` |
| `must support amd64/linux` | Build en Mac Apple Silicon (arm64) | `docker buildx build --platform linux/amd64` |
| `API key must be set` al arrancar | Cliente externo instanciado a nivel de módulo | Volverlo condicional/lazy dentro de la función |
| `MemoryStore is not designed for production` | Sesiones en memoria, normal en apps chicas | `--max-instances=1` en vez de reescribir código |
| Transacción DNS falla con "already exists" | Ya hay un TXT en ese nombre | Reemplazar el set completo (viejo + nuevo valor) |
| Transacción DNS falla por CNAME | Coexiste con otro tipo de registro | Quitar el otro registro en la misma transacción |
| `SSL_ERROR_SYSCALL` intermitente, cert recién emitido | Propagación del cert en el borde de Google | Esperar unos minutos, es normal |
| `SSL_ERROR_SYSCALL` con curl de Mac, servidor sano | LibreSSL negociando HTTP/2 | `curl --http1.1` |
| IAM binding falla "does not exist" recién creada la SA | Propagación (eventual consistency) | Reintentar en unos segundos |
| Acción de gcloud bloqueada por el modo automático | Categorías vistas en esta migración: crear/enlazar IAM (`Permission Grant`), `gcloud run deploy`/`services update` con `--allow-unauthenticated` (`Production Deploy`), y copiar contenido de una key/secret a otro lugar como el portapapeles (`Credential Materialization`) | Pedirle confirmación explícita al usuario para esa acción puntual y reintentar — no buscar un rodeo (ej. no intentes mover la credencial con otro comando si el bloqueo fue por `Credential Materialization`) |
| Intentar editar `.claude/settings.local.json` para autoconcederse el permiso bloqueado arriba también falla, con motivo `Auto-Mode Bypass` | El modo automático bloquea explícitamente que el agente se autoconceda permisos para saltarse sus propias restricciones, aunque el usuario ya haya pedido esa solución | No es un rodeo válido — el usuario tiene que editar la config él mismo o correr los comandos bloqueados en su propia terminal; el agente sigue con lo demás y deja la lista de comandos pendientes acumulada |
| `gcloud dns record-sets transaction add/remove` falla con "unrecognized arguments: --rrdatas=..." | A diferencia de `record-sets create`, en `transaction add`/`transaction remove` los valores del rrdata son **argumentos posicionales**, no la flag `--rrdatas` | `gcloud dns record-sets transaction remove --zone=<z> --name=<n> --ttl=<t> --type=TXT "valor sin comillas extra"` (varios valores posicionales para TXT con multi-string) |
| Validar un deploy de CI/CD sin entrar a la pestaña Actions de GitHub | — | `gh run list --repo <owner>/<repo>` para ver el run disparado por el push, `gh run watch <id> --repo <owner>/<repo> --exit-status` para seguirlo hasta el final (falla con exit code si el job falla), `gh run rerun <id> --repo <owner>/<repo>` para reintentar tras arreglar algo (ej. habilitar una API) sin necesitar un commit nuevo |
| `unsupported startup parameter in options` (Neon) | Endpoint pooled (`-pooler`) rechaza `options` | Usar el connection string directo (sin `-pooler`) |
| `relation "x" does not exist` contra Neon nuevo, la tabla sí existe | `search_path` vacío por default (proyecto nuevo/PG18) | `ALTER ROLE ... SET search_path TO public;` + usar el endpoint directo, no el pooled |
| Modelo de Gemini devuelve 404 `is no longer available` | Google retiró el modelo (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-2.5-flash`, etc. — pasó otra vez en qnexusapp con `gemini-2.5-flash`, apenas unas horas después del deploy) | El error mismo trae el reemplazo sugerido (`gemini-3.6-flash` en este caso); si ya centralizaste el nombre en una env var (`GEMINI_FLASH_MODEL`), el fix es `gcloud run services update <app> --update-env-vars=...` sin rebuild — luego actualiza también el default en el código para que el próximo deploy ya nazca correcto |
| Rutas de IA/Stripe fallan solo en Cloud Run, funcionaban en Replit | `AI_INTEGRATIONS_GEMINI_*` o `isProduction` basado en `REPLIT_DEPLOYMENT`/`REPLIT_DOMAINS` | Generar key real de Gemini y quitar `httpOptions.baseUrl`; cambiar el flag a `NODE_ENV === "production"` |
| `gcloud projects create <NOMBRE>` falla con "already in use by another project" | Project ID de GCP es único globalmente, no solo por cuenta — pasó con `appministra` en esta migración | Usar un ID alterno (ej. `<nombre>-app`) y dejar el display name (`--name=`) con el nombre real deseado |
| `Cannot find package '@replit/object-storage'` corriendo el script de Paso 5bis en el Shell de Replit | La app reimplementó el sidecar a mano y nunca declaró el paquete oficial como dependencia | `npm install @replit/object-storage` temporalmente en el Shell de Replit antes de correr el script; desinstalarlo en la limpieza |
| `Error: A bucket name is needed to use Cloud Storage` al listar con `new Client()` de `@replit/object-storage` | El SDK espera `REPLIT_DEFAULT_BUCKET_ID` en el entorno, que no siempre está seteado si el bucket se referencia solo vía `PRIVATE_OBJECT_DIR`/`PUBLIC_OBJECT_SEARCH_PATHS` | Pasar el bucket explícito: `new Client({ bucketId: "<primer-segmento-de-PRIVATE_OBJECT_DIR>" })` |
| Zona DNS del dominio no aparece en el proyecto GCP nuevo | La zona puede vivir en un proyecto GCP completamente distinto, de otra app del portafolio en el mismo dominio | `gcloud dns managed-zones list --project=<cada proyecto accesible>` — no asumir que hay que crear una zona nueva |
| `docker buildx build --push` falla en GitHub Actions con "Unable to acquire impersonated credentials" / `IAM Service Account Credentials API has not been used` | Workload Identity Federation autentica bien (`google-github-actions/auth` pasa), pero el push a Artifact Registry vía el credential helper de `gcloud` necesita impersonar y requiere una API que no se habilita junto con `run`/`artifactregistry`/`secretmanager` | `gcloud services enable iamcredentials.googleapis.com --project=<proyecto>` — agregar esta API al Paso 2 (junto con las demás) evita este fallo la primera vez |
| `ENOENT` corriendo `vite build` dentro del stage `builder` del Dockerfile | `.dockerignore` excluye un directorio de assets referenciado por un alias de Vite (`resolve.alias` en `vite.config.ts`) que se resuelve en build time, no en runtime | Quitar ese directorio del `.dockerignore` — el build multi-stage solo copia `dist` a la imagen final, así que incluirlo en el contexto de build no afecta el tamaño de runtime |

---

## Estado de los proyectos restantes

| Proyecto | Object storage propio de Replit | Riesgo | Estado |
|---|---|---|---|
| wwwqss | No | Bajo | ✅ Migrado |
| qssintelligence | **Sí, en uso real** (PDFs de entrenamiento) — reemplazado `@replit/object-storage` por `@google-cloud/storage`, mismo bucket migrado con script corrido desde el Shell de Replit | Medio-alto | ✅ Migrado |
| Rentia Manager | No detectado | Bajo | Siguiente |
| Trooxer | **Sí, pero no era `@replit/object-storage`** — era storage local en disco (`public/uploads/*`, `public/evidence/*`, servido con `express.static`), un caso peor que las migraciones anteriores: Cloud Run borra el disco local en cada restart/scale-to-zero, así que había riesgo de pérdida silenciosa de datos que ni dependía de una API específica de Replit. Reescrito a un servicio nuevo centralizado, `server/services/storageService.ts`, sobre `@google-cloud/storage` (ya estaba en `package.json` como dependencia sin usar), reemplazando 11 call sites en `server/routes.ts` y `server/routes/taskEvidenceRoutes.ts`, y las dos registraciones de `express.static('/uploads', ...)`/`express.static('/evidence', ...)` (una duplicada entre `server/index.ts` y `server/routes.ts`) por rutas GET que hacen streaming desde el bucket — manteniendo el mismo formato de URL pública para que las filas ya existentes en la DB siguieran resolviendo. **Bug de colisión de nombres atrapado en revisión de la tarea:** el `uploadImageFromUrl` viejo generaba su propio nombre con uuid; el reemplazo ingenuo reusaba `path.basename(urlImage)` tal cual, lo que hubiera dejado que dos evidencias con el mismo nombre de archivo de origen se pisaran entre sí — arreglado prefijando con `Date.now()`, mismo patrón ya usado en otro punto del archivo. Los 24 objetos existentes (16MB) se migraron a mano: `tar -czf` en el Shell de Replit → descarga vía el navegador de archivos de Replit → `gcloud storage cp -r` desde la máquina del usuario. Gotcha: el primer `tar` se escribió en `/tmp` dentro del contenedor de Replit, invisible en el navegador de archivos (que solo muestra el árbol relativo al workspace) y se perdió con un restart del contenedor antes de poder bajarlo — el reintento escribió directo en `~/workspace`. Email usaba un mecanismo de Replit distinto tanto de `@replit/object-storage` como de `AI_INTEGRATIONS_*`: el conector genérico de terceros de Replit (`REPLIT_CONNECTORS_HOSTNAME` + `REPL_IDENTITY`/`WEB_REPL_RENEWAL`) que trae la API key real de Resend desde el backend de conexiones de Replit en runtime (ver Paso 0) — reemplazado leyendo `RESEND_API_KEY` directo del entorno, con falla controlada (log + `{success:false}`) porque el usuario todavía no tenía key real al momento de la migración; estado legítimo de "deployar ahora, key después", no un bug. También `server/auth.ts` tenía `JWT_SECRET` con fallback hardcodeado (`|| 'trooxer-secret-key'`) — neutralizado seteando siempre `JWT_SECRET` vía Secret Manager. Bug real de Dockerfile atrapado por la prueba local del Paso 4: `.dockerignore` excluía `attached_assets/` completo, pero el build de Vite del frontend importa imágenes de ahí vía el alias `@assets` en build time — ver Paso 3. Project ID `trooxer` ya estaba tomado (mismo patrón que Appministra) — se usó `trooxer-app`. Mezcla pooled/directo de Neon: el usuario pegó el connection string pooled dos veces seguidas pese a que se le pidió apagar "Connection pooling" — se resolvió cuando compartió un screenshot del diálogo "Connect to your database" y se le señaló el toggle exacto. `search_path` no tuvo el problema documentado en este runbook (segunda vez consecutiva, después de Appministra, sin necesitar el `ALTER ROLE`). Paso 9 completo: 36/36 tablas verificadas con conteos idénticos (una sola query UNION ALL por lado) y 24/24 objetos de storage verificados; verificación de deploy con el chequeo en capas de este runbook más uno extra específico de esta migración (releer uno de los archivos recién migrados a través de la nueva ruta con storage en GCS: `GET /uploads/logos/<file>` → 200) — vale la pena sumarlo como chequeo general para cualquier migración futura que también reescriba storage. **Revisión final de toda la rama (whole-branch, después de que las revisiones por tarea ya habían aprobado todo) encontró 4 problemas reales invisibles en revisiones por tarea aisladas:** (1) `exportService.ts` seguía leyendo evidencias del disco local y caía a un self-fetch HTTP usando `APP_URL`/`localhost:PORT` — funcionaba solo por coincidencia porque el puerto hardcodeado (5000) igualaba al `--port` del deploy; (2) `POST /api/companies/:companyId/logo-upload` no tenía `authMiddleware` (bug preexistente, pero la migración cambió su radio de exposición: ahora es tráfico anónimo de internet escribiendo a un bucket con presupuesto real) — al agregar el middleware se descubrió que el endpoint hermano *con* auth estaba muerto (sin callers) y el que sí se usa en la UI real no mandaba el header de autorización, hubo que arreglar también el cliente; (3) mismo bug de `path.basename(urlImage)` que la colisión de nombres, pero con query string: una URL firmada/CDN con `?sig=...` producía un nombre de objeto que el lado de lectura no encontraba (404 permanente después de un "upload exitoso") — arreglado con `path.basename(new URL(urlImage).pathname)`; (4) `streamToResponse` hacía 3 round-trips a GCS por request (`exists`+`getMetadata`+`createReadStream`) sin `Cache-Control`/`ETag` — colapsado a 2 llamadas + headers de cache, relevante copiarlo así en las próximas 4 migraciones con storage. Vale la pena agregar una revisión final de todo el diff junto (no solo por tarea) como paso estándar cuando el storage se reescribe en múltiples call sites — ningún reviewer de tarea individual tenía visibilidad de `exportService.ts` porque ninguna tarea lo tocaba directamente. **Paso 7 y Paso 10 sí se completaron, en la misma sesión pero después de terminado el plan original:** el usuario pausó Replit por su cuenta (cumpliendo la recomendación del Paso 10) sin avisar que también iba a hacerlo — como el DNS de `trooxer.com` todavía apuntaba a Replit, el dominio quedó muerto (`This app isn't live yet`) hasta que se hizo el corte de DNS real. Gotcha nuevo: después de crear el domain-mapping y que la API reportara `CertificateProvisioned: True`, `www.trooxer.com` (CNAME a `ghs.googlehosted.com`, el mismo hostname compartido que ya usa `appministra.trooxer.com`) sirvió 200 de inmediato, pero el apex `trooxer.com` (4 IPs A + 4 IPs AAAA dedicadas) tardó varios minutos más y fue intermitente entre intentos (unos hits en 200, otros en `SSL_ERROR_SYSCALL`/timeout) mientras el certificado terminaba de propagar por las 4 IPs — confirmar con `openssl s_client -connect <ip>:443 -servername <dominio>` contra cada IP del apex si `curl` falla de forma inconsistente, no asumir que el certificado no se emitió solo porque el apex falla mientras un subdominio con CNAME compartido ya funciona. | Medio-alto | ✅ Migrado y en producción (`https://trooxer-331983772859.us-central1.run.app` y ahora también `https://trooxer.com`/`https://www.trooxer.com`), DB cutover verificado, Paso 7 (DNS) y Paso 10 (Replit pausado) completos. `RESEND_API_KEY` real y Paso 8 (CI/CD) quedan pendientes — el envío de email queda deshabilitado con falla controlada hasta que el usuario cargue una key de resend.com. **Documentado y aceptado por el usuario, no arreglado todavía:** los dos `cron.schedule()` de `server/index.ts` (cierre de subastas cada 30 min, monitor de retrasos de viajes cada 30 min) no corren mientras el contenedor está en cero por `--min-instances=0` — el de subastas tiene respaldo on-read (`closeIfExpired`), el de retrasos no. Usuario decidió esperar a que haya más tráfico real antes de mover esto a Cloud Scheduler — ver Paso 0. |
| qfacturahub | No detectado | Medio-alto (fiscal) | Pendiente |
| qnexusapp | **Sí, en uso real** (imágenes de producto, menú, uploads genéricos, logos) — además de `objectStorage.ts`, había una **tercera copia independiente** del hack de sidecar de Replit dentro de `server/routes/employees.ts` (fotos de empleados / control de acceso), fuera del módulo de object storage — no se encuentra con un grep solo en ese módulo, hace falta `grep -rn "127.0.0.1:1106"` en todo `server/`. Reemplazado con `@google-cloud/storage` + ADC, firmando URLs vía `getSignedUrl()` (requiere `roles/iam.serviceAccountTokenCreator` de la SA de Cloud Run sobre sí misma — sin esto `getSignedUrl` falla). 60/60 objetos migrados y verificados. También tenía Gemini vía `AI_INTEGRATIONS_GEMINI_*` en 5 sitios (incluyendo un módulo de generación de imágenes que resultó ser código muerto, nunca montado — mismo patrón que `/api/generate-image` en HolaKura) — centralizado en `server/lib/gemini.ts`. Bug aparte, no relacionado con la migración: `npm ci` fallaba con un bug de npm/arborist resolviendo peer deps opcionales de `vitest`; arreglado con `.npmrc` (`legacy-peer-deps=true`) + lockfile regenerado — sin esto ningún build limpio (ni Cloud Run ni CI) hubiera funcionado. Paso 9 (cutover de BD) completo: 68/68 tablas verificadas con conteos idénticos. Pasos 7 (DNS, `qnexusapp.com` + `www`) y 8 (CI/CD con Workload Identity Federation) completos y validados con un deploy real vía GitHub Actions. `gemini-2.5-flash` se retiró **horas después** del deploy inicial — primer caso real de usar el fallback configurable en producción. | Medio-alto | ✅ Migrado por completo, incluido DNS y CI/CD. Solo pendiente Paso 10 (pausar Replit — acción manual del usuario, fuera del alcance del agente) |
| HolaKura | **Sí, en uso real** (avatares, imágenes clínicas, firmas, cédulas profesionales) — bucket `replit-objstore-4e192054-...`. Cliente reescrito con `@google-cloud/storage` (ya estaba en `dependencies` sin usar). Además: reemplazado el proxy "AI Integrations" de Gemini por API key real + módulo centralizado (`server/lib/gemini.ts`, con fallback de modelo retirado), y arreglado bug de `isProduction` en Stripe (`REPLIT_DEPLOYMENT` → `NODE_ENV`). | Medio-alto | 🔧 Código listo, pendiente infra GCP |
| QPulseMes | **Sí, en uso real** | Alto | Requiere migrar storage |
| NexusTransporte | **Sí, en uso real** | Alto | Requiere migrar storage |
| qcampusone | Sí, por confirmar en main | Más alto | Requiere migrar storage |
| VanePortfolio | No — `shared/schema.ts`/Drizzle/Neon existen en el repo pero `server/storage.ts` es 100% `MemStorage`, nunca conecta a Postgres real (ver Paso 0, nuevo checklist item). Sin sesiones, sin auth, sin AI, sin cron — el proyecto más simple migrado hasta ahora. | Bajo | ✅ Migrado (`https://vaneportfolio-978790645095.us-central1.run.app`). Sin secrets (no hay DB real ni sesiones que proteger). Se encontró y corrigió antes del deploy: `GET /api/contact` exponía todos los envíos del formulario (nombre/email/teléfono) sin auth — mismo patrón de ruta de lectura sin protección ya visto en qssintelligence/HolaKura, pero de fuga de datos en vez de gasto; se eliminó porque el frontend solo usa el `POST`. Usuario decidió explícitamente NO conectar Postgres real (acepta perder envíos de contacto en cada scale-to-zero) y NO configurar dominio propio todavía (Paso 7 pendiente). `attached_assets/` pesa 426MB y se sirve en runtime vía `express.static` (no vía alias de Vite en build-time únicamente) — se copió completo a la imagen final del Dockerfile; queda como candidato a optimizar (varios archivos `.CR2` sin comprimir) en una sesión futura, no bloqueaba la migración. |
| Appministra | **Sí, en uso real** (imágenes de producto, logos) — bucket `replit-objstore-a242c805-...`. Reemplazado `@replit/object-storage` por `@google-cloud/storage` + ADC en `objectStorage.ts` y `routes.ts` (firma de URLs vía `getSignedUrl()` v4). 23/23 objetos migrados y verificados. También tenía Gemini vía `AI_INTEGRATIONS_GEMINI_*` en `kash.ts` (rutas `/api/kash/*`, en uso real) — centralizado en `server/lib/gemini.ts`; el mismo proxy en `replit_integrations/image/*` resultó código muerto (nunca montado en `routes.ts`, mismo patrón que HolaKura/qnexusapp), no se tocó. **Hallazgo de seguridad nuevo:** `POST /api/uploads/request-url` no tenía `verifyToken`/`contextMiddleware` — generaba URLs firmadas de escritura al bucket sin autenticación; corregido. Project ID `appministra` ya estaba tomado por otra cuenta de GCP (los IDs son únicos globalmente, no solo por cuenta) — se usó `appministra-app` como ID real con display name "Appministra". El paquete `@replit/object-storage` no estaba declarado en `package.json` (la integración se reimplementó a mano contra el sidecar) — hubo que instalarlo temporalmente en el Shell de Replit solo para el script de migración de Paso 5bis; además su `Client()` no encontró el bucket solo — hubo que pasarle `new Client({ bucketId: "<id-del-bucket-replit>" })` explícito porque `REPLIT_DEFAULT_BUCKET_ID` no estaba disponible en el entorno. Paso 9 (cutover de BD) completo: 28/28 tablas verificadas con conteos idénticos, sin necesitar el fix de `search_path` (este proyecto Neon no tuvo el problema). Pasos 7 (DNS, `appministra.trooxer.com`, zona vive en un proyecto GCP distinto al de la app — `integracionjava` — no asumir que la zona está en el proyecto nuevo) y 8 (CI/CD con Workload Identity Federation) completos. | Medio-alto | ✅ Migrado y cerrado por completo, incluido DNS, CI/CD y Paso 10 (Replit pausado y limpio) |

Para los cuatro con object storage: el Paso 5bis ya tiene el procedimiento
completo (reemplazo de cliente + script de migración + verificación),
probado en qssintelligence — copiar y ajustar nombres, no reinventar.

---

*Escrito a partir de la migración real de wwwqss (9 sep 2026), qssintelligence
(11-12 sep 2026), qnexusapp (12 sep 2026, incluyendo DNS y CI/CD end-to-end) y
Trooxer (13 sep 2026, storage local en disco propio — no
`@replit/object-storage` — reescrito a GCS). Actualizar con cada proyecto
nuevo — los gotchas que aparezcan en Rentia Manager o qfacturahub
probablemente se repitan en los que siguen. En qssintelligence salieron a la
luz dos bugs preexistentes de la app (modelo de Gemini retirado, endpoint sin
autenticación); en qnexusapp aparecieron una tercera copia oculta del hack de
sidecar fuera del módulo de storage, un bug de npm/arborist sin relación con
la migración, y el modelo de Gemini se retiró de nuevo (otra vez horas
después del deploy); en Trooxer el storage propio no usaba ninguna API de
Replit (era disco local, aun así frágil en Cloud Run), el email usaba el
conector genérico de terceros de Replit (no el proxy de IA ya documentado), y
la propia prueba local del Paso 4 atrapó un bug real de `.dockerignore`
excluyendo un directorio referenciado por un alias de Vite — vale la pena
usar el momento de la migración para revisar cosas así, no solo mover
infraestructura. En Trooxer además una revisión final de todo el diff junto
(no solo por tarea) encontró 4 problemas más que ninguna revisión aislada
podía ver, y el usuario pausó Replit por su cuenta el mismo día — sin el
corte de DNS ya hecho eso tumbó `trooxer.com` hasta que se completó el Paso 7
en la misma sesión (con un gotcha nuevo: el apex con IPs dedicadas tardó
notablemente más en propagar el certificado que un subdominio con CNAME
compartido a `ghs.googlehosted.com`).*
