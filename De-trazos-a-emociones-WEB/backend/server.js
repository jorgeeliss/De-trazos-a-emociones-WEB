const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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
app.use(cors());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use("/auth", authRoutes);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({ dest: uploadsDir });

/* =========================
   CONFIGURACIÓN DEL ANÁLISIS CON OLLAMA
========================= */

const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";

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
        rasgos_observados: { type: "array", items: { type: "string" } },
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

/* =========================
   TEST
========================= */

app.get("/", (req, res) => {
    res.send("Servidor con MiniCPM-V funcionando");
});

/* =========================
   TEXTO
========================= */

app.post("/preguntar", verificarToken, async (req, res) => {

    const pregunta = req.body.pregunta;

    if (!pregunta) {
        return res.status(400).json({ error: "Debes enviar una pregunta" });
    }

    try {
        const response = await axios.post("http://127.0.0.1:11434/api/chat", {
            model: "llama-3.2-vision",
            messages: [
                { role: "system", content: "Responde claro, corto y en español." },
                { role: "user", content: pregunta }
            ],
            stream: false,
            options: { num_predict: 120, temperature: 0.3 },
            keep_alive: "10m"
        });

        res.json({ respuesta: response.data.message.content });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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

    // Extraer contexto del niño desde el body (campos de texto del FormData)
    const {
        nombre,
        edad,
        genero,
        situacion_actual,
        comportamiento,
        diagnostico_previo,
        dibujo_espontaneo,
        comento_mientras,
        tiempo_dibujo
    } = req.body;

    // Construir bloque de contexto dinámico
    let contextoNino = "";

    if (nombre || edad || genero) {
        contextoNino += "## Información del niño\n";
        if (nombre) contextoNino += `- Nombre: ${nombre}\n`;
        if (edad) contextoNino += `- Edad: ${edad} años\n`;
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

    const contextoFinal = contextoNino.trim()
        ? `Ten en cuenta el siguiente contexto del niño para enriquecer tu análisis:\n\n${contextoNino}\n`
        : "";

    try {
        // Optimización: Redimensionar y comprimir la imagen para que el modelo la procese más rápido
        const processedImagePath = req.file.path + "-resized.jpg";
        await sharp(req.file.path)
            .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }) // Limitar tamaño máximo
            .jpeg({ quality: 80 }) // Compresión para reducir el peso
            .toFile(processedImagePath);

        // Modo simulado: no se llama a Ollama. Se devuelve un resultado de ejemplo
        // tras una breve espera, pero se guarda en MongoDB como un análisis normal.
        let resultadoJSON;
        let avisoParseo;

        if (AI_MODE === "mock") {
            await new Promise((resolve) => setTimeout(resolve, 2500));
            resultadoJSON = generarAnalisisSimulado();
        } else {
        const imagenBase64 = fs.readFileSync(processedImagePath, { encoding: "base64" });

        const response = await axios.post(OLLAMA_URL, {
            model: "minicpm-v",
            format: resolverFormatoOllama(),
            messages: [
                {
                    role: "system",
                    content: `
Eres una herramienta de apoyo orientativo que observa dibujos infantiles para ayudar a adultos (familias, docentes y psicólogos) a acompañar al niño. No eres un profesional clínico y no emites diagnósticos.

Observa ÚNICAMENTE lo que aparece en el dibujo. No inventes ni menciones elementos que no estén presentes en la imagen.

${contextoFinal}

Analiza el dibujo teniendo en cuenta: uso del color, trazos y presión aparente, figuras y su contenido, tamaño, disposición en la hoja y posibles omisiones.

Reglas de lenguaje (obligatorias):
- Usa lenguaje orientativo y tentativo ("podría sugerir", "parece", "podría estar relacionado con"). Nunca uses lenguaje clínico ni diagnóstico ("el niño padece", "tiene un trastorno").
- No hagas afirmaciones categóricas sobre la salud mental del niño.
- Recuerda que un mismo trazo puede significar cosas distintas según el niño y su contexto.

Devuelve un objeto JSON con EXACTAMENTE estas claves:
- "rasgos_observados": lista (array de textos) SOLO de lo visible en el dibujo (colores, trazos y presión aparente, figuras, tamaño, disposición en la hoja, omisiones). No incluyas interpretaciones aquí.
- "interpretacion": texto extenso y detallado que relacione cada rasgo observado con el contexto del niño (si se proporcionó). No te limites en la longitud.
- "emocion_predominante": la emoción principal que el dibujo podría estar expresando.
- "intensidad": uno de "baja", "media" o "alta".
- "lectura_orientativa": síntesis clara para el adulto, con sugerencias de acompañamiento y un recordatorio de que esto no reemplaza la valoración de un profesional.

Responde ÚNICAMENTE con ese objeto JSON, sin texto fuera del JSON.
`
                },
                {
                    role: "user",
                    content: "Analiza esta imagen",
                    images: [imagenBase64]
                }
            ],
            stream: false,
            // Análisis exhaustivo: priorizamos calidad sobre velocidad.
            options: { num_predict: 4000, num_ctx: 8192, temperature: 0.2 },
            keep_alive: "10m"
        }, {
            // El análisis puede tardar varios minutos; sin timeout corto.
            timeout: 0,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // Parseo robusto: si el JSON llega incompleto, recuperamos lo que se pueda.
        const parseo = parsearRespuestaIA(response.data.message.content);
        resultadoJSON = parseo.datos;
        if (!parseo.ok) {
            avisoParseo = "El modelo no devolvió un JSON completo. Se muestra el texto recuperado; puedes intentar analizar de nuevo.";
            console.error("La IA no devolvió un JSON válido; se guardó el texto recuperado.");
        }
        }

        // Eliminar solo el archivo original temporal, nos quedamos con el resized
        fs.unlinkSync(req.file.path);
        
        // El processedImagePath queda guardado permanentemente
        const rutaImagenGuardada = "/uploads/" + path.basename(processedImagePath);

        // Guardar en la base de datos
        const nuevoAnalisis = new Analysis({
            usuarioId: req.usuario.id,

            contexto_nino: {
                nombre,
                edad,
                genero,
                situacion_actual,
                comportamiento,
                diagnostico_previo,
                dibujo_espontaneo,
                comento_mientras,
                tiempo_dibujo
            },

            ruta_imagen: rutaImagenGuardada,

            resultado_ia: resultadoJSON
        });

        await nuevoAnalisis.save();

        res.json({
            analisis: resultadoJSON,
            id: nuevoAnalisis._id,
            imagen: rutaImagenGuardada,
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
   SERVIDOR
========================= */

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado en puerto", process.env.PORT || 3000);
});
