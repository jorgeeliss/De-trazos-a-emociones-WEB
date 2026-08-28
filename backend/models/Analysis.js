const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    contexto_nino: {
        nombre: String,
        edad: String,
        genero: String,
        situacion_actual: String,
        comportamiento: String,
        diagnostico_previo: String,
        dibujo_espontaneo: String,
        comento_mientras: String,
        tiempo_dibujo: String
    },

    ruta_imagen: {
        type: String,
        required: true
    },

    resultado_ia: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Analysis", AnalysisSchema);