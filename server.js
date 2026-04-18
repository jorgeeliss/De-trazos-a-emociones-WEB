const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));
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
            model: "minicpm-v",
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

        const imagenBase64 = fs.readFileSync(req.file.path, { encoding: "base64" });

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

1. Uso del color:
   - Colores cálidos (rojo, amarillo, naranja): posibles emociones como alegría, energía o enojo.
   - Colores fríos (azul, verde, morado): pueden reflejar calma, tristeza o tranquilidad.
   - Colores oscuros o apagados: podrían indicar miedo, tristeza o inseguridad.

2. Trazos y presión:
   - Trazos fuertes o marcados: intensidad emocional, posible enojo o ansiedad.
   - Trazos suaves o débiles: timidez, tristeza o baja energía emocional.

3. Formas y composición:
   - Figuras grandes: seguridad o necesidad de destacar.
   - Figuras pequeñas: inseguridad o introversión.
   - Elementos repetitivos o desordenados: posible ansiedad o estrés.

4. Contenido del dibujo:
   - Presencia de personas, familia, animales, naturaleza.
   - Expresiones faciales en los personajes.
   - Escenarios (hogar, escuela, lugares abiertos o cerrados).

5. Espacio y distribución:
   - Uso del espacio (centrado, disperso, vacío).
   - Elementos aislados o agrupados.

Con base en este análisis, responde con:

- Emoción o emociones predominantes.
- Justificación clara basada en los elementos observados.
- Nivel de intensidad emocional (bajo, medio, alto).
- Observaciones adicionales relevantes.
- Recomendaciones generales si se detectan emociones negativas recurrentes.

IMPORTANTE:
- No hagas diagnósticos clínicos.
- Usa lenguaje probabilístico (ej: "podría indicar", "es posible que").
- Considera el contexto cultural.
- Si se proporcionó contexto del niño, úsalo para enriquecer e individualizar el análisis.
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

        fs.unlinkSync(req.file.path);

        res.json({ analisis: response.data.message.content });

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
