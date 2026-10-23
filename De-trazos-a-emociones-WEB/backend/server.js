const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Por defecto se usa el DNS del sistema (lo más compatible, incluidos datos
// móviles). Si una red no resuelve el registro SRV de Atlas (error
// "queryTxt ETIMEOUT"), se pueden forzar DNS externos definiendo DNS_SERVERS
// en el .env, por ejemplo: DNS_SERVERS=8.8.8.8,1.1.1.1
if (process.env.DNS_SERVERS) {
    const dns = require("dns");
    dns.setServers(
        process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean)
    );
}

const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const sharp = require("sharp");
const authRoutes = require("./routes/auth");

const connectDB = require("./database");
const Analysis = require("./models/Analysis");
const verificarToken = require("./middleware/authMiddleware");


// Conectar a MongoDB
connectDB();

const app = express();

// CORS restringido al origen del frontend (configurable por .env).
// Por defecto se permite el Vite local; CORS_ORIGIN admite varios separados por coma.
const origenesPermitidos = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
app.use(cors({ origin: origenesPermitidos }));

app.use(express.static("public"));
// Las imágenes de los dibujos NO se sirven públicamente. Se entregan solo al
// dueño del análisis a través del endpoint protegido GET /analisis/:id/imagen.
app.use(express.json());
app.use("/auth", authRoutes);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Solo imágenes JPG, PNG o WEBP, máximo 8 MB.
const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const upload = multer({
    dest: uploadsDir,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (TIPOS_IMAGEN.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Formato no permitido. Usa JPG, PNG o WEBP."));
    }
});

/* =========================
   CONFIGURACIÓN DEL ANÁLISIS CON OLLAMA
========================= */

const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";

// Calcula la edad en años a partir de una fecha de nacimiento (YYYY-MM-DD).
// Devuelve null si no hay fecha válida.
function edadDesdeFecha(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    const nac = new Date(fechaNacimiento);
    if (isNaN(nac.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad >= 0 ? edad : null;
}

// Modelo de visión usado para el análisis. Configurable por .env: minicpm-v es
// pequeño y rápido pero de redacción limitada; modelos más grandes como
// llama3.2-vision dan mejor análisis pero son más lentos (sobre todo en CPU).
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "minicpm-v";

// Parámetros de generación de Ollama. Configurables por .env para poder bajarlos
// en equipos sin GPU o con pocos recursos (el análisis en CPU puede ser muy lento
// con valores altos, y un num_predict menor también acota los bucles de repetición).
const OLLAMA_NUM_PREDICT = parseInt(process.env.OLLAMA_NUM_PREDICT, 10) || 4000;
const OLLAMA_NUM_CTX = parseInt(process.env.OLLAMA_NUM_CTX, 10) || 8192;

// AI_MODE: "ollama" (por defecto, análisis real) o "mock" (resultado simulado
// para probar el flujo sin Ollama). NUNCA debe usarse "mock" en la prueba piloto.
const AI_MODE = (process.env.AI_MODE || "ollama").toLowerCase();

// Resultado de ejemplo para AI_MODE=mock. Respeta la estructura nueva y va
// marcado con simulado: true para que el frontend lo advierta claramente.
function generarAnalisisSimulado() {
    return {
        rasgos_observados: [
            "Uso predominante de colores cálidos (amarillo y naranja) en la zona central.",
            "Trazos firmes y continuos, con presión aparente media.",
            "Una figura humana grande y sonriente en el centro de la hoja.",
            "Un sol en la esquina superior izquierda y varias flores en la parte inferior.",
            "Amplio aprovechamiento del espacio de la hoja, sin zonas vacías marcadas."
        ],
        interpretacion: "El uso de colores cálidos y una figura central sonriente podría sugerir un estado de ánimo positivo en el momento del dibujo. La firmeza de los trazos podría relacionarse con seguridad al dibujar. Este es un texto de ejemplo: el resultado es SIMULADO y no proviene de un análisis real del dibujo ni del contexto ingresado.",
        emocion_predominante: "Alegría",
        intensidad: "media",
        lectura_orientativa: "El dibujo podría sugerir un momento emocional tranquilo y positivo. Como acompañamiento, podrías preguntarle al niño qué representó y escuchar su explicación sin corregir. Recuerda que esta lectura es orientativa y no reemplaza la valoración de un profesional. (Resultado simulado, modo de prueba.)",
        simulado: true
    };
}

// Esquema de la respuesta del modelo. Ollama lo usa (parámetro "format") para
// forzar un JSON válido con estos campos. Requiere Ollama 0.5.0 o superior.
const ESQUEMA_ANALISIS = {
    type: "object",
    properties: {
        rasgos_observados: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 10 },
        interpretacion: { type: "string" },
        emocion_predominante: { type: "string" },
        intensidad: { type: "string", enum: ["baja", "media", "alta"] },
        lectura_orientativa: { type: "string" }
    },
    required: [
        "rasgos_observados",
        "interpretacion",
        "emocion_predominante",
        "intensidad",
        "lectura_orientativa"
    ]
};

// OLLAMA_FORMAT_MODE: "schema" (por defecto, Ollama >= 0.5.0) o "json" (versiones
// más antiguas que no soportan esquema pero sí format: "json").
function resolverFormatoOllama() {
    const modo = (process.env.OLLAMA_FORMAT_MODE || "schema").toLowerCase();
    return modo === "json" ? "json" : ESQUEMA_ANALISIS;
}

// Intenta parsear la respuesta del modelo. Si el JSON llega incompleto o mal
// formado, recupera el texto crudo y devuelve algo mostrable en vez de fallar.
function parsearRespuestaIA(rawContent) {
    const limpio = String(rawContent || "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    // 1) Intento directo
    try {
        return { ok: true, datos: JSON.parse(limpio) };
    } catch (e) {
        // continúa con la recuperación
    }

    // 2) Intento extrayendo el primer bloque {...}
    const inicio = limpio.indexOf("{");
    const fin = limpio.lastIndexOf("}");
    if (inicio !== -1 && fin !== -1 && fin > inicio) {
        try {
            return { ok: true, datos: JSON.parse(limpio.slice(inicio, fin + 1)) };
        } catch (e) {
            // continúa con el respaldo
        }
    }

    // 3) Respaldo: no se pudo parsear. Guardamos el texto crudo en un objeto
    //    con la misma forma para que el frontend igual muestre algo.
    return {
        ok: false,
        datos: {
            rasgos_observados: [],
            interpretacion: "",
            emocion_predominante: "No determinada",
            intensidad: "media",
            lectura_orientativa: limpio,
            parseo_incompleto: true,
            raw: rawContent
        }
    };
}

// Construye el bloque de contexto del niño para el prompt, a partir de un objeto.
function construirContextoFinal(ctx = {}) {
    const {
        nombre, edad, fecha_nacimiento, genero,
        situacion_actual, comportamiento, diagnostico_previo,
        dibujo_espontaneo, comento_mientras, tiempo_dibujo
    } = ctx;

    const edadCalculada = edadDesdeFecha(fecha_nacimiento) ?? (edad ? parseInt(edad, 10) : null);

    let contextoNino = "";
    if (nombre || edadCalculada != null || genero) {
        contextoNino += "## Información del niño\n";
        if (nombre) contextoNino += `- Nombre: ${nombre}\n`;
        if (edadCalculada != null) contextoNino += `- Edad: ${edadCalculada} años\n`;
        if (genero) contextoNino += `- Género: ${genero}\n`;
        contextoNino += "\n";
    }
    if (situacion_actual || comportamiento || diagnostico_previo) {
        contextoNino += "## Situación actual\n";
        if (situacion_actual) contextoNino += `- Situación en casa/entorno: ${situacion_actual}\n`;
        if (comportamiento) contextoNino += `- Comportamiento reciente: ${comportamiento}\n`;
        if (diagnostico_previo) contextoNino += `- Diagnóstico previo: ${diagnostico_previo}\n`;
        contextoNino += "\n";
    }
    if (dibujo_espontaneo || comento_mientras || tiempo_dibujo) {
        contextoNino += "## Contexto del dibujo\n";
        if (dibujo_espontaneo) contextoNino += `- ¿Fue espontáneo?: ${dibujo_espontaneo}\n`;
        if (comento_mientras) contextoNino += `- Comentó mientras dibujaba: ${comento_mientras}\n`;
        if (tiempo_dibujo) contextoNino += `- Tiempo que tardó: ${tiempo_dibujo}\n`;
        contextoNino += "\n";
    }

    return contextoNino.trim()
        ? `Ten en cuenta el siguiente contexto del niño para enriquecer tu análisis:\n\n${contextoNino}\n`
        : "";
}

// Prompt de sistema para el análisis del dibujo.
function mensajeSistema(contextoFinal) {
    return `
Eres una herramienta de apoyo orientativo que observa dibujos infantiles para ayudar a adultos (familias, docentes y psicólogos) a acompañar al niño. No eres un profesional clínico y no emites diagnósticos.

Observa ÚNICAMENTE lo que aparece en el dibujo. No inventes ni menciones elementos que no estén presentes en la imagen.

${contextoFinal}

Para interpretar el dibujo, apóyate en este marco (son posibles lecturas, no reglas fijas; exprésalas siempre con lenguaje probabilístico):

1. Uso del color:
   - Colores cálidos (rojo, amarillo, naranja): podrían reflejar alegría, energía o enojo.
   - Colores fríos (azul, verde, morado): podrían reflejar calma, tristeza o tranquilidad.
   - Colores oscuros o apagados: podrían indicar miedo, tristeza o inseguridad.
2. Trazos y presión aparente:
   - Trazos fuertes o marcados: posible intensidad emocional, enojo o ansiedad.
   - Trazos suaves o débiles: posible timidez, tristeza o baja energía.
3. Formas y composición:
   - Figuras grandes: posible seguridad o necesidad de destacar.
   - Figuras pequeñas: posible inseguridad o introversión.
   - Elementos repetitivos o desordenados: posible ansiedad o estrés.
4. Contenido del dibujo: personas, familia, animales o naturaleza; expresiones faciales de los personajes; escenarios (hogar, escuela, lugares abiertos o cerrados).
5. Espacio y distribución: uso del espacio (centrado, disperso, vacío); elementos aislados o agrupados; posibles omisiones.

El contexto del niño y el contexto cultural pueden cambiar el significado de un mismo rasgo; tenlo en cuenta al interpretar.

Reglas de lenguaje (obligatorias):
- Usa lenguaje orientativo y tentativo ("podría sugerir", "parece", "podría estar relacionado con"). Nunca uses lenguaje clínico ni diagnóstico ("el niño padece", "tiene un trastorno").
- No hagas afirmaciones categóricas sobre la salud mental del niño.
- Recuerda que un mismo trazo puede significar cosas distintas según el niño y su contexto.

Devuelve un objeto JSON con EXACTAMENTE estas claves:
- "rasgos_observados": lista (array de textos) SOLO de lo visible en el dibujo (colores, trazos y presión aparente, figuras, tamaño, disposición en la hoja, omisiones). Cada elemento debe ser una FRASE NATURAL Y COMPLETA en español, NUNCA una etiqueta, palabras sueltas ni texto con guiones bajos. Ejemplos del formato correcto: "Lluvia representada con líneas azules en el lado derecho de la hoja", "Un sol con expresión triste en la esquina superior izquierda", "Varias figuras humanas pequeñas en la parte inferior". Enumera entre 4 y 10 rasgos DISTINTOS; no repitas ni reformules el mismo rasgo.
- "interpretacion": análisis EXTENSO, detallado y PROFESIONAL, de 2 a 3 párrafos (al menos 6 frases en total). Relaciona CADA rasgo observado con el posible estado emocional y con el contexto del niño (si se proporcionó), explicando el porqué de cada lectura. Desarrolla cada idea; no resumas. Es un campo obligatorio: nunca lo dejes vacío ni con una sola frase.
- "emocion_predominante": la emoción principal que el dibujo podría estar expresando.
- "intensidad": uno de "baja", "media" o "alta".
- "lectura_orientativa": síntesis PROFESIONAL para el adulto, de al menos 4 frases, con sugerencias concretas y accionables de acompañamiento y un recordatorio de que esto no reemplaza la valoración de un profesional. Es un campo obligatorio: nunca lo dejes vacío.

Los campos "interpretacion" y "lectura_orientativa" son los más importantes: deben ser desarrollados, detallados y redactados con buena gramática y un tono cuidado y profesional, manteniendo siempre el lenguaje orientativo (nunca clínico ni diagnóstico). No los resumas en una o dos frases.

Responde ÚNICAMENTE con ese objeto JSON, sin texto fuera del JSON.
`;
}

// Ejecuta el análisis con la IA (o un resultado simulado en modo mock).
async function obtenerAnalisisIA(imagenBase64, contextoFinal) {
    if (AI_MODE === "mock") {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        return { resultado: generarAnalisisSimulado(), aviso: undefined };
    }

    const response = await axios.post(OLLAMA_URL, {
        model: OLLAMA_MODEL,
        format: resolverFormatoOllama(),
        messages: [
            { role: "system", content: mensajeSistema(contextoFinal) },
            { role: "user", content: "Analiza esta imagen", images: [imagenBase64] }
        ],
        stream: false,
        options: {
            num_predict: OLLAMA_NUM_PREDICT,
            num_ctx: OLLAMA_NUM_CTX,
            temperature: 0.3,
            repeat_penalty: 1.2,
            repeat_last_n: 256
        },
        keep_alive: "10m"
    }, {
        timeout: 0,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    const parseo = parsearRespuestaIA(response.data.message.content);
    return {
        resultado: parseo.datos,
        aviso: parseo.ok ? undefined : "El modelo no devolvió un JSON completo. Se muestra el texto recuperado; puedes intentar analizar de nuevo."
    };
}

/* =========================
   TEST
========================= */

app.get("/", (req, res) => {
    res.send("Servidor con MiniCPM-V funcionando");
});

/* =========================
   ANALISIS DE IMAGEN CON CONTEXTO
========================= */

app.post(
    "/analizar-imagen",
    verificarToken,
    upload.single("imagen"),
    async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const {
        nombre,
        edad,
        fecha_nacimiento,
        genero,
        situacion_actual,
        comportamiento,
        diagnostico_previo,
        dibujo_espontaneo,
        comento_mientras,
        tiempo_dibujo
    } = req.body;

    // En modo "solo dibujo" el body no trae contexto, así que esto queda vacío.
    const contextoFinal = construirContextoFinal(req.body);

    try {
        // Redimensionar y comprimir la imagen para que el modelo la procese más rápido.
        const processedImagePath = req.file.path + "-resized.jpg";
        await sharp(req.file.path)
            .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(processedImagePath);

        const imagenBase64 = fs.readFileSync(processedImagePath, { encoding: "base64" });
        const { resultado: resultadoJSON, aviso: avisoParseo } = await obtenerAnalisisIA(imagenBase64, contextoFinal);

        // Eliminar solo el archivo original temporal, nos quedamos con el resized.
        fs.unlinkSync(req.file.path);
        const rutaImagenGuardada = "/uploads/" + path.basename(processedImagePath);

        // Modo "solo dibujo": no se guarda de una; el usuario decide después.
        if (req.body.persistir === "false") {
            return res.json({
                analisis: resultadoJSON,
                imagen: rutaImagenGuardada,
                guardado: false,
                simulado: resultadoJSON.simulado === true,
                aviso: avisoParseo
            });
        }

        const nuevoAnalisis = new Analysis({
            usuarioId: req.usuario.id,
            contexto_nino: {
                nombre, edad, fecha_nacimiento, genero,
                situacion_actual, comportamiento, diagnostico_previo,
                dibujo_espontaneo, comento_mientras, tiempo_dibujo
            },
            ruta_imagen: rutaImagenGuardada,
            resultado_ia: resultadoJSON,
            analizado_sin_contexto: false
        });

        await nuevoAnalisis.save();

        res.json({
            analisis: resultadoJSON,
            id: nuevoAnalisis._id,
            imagen: rutaImagenGuardada,
            guardado: true,
            simulado: resultadoJSON.simulado === true,
            aviso: avisoParseo
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   HISTORIAL DE ANÁLISIS
========================= */

app.get("/analisis", verificarToken, async (req, res) => {
    try {
        const historial = await Analysis.find({
            usuarioId: req.usuario.id
        }).sort({ fecha: -1 });

        res.json(historial);

    } catch (error) {
        console.error("Error obteniendo historial:", error);

        res.status(500).json({
            error: "Error obteniendo el historial"
        });
    }
});

/* =========================
   GUARDAR UN ANÁLISIS YA HECHO (modo "solo dibujo")
========================= */

app.post("/analisis/guardar", verificarToken, async (req, res) => {
    const { analisis, imagen, independiente, contexto_nino } = req.body;

    if (!analisis || !imagen) {
        return res.status(400).json({ error: "Faltan datos del análisis" });
    }

    // Por seguridad, solo el nombre del archivo, y debe existir en uploads.
    const nombreArchivo = path.basename(String(imagen));
    const rutaFisica = path.join(uploadsDir, nombreArchivo);
    if (!fs.existsSync(rutaFisica)) {
        return res.status(404).json({ error: "La imagen ya no está disponible" });
    }

    try {
        const nuevo = new Analysis({
            usuarioId: req.usuario.id,
            contexto_nino: independiente ? {} : (contexto_nino || {}),
            ruta_imagen: "/uploads/" + nombreArchivo,
            resultado_ia: analisis,
            independiente: !!independiente,
            // Se guarda desde el modo "solo dibujo": el análisis se hizo sin contexto.
            analizado_sin_contexto: true
        });

        await nuevo.save();
        res.json({ id: nuevo._id, guardado: true });

    } catch (error) {
        console.error("Error guardando el análisis:", error);
        res.status(500).json({ error: "Error guardando el análisis" });
    }
});

/* =========================
   DESCARTAR UN ANÁLISIS NO GUARDADO (borra la imagen temporal)
========================= */

app.post("/analisis/descartar", verificarToken, (req, res) => {
    const { imagen } = req.body;
    if (imagen) {
        const rutaFisica = path.join(uploadsDir, path.basename(String(imagen)));
        fs.unlink(rutaFisica, () => {});
    }
    res.json({ ok: true });
});

/* =========================
   ASIGNAR UN DIBUJO INDEPENDIENTE A UN NIÑO
========================= */

app.patch("/analisis/:id/asignar", verificarToken, async (req, res) => {
    const { id } = req.params;
    const { contexto_nino } = req.body;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({ error: "Identificador inválido" });
    }
    if (!contexto_nino || !contexto_nino.nombre) {
        return res.status(400).json({ error: "Falta el niño al que asignar" });
    }

    try {
        const analisis = await Analysis.findOne({ _id: id, usuarioId: req.usuario.id });
        if (!analisis) {
            return res.status(404).json({ error: "Análisis no encontrado" });
        }

        analisis.independiente = false;
        analisis.contexto_nino = {
            nombre: contexto_nino.nombre,
            edad: contexto_nino.edad,
            fecha_nacimiento: contexto_nino.fecha_nacimiento,
            genero: contexto_nino.genero
        };
        // Sigue siendo un análisis hecho sin contexto hasta que se reanalice.
        analisis.analizado_sin_contexto = true;

        await analisis.save();
        res.json({ ok: true });

    } catch (error) {
        console.error("Error asignando el análisis:", error);
        res.status(500).json({ error: "Error asignando el análisis" });
    }
});

/* =========================
   REANALIZAR UN DIBUJO YA GUARDADO, AHORA CON CONTEXTO
========================= */

app.post("/analisis/:id/reanalizar", verificarToken, async (req, res) => {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({ error: "Identificador inválido" });
    }

    try {
        const analisis = await Analysis.findOne({ _id: id, usuarioId: req.usuario.id });
        if (!analisis || !analisis.ruta_imagen) {
            return res.status(404).json({ error: "Análisis no encontrado" });
        }

        const rutaFisica = path.join(uploadsDir, path.basename(analisis.ruta_imagen));
        if (!fs.existsSync(rutaFisica)) {
            return res.status(404).json({ error: "La imagen ya no está disponible" });
        }

        const contextoFinal = construirContextoFinal(analisis.contexto_nino || {});
        const imagenBase64 = fs.readFileSync(rutaFisica, { encoding: "base64" });
        const { resultado, aviso } = await obtenerAnalisisIA(imagenBase64, contextoFinal);

        analisis.resultado_ia = resultado;
        analisis.analizado_sin_contexto = false;
        await analisis.save();

        res.json({ analisis: resultado, aviso, simulado: resultado.simulado === true });

    } catch (error) {
        console.error("Error reanalizando:", error);
        res.status(500).json({ error: "Error reanalizando el dibujo" });
    }
});

/* =========================
   IMAGEN PROTEGIDA DE UN ANÁLISIS
========================= */

app.get("/analisis/:id/imagen", verificarToken, async (req, res) => {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({ error: "Identificador inválido" });
    }

    try {
        // Solo el dueño del análisis puede ver su imagen.
        const analisis = await Analysis.findOne({ _id: id, usuarioId: req.usuario.id });

        if (!analisis || !analisis.ruta_imagen) {
            return res.status(404).json({ error: "Imagen no encontrada" });
        }

        const rutaFisica = path.join(uploadsDir, path.basename(analisis.ruta_imagen));

        if (!fs.existsSync(rutaFisica)) {
            return res.status(404).json({ error: "Imagen no encontrada" });
        }

        res.sendFile(rutaFisica);

    } catch (error) {
        console.error("Error obteniendo la imagen:", error);
        res.status(500).json({ error: "Error obteniendo la imagen" });
    }
});

/* =========================
   BORRAR VARIOS ANÁLISIS (p. ej. todos los de un niño)
========================= */

app.post("/analisis/eliminar-varios", verificarToken, async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Debes enviar una lista de ids" });
    }

    const validos = ids.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
    if (validos.length === 0) {
        return res.status(400).json({ error: "No hay identificadores válidos" });
    }

    try {
        // Solo análisis propios.
        const analisis = await Analysis.find({ _id: { $in: validos }, usuarioId: req.usuario.id });

        for (const a of analisis) {
            if (a.ruta_imagen) {
                const rutaFisica = path.join(uploadsDir, path.basename(a.ruta_imagen));
                fs.unlink(rutaFisica, () => {});
            }
        }

        const result = await Analysis.deleteMany({
            _id: { $in: analisis.map((a) => a._id) },
            usuarioId: req.usuario.id
        });

        res.json({ eliminados: result.deletedCount });

    } catch (error) {
        console.error("Error eliminando análisis:", error);
        res.status(500).json({ error: "Error eliminando los análisis" });
    }
});

/* =========================
   BORRAR UN ANÁLISIS
========================= */

app.delete("/analisis/:id", verificarToken, async (req, res) => {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({ error: "Identificador inválido" });
    }

    try {
        // Solo se puede borrar un análisis propio.
        const analisis = await Analysis.findOne({ _id: id, usuarioId: req.usuario.id });

        if (!analisis) {
            return res.status(404).json({ error: "Análisis no encontrado" });
        }

        // Borrar la imagen del disco si existe (ignora el error si ya no está).
        if (analisis.ruta_imagen) {
            const rutaFisica = path.join(uploadsDir, path.basename(analisis.ruta_imagen));
            fs.unlink(rutaFisica, () => {});
        }

        await Analysis.deleteOne({ _id: analisis._id });

        res.json({ mensaje: "Análisis eliminado" });

    } catch (error) {
        console.error("Error eliminando análisis:", error);
        res.status(500).json({ error: "Error eliminando el análisis" });
    }
});

/* =========================
   MANEJO DE ERRORES (p. ej. validaciones de Multer)
========================= */

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (!err) return next();
    const mensaje = err.code === "LIMIT_FILE_SIZE"
        ? "La imagen supera el tamaño máximo (8 MB)."
        : (err.message || "Error en la solicitud");
    res.status(400).json({ error: mensaje });
});

/* =========================
   SERVIDOR
========================= */

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado en puerto", process.env.PORT || 3000);
});
