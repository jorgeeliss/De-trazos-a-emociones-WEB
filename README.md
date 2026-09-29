# De trazos a emociones

Aplicación web que analiza dibujos infantiles con inteligencia artificial y los interpreta junto con el contexto del niño (edad, situación en casa o en el colegio, comportamiento reciente, cómo se hizo el dibujo). La premisa del proyecto es que un mismo trazo no significa lo mismo en todos los niños, así que la imagen sola no basta.

> **Aviso ético:** esta herramienta es un **apoyo orientativo** para docentes, familias y psicólogos. **No diagnostica** y **no reemplaza el criterio profesional**. Ningún texto, prompt ni pantalla de la aplicación debe presentarse como diagnóstico clínico.

## Contexto académico

Trabajo de grado de Ingeniería de Sistemas de la **Corporación Universitaria Adventista (UNAC)**, Medellín, presentado en la Semana de la Investigación UCO 2026. Es un proyecto en curso.

- **Autores:** Emerson Becerra Arce, Jorge Luis Eliss Quintana, Jesús Daniel Martínez Anaya.
- **Asesor:** Néstor Vélez Vargas.

**Objetivo general:** construir una herramienta tecnológica que permita identificar y expresar emociones infantiles mediante el dibujo digital para apoyar la prevención del maltrato infantil.

**Objetivos específicos:**
1. Identificar en la literatura las estrategias y plataformas tecnológicas utilizadas para el manejo y la expresión de emociones en niños.
2. Diseñar la estructura y la interfaz de la aplicación "De trazos a emociones", enfocada en la expresión emocional infantil.
3. Desarrollar la herramienta tecnológica aplicando técnicas básicas de análisis de color y trazo.
4. Validar la aplicación mediante una prueba piloto con un grupo de niños y docentes, analizando su efectividad y facilidad de uso.

## Cómo funciona

El flujo de la aplicación (página `/app`) tiene tres pasos:

1. **Contexto:** se registran los datos del niño (nombre, edad, género, situación actual, comportamiento reciente, diagnóstico previo, si el dibujo fue espontáneo, comentarios mientras dibujaba, tiempo que tardó).
2. **Dibujo:** se sube la imagen del dibujo (arrastrando o seleccionando el archivo).
3. **Análisis:** se muestra la emoción predominante, la intensidad (baja, media o alta) y el análisis completo generado por el modelo, junto con el aviso de que no reemplaza un diagnóstico clínico.

## Stack real

**Importante:** los documentos académicos del trabajo de grado mencionan la API de Claude, pero el código **no usa ese servicio**. El análisis se ejecuta con **modelos locales servidos por Ollama**.

- **Frontend:** React 19 + Vite 8, React Router 7, `lucide-react`.
- **Backend:** Node.js + Express 5, `multer` (subida de imágenes) y `sharp` (redimensiona a máximo 800 px, JPEG calidad 80).
- **Autenticación:** JWT (`jsonwebtoken`) + `bcryptjs` con 12 rondas.
- **Base de datos:** MongoDB con Mongoose, conectada por `MONGO_URI` (el equipo usa MongoDB Atlas).
- **IA:** Ollama local en `http://127.0.0.1:11434/api/chat`.
  - Análisis de imágenes (`/analizar-imagen`): modelo `minicpm-v`.
  - Ruta de texto (`/preguntar`): modelo `llama-3.2-vision` (esta ruta existe en el backend pero el frontend no la usa).

## Estructura del repositorio

La raíz del repositorio (donde está `.git`) solo contiene este README, `CLAUDE.md`, `.gitignore` y una carpeta anidada **con el mismo nombre del repo**, que es donde vive el código:

```
De-trazos-a-emociones-WEB/          ← raíz del repo (.git)
├── README.md, CLAUDE.md, .gitignore
└── De-trazos-a-emociones-WEB/      ← carpeta del proyecto
    ├── package.json                ← dependencias del BACKEND (name: "proyecto-ollama")
    ├── backend/
    │   ├── server.js                ← app Express, rutas de análisis e historial
    │   ├── database.js              ← conexión Mongoose
    │   ├── models/User.js, Analysis.js
    │   ├── routes/auth.js           ← /auth/register y /auth/login
    │   ├── routes/authRoutes.js     ← vacío, sin uso
    │   └── middleware/authMiddleware.js
    ├── middleware/authMiddleware.js ← duplicado de backend/, sin uso
    ├── uploads/                     ← imágenes procesadas (ver "Privacidad y ética")
    └── frontend/                    ← proyecto Vite independiente, con su propio package.json
        ├── src/App.jsx, main.jsx, api.js, ProtectedRoute.jsx
        ├── src/pages/ (Login, Register, Analyzer, Dashboard, History)
        └── src/components/ (analyzer/, auth/, dashboard/, history/, layout/)
```

El backend **no tiene su propio `package.json`**: sus dependencias están declaradas en el `package.json` de la raíz del proyecto (carpeta anidada).

## Requisitos

- Node.js 18 o superior.
- MongoDB (local o Atlas).
- [Ollama](https://ollama.com) instalado, con el modelo `minicpm-v` descargado.

## Instalación y ejecución

1. **Ollama**
   ```bash
   ollama pull minicpm-v
   ```
   Deja el servicio de Ollama corriendo (puerto `11434` por defecto).

2. **Backend**
   ```bash
   cd De-trazos-a-emociones-WEB
   npm install
   cd backend
   cp .env.example .env   # y completa los valores reales
   node server.js
   ```
   El servidor arranca en el puerto `3000` por defecto. **Debes ejecutarlo desde la carpeta `backend/`**, porque el archivo `.env` y la carpeta de subidas se resuelven de forma relativa al directorio actual.

3. **Frontend**
   ```bash
   cd De-trazos-a-emociones-WEB/frontend
   npm install
   npm run dev
   ```
   Disponible en `http://localhost:5173`. El archivo `src/api.js` tiene fija la URL `http://localhost:3000` del backend.

## Variables de entorno

Definidas en `De-trazos-a-emociones-WEB/backend/.env` (ver plantilla en [`backend/.env.example`](De-trazos-a-emociones-WEB/backend/.env.example)):

| Variable | Obligatoria | Por defecto | Descripción |
|---|---|---|---|
| `MONGO_URI` | Sí | — | Cadena de conexión a MongoDB. Si falta, el proceso termina. |
| `JWT_SECRET` | Sí | — | Secreto para firmar los JWT. |
| `JWT_EXPIRES_IN` | No | `2h` | Vigencia del token. |
| `PORT` | No | `3000` | Puerto del backend. |

No existe un `.env.example` previo en el repositorio (aunque el `.gitignore` ya lo permite); este PR lo agrega.

## API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | No | Texto de prueba. |
| POST | `/auth/register` | No | Registro. Campos: `nombre`, `apellido`, `email`, `password` (mínimo 8 caracteres), `rol` (`padre` \| `psicologo` \| `profesor`). |
| POST | `/auth/login` | No | Inicio de sesión. Devuelve `{ token, usuario: { id, nombre, email } }`. |
| POST | `/analizar-imagen` | Bearer | `multipart/form-data` con el campo `imagen` + campos de contexto del niño. Llama a Ollama, guarda el resultado en MongoDB y devuelve `{ analisis, id, imagen }`. |
| GET | `/analisis` | Bearer | Historial de análisis del usuario autenticado, del más reciente al más antiguo. |
| POST | `/preguntar` | Bearer | Pregunta de texto a Ollama (modelo `llama-3.2-vision`). El frontend no la usa actualmente. |
| GET | `/uploads/*` | No | Archivos estáticos de las imágenes procesadas. |

## Estado del proyecto

**Funciona:**
- Registro e inicio de sesión con JWT.
- El flujo completo de tres pasos en `/app` guarda el análisis en MongoDB (sujeto al bug crítico P0-1, ver abajo).
- El historial (`SessionsList`, `StatCards`, `SummaryCard`, `HistoryChildBar`) consulta datos reales de `/analisis`.

**Simulado o pendiente:**
- El **Dashboard** (`ChildSwitcher`, `WeeklySummary`, `TimelineSection`, `ActivitiesSection`, `ComparisonSection`) muestra siempre a un niño ficticio ("Sofía") con textos inventados, no datos reales.
- En el **Historial**, `ChartCard` es un gráfico SVG estático y la alerta solo aparece si el niño se llama "Sofia".
- Los botones de **Niños**, **Reportes** y **Configuración** del menú lateral no navegan a ninguna parte.
- No existe el modo "sin contexto / con contexto" (comparar el análisis del mismo dibujo con y sin la información del niño) que describen los resultados académicos.

**Problemas conocidos (ver también `CLAUDE.md` para el detalle completo):**
- 🔴 **Crítico:** la pantalla `/app` se renderiza en blanco por un error de llaves en `Analyzer.jsx` (la función `analyze` nunca se cierra).
- 🔴 **Crítico:** hay ~120 imágenes de dibujos versionadas en `uploads/` en este repositorio (ver sección siguiente).
- 🟠 Rutas de subida inconsistentes entre `multer` y `express.static`.
- 🟠 El login no guarda el usuario en `localStorage` (desajuste `usuario` / `data.user`), y el rol no viaja en el token.
- 🟠 El prompt del modelo pide "observaciones clínicas" y actuar como "experto en psicología infantil", lo que contradice el encuadre ético del proyecto.
- 🟡 CORS abierto a cualquier origen, sin límites de tamaño/tipo en la subida de archivos, JWT en `localStorage`, `dns.setServers` forzado en el backend.
- 🟡 Duplicados y sobrantes: `middleware/` repetido, `routes/authRoutes.js` vacío, paquete llamado `proyecto-ollama`, proxy de Vite sin uso real, README de frontend con la plantilla por defecto de Vite.
- 🟡 No hay tests automatizados ni scripts `start`/`dev` en el backend.

## Privacidad y ética

- La aplicación procesa dibujos y datos de menores de edad; su uso requiere **consentimiento informado** de los padres o tutores y del centro educativo/clínico correspondiente.
- **No se debe versionar la carpeta `uploads/`** ni ninguna imagen real de un dibujo infantil en el repositorio. Actualmente hay imágenes versionadas por un problema de configuración del `.gitignore` (ver problema crítico P0-2 en `CLAUDE.md`); mientras no se confirme y resuelva ese punto, no subas más imágenes reales.
- Evita registrar datos sensibles innecesarios (por ejemplo, el nombre real del niño o un diagnóstico previo en texto libre); cuando sea posible, usa alias.
- Ningún texto de la interfaz, del prompt de IA o de la documentación debe presentarse como diagnóstico clínico.

## Autores y licencia

- Emerson Becerra Arce, Jorge Luis Eliss Quintana, Jesús Daniel Martínez Anaya.
- Asesor: Néstor Vélez Vargas.
- **Licencia:** pendiente de definir.
