const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const sharp = require("sharp");
const path = require("path");

const connectDB = require("./database");
const Analysis = require("./models/Analysis");

// Conectar a MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

/* =========================
   TEST
========================= */

app.get("/", (req, res) => {
    res.send("Servidor con MiniCPM-V funcionando");
});

/* =========================
   TEXTO
========================= */

app.post("/preguntar", async (req, res) => {

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

app.post("/analizar-imagen", upload.single("imagen"), async (req, res) => {

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

        const imagenBase64 = fs.readFileSync(processedImagePath, { encoding: "base64" });

        const response = await axios.post("http://127.0.0.1:11434/api/chat", {
            model: "minicpm-v",
            messages: [
                {
                    role: "system",
                    content: `
Actúa como un experto en psicología infantil, análisis emocional y expresión artística en niños.

Analiza el dibujo proporcionado y determina qué emociones podría estar expresando el niño a través de su representación visual.

${contextoFinal}

Ten en cuenta los siguientes aspectos:

1. Uso del color.
2. Trazos y presión.
3. Formas y composición.
4. Contenido del dibujo.
5. Espacio y distribución.

IMPORTANTE: 
Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura, sin texto adicional:
{
  "emocion_predominante": "nombre de la emoción principal",
  "intensidad": "baja, media o alta",
  "analisis_completo": "Escribe aquí tu análisis psicológico completo, exhaustivo y detallado de la imagen. Describe exhaustivamente todos los elementos, colores, trazos, brinda la justificación, observaciones clínicas y recomendaciones. ¡NO TE LIMITES EN LA LONGITUD! Habla como el experto que eres. (IMPORTANTE: Todo este texto debe ir en este mismo campo. Para separar párrafos, usa la secuencia de caracteres \\n\\n)."
}
Asegúrate de que la salida sea JSON puro y válido.
`
                },
                {
                    role: "user",
                    content: "Analiza esta imagen",
                    images: [imagenBase64]
                }
            ],
            stream: false,
            options: { num_predict: 1000, temperature: 0.2 },
            keep_alive: "10m"
        });

        // Intentar parsear a JSON el resultado
        let resultadoJSON = {};
        try {
            const rawContent = response.data.message.content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            resultadoJSON = JSON.parse(rawContent);
        } catch (e) {
            console.error("Error al parsear JSON de la IA:", e);
            resultadoJSON = { error: "La IA no devolvió un JSON válido", raw: response.data.message.content };
        }

        // Eliminar solo el archivo original temporal, nos quedamos con el resized
        fs.unlinkSync(req.file.path);
        
        // El processedImagePath queda guardado permanentemente
        const rutaImagenGuardada = "/uploads/" + path.basename(processedImagePath);

        // Guardar en la base de datos
        const nuevoAnalisis = new Analysis({
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

        res.json({ analisis: resultadoJSON, id: nuevoAnalisis._id, imagen: rutaImagenGuardada });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   HISTORIAL DE ANÁLISIS
========================= */

app.get("/analisis", async (req, res) => {
    try {
        const historial = await Analysis.find().sort({ fecha: -1 });
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   SERVIDOR
========================= */

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado en puerto", process.env.PORT || 3000);
});
