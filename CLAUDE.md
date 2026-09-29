# CLAUDE.md — De trazos a emociones

Contexto técnico para futuras sesiones de trabajo con Claude Code en este repositorio. Para el contexto académico y de producto, ver [README.md](README.md).

## 1. Estado real del código

IMPORTANTE: los documentos académicos dicen que el análisis usa la API de Claude. El código **no** hace eso: usa modelos locales con Ollama. Describe siempre el código tal como está.

**Stack:**
- Frontend: React 19 + Vite 8, React Router 7, lucide-react.
- Backend: Node.js + Express 5, Multer (subida de imágenes) y Sharp (redimensiona a máximo 800 px, JPEG calidad 80).
- Autenticación: JWT (jsonwebtoken) + bcryptjs con 12 rondas.
- Base de datos: MongoDB con Mongoose, conectada por `MONGO_URI` (el equipo usa MongoDB Atlas).
- IA: Ollama local en `http://127.0.0.1:11434/api/chat`. Imágenes con el modelo `minicpm-v`. La ruta de texto `/preguntar` usa `llama-3.2-vision`.

**Estructura:** la raíz del repo solo tiene `.gitignore`, `README.md`, `CLAUDE.md` y una carpeta anidada con el mismo nombre.
- `De-trazos-a-emociones-WEB/` (raíz, tiene `.git`)
  - `De-trazos-a-emociones-WEB/` (carpeta del proyecto)
    - `package.json`: dependencias del BACKEND (name: `proyecto-ollama`). El backend no tiene `package.json` propio.
    - `backend/server.js`: app Express, rutas de análisis e historial.
    - `backend/database.js`: conexión Mongoose.
    - `backend/models/User.js` y `backend/models/Analysis.js`.
    - `backend/routes/auth.js`: `/auth/register` y `/auth/login`.
    - `backend/routes/authRoutes.js`: VACÍO (0 bytes).
    - `backend/middleware/authMiddleware.js`.
    - `middleware/authMiddleware.js`: DUPLICADO idéntico al de `backend/`, no se usa.
    - `uploads/`: 120 imágenes versionadas en git.
    - `frontend/`: proyecto Vite independiente, con su propio `package.json`.
      - `src/`: `App.jsx`, `main.jsx`, `api.js`, `ProtectedRoute.jsx`.
      - `src/pages/`: Login, Register, Analyzer, Dashboard, History.
      - `src/components/`: `analyzer/`, `auth/`, `dashboard/`, `history/`, `layout/`.

**Cómo se ejecuta hoy:**
1. Ollama: instalarlo, ejecutar `ollama pull minicpm-v` y dejar el servicio corriendo en el puerto 11434.
2. Backend: en la carpeta del proyecto ejecutar `npm install`; luego `cd backend`, crear `backend/.env` (ver `backend/.env.example`) y ejecutar `node server.js` (puerto 3000 por defecto). Hay que arrancarlo DESDE `backend/`, porque `.env` y la carpeta de subidas se resuelven relativos al directorio actual.
3. Frontend: `cd frontend`, `npm install`, `npm run dev` (http://localhost:5173). El archivo `src/api.js` tiene fija la URL `http://localhost:3000`.

**Variables de entorno (`backend/.env`):**
- `MONGO_URI`: obligatoria; si falta, el proceso termina.
- `JWT_SECRET`: obligatoria.
- `JWT_EXPIRES_IN`: por defecto 2h.
- `PORT`: por defecto 3000.

Plantilla disponible en `backend/.env.example`.

**API:**
- `GET /` → sin auth, texto de prueba.
- `POST /auth/register` → sin auth. Campos: nombre, apellido, email, password (mínimo 8), rol (padre | psicologo | profesor).
- `POST /auth/login` → sin auth. Devuelve `{ token, usuario: { id, nombre, email } }`.
- `POST /analizar-imagen` → Bearer. `multipart/form-data` con "imagen" + campos de contexto. Llama a Ollama, guarda en MongoDB y devuelve `{ analisis, id, imagen }`.
- `GET /analisis` → Bearer. Historial del usuario, del más reciente al más antiguo.
- `POST /preguntar` → Bearer. Pregunta de texto a Ollama; el frontend no la usa.
- `GET /uploads/*` → archivos estáticos de las imágenes procesadas.

**Modelos de datos:**
- `User`: nombre, apellido, email (único), password (hash), rol, timestamps.
- `Analysis`: usuarioId; `contexto_nino` { nombre, edad, genero, situacion_actual, comportamiento, diagnostico_previo, dibujo_espontaneo, comento_mientras, tiempo_dibujo }; ruta_imagen; resultado_ia (Mixed); fecha.

**Flujo de la app:**
- Registro e inicio de sesión. El token se guarda en `localStorage` y el login redirige a `/app`.
- `/app` (Analyzer) tiene tres pasos: Contexto, Dibujo (subir imagen) y Análisis (emoción predominante, intensidad y texto completo).
- El prompt pide al modelo un JSON: `{ emocion_predominante, intensidad (baja|media|alta), analisis_completo }`.
- `/dashboard` y `/historial` están protegidos y consultan `/analisis`, pero la mayoría de sus tarjetas muestran datos simulados.

## 2. Problemas encontrados (por prioridad)

**P0-1 (CRÍTICO)** — La pantalla `/app` sale en blanco. En `frontend/src/pages/Analyzer.jsx` la función `analyze` no cierra su llave después del `try/catch/finally`. Todo lo siguiente quedó DENTRO de `analyze`: `KEYWORDS`, `processResult`, `resetAll`, `STYLES` y el `return` con el JSX. Por eso el componente no devuelve nada. `vite build` compila, pero ESLint marca `'analyze' is assigned a value but never used`. Además, `processResult` se llama antes de declararse. Solución: cerrar `analyze` justo después del `finally` y quitar la llave sobrante al final del archivo. Verificar con `npm run lint` y probando el flujo completo.

**P0-2 (CRÍTICO)** — Posible exposición de dibujos de menores. La carpeta `De-trazos-a-emociones-WEB/uploads/` tiene 120 imágenes versionadas en un repositorio público. `backend/.gitignore` solo ignora `backend/uploads/`. NO borres archivos ni reescribas el historial sin confirmación explícita: primero preguntar si son dibujos reales o imágenes de prueba.

**P1-1** — Rutas de subida inconsistentes. Multer guarda en `"uploads/"` (relativo al directorio actual), pero `express.static` sirve desde `path.join(__dirname, "uploads")`. Hay que usar `path.join(__dirname, "uploads")` en ambos y crear la carpeta si no existe.

**P1-2** — El login no guarda el usuario. El backend devuelve `"usuario"`, pero `Login.jsx` lee `data.user`, así que `localStorage.user` nunca se llena. El Dashboard además lee `.firstname`, por eso siempre saluda "Hola, Usuario". El rol no se devuelve ni va en el token.

**P1-3** — Datos simulados.
- Dashboard: `ChildSwitcher`, `WeeklySummary`, `TimelineSection`, `ActivitiesSection` y `ComparisonSection` tienen fijo a "Sofía" con textos inventados.
- Historial: `ChartCard` es un SVG estático y la alerta solo aparece si el niño se llama 'Sofia'.
- Sidebar: los botones Niños, Reportes y Configuración no navegan.
- Solo `SessionsList`, `StatCards`, `SummaryCard` y `HistoryChildBar` usan datos reales.

**P1-4** — El prompt contradice el encuadre ético. Pide actuar como "experto en psicología infantil" y dar "observaciones clínicas y recomendaciones". Tampoco exige explicitar los rasgos gráficos en que se apoya (color, trazo, tamaño, disposición, omisiones).

**P1-5** — Falta el modo "sin contexto / con contexto". Los resultados académicos se basan en procesar cada dibujo dos veces y comparar las dos lecturas, y el código no lo permite.

**P2-1** — Las variables del formulario no coinciden con los documentos, que hablan de composición del hogar, estado emocional previo en escala de 5 niveles y rol del adulto. La edad admite de 2 a 17 años, pero el proyecto define de 4 a 12.

**P2-2** — Datos sensibles: se guardan el nombre del niño y un diagnóstico previo en texto libre. Conviene minimizarlos, por ejemplo con un alias.

**P2-3** — En Ollama la etiqueta oficial del modelo es `llama3.2-vision`, sin guion entre llama y 3.2.

**P2-4** — Sobrantes:
- `middleware/` duplicado.
- `authRoutes.js` vacío.
- Paquete llamado `proyecto-ollama`.
- `frontend/README.md` era la plantilla de Vite (ya reemplazado, remite al README principal).
- El proxy de `vite.config.js` no sirve, porque `api.js` usa la URL absoluta.

**P2-5** — Seguridad:
- CORS abierto a cualquier origen.
- Multer sin límite de tamaño ni validación de tipo.
- JWT guardado en `localStorage`.
- `dns.setServers` forzado en `server.js`.

**P2-6** — No hay tests, y el backend no tiene scripts `start` ni `dev`.

**P2-7** — `node_modules` quedó en commits antiguos. Es solo informativo: NO reescribas el historial.

## 3. Reglas de trabajo

- Trabaja en la rama `feature/actualizacion-funciones`. Nunca hagas push directo a `main`.
- Commits pequeños, con mensajes en español en imperativo.
- Pide confirmación ANTES de: borrar archivos versionados, reescribir historial (filter-repo, rebase de commits publicados, push --force), cambiar el esquema de MongoDB o cambiar de proveedor de IA.
- Nunca escribas secretos reales; usa valores de ejemplo en `.env.example`.
- No inventes funcionalidades. Si algo es simulado o está pendiente, dilo.
- Nada de lenguaje diagnóstico en la UI, los prompts ni la documentación.
