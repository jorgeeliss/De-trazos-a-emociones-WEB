const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },

        apellido: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        rol: {
            type: String,
            required: true,
            enum: ["padre", "psicologo", "profesor"]
        },

        // Institución o entidad a la que pertenece (colegio, consultorio...).
        // El administrador la ve al aprobar la cuenta.
        institucion: {
            type: String,
            trim: true,
            default: ""
        },

        // Estado de aprobación de la cuenta. Hasta que no esté "aprobado"
        // el usuario no puede iniciar sesión.
        estado: {
            type: String,
            enum: ["pendiente", "aprobado", "rechazado"],
            default: "pendiente"
        },

        // Administrador: puede aprobar o rechazar registros.
        esAdmin: {
            type: Boolean,
            default: false
        },

        // Ruta de la foto de perfil (relativa). La imagen se sirve protegida.
        fotoPerfil: {
            type: String,
            default: ""
        },

        // Permisos por usuario, que gestiona el administrador. Si no están
        // definidos (cuentas creadas antes de esta función) se consideran
        // "heredados" con acceso completo; los administradores siempre tienen
        // todos los permisos. Ver utils/permisos.js (permisosEfectivos).
        permisos: {
            // Analizar CON contexto del niño (incluye registrar niños y las
            // herramientas de historial/seguimiento). Sin esto, solo se puede
            // analizar un dibujo suelto con su descripción.
            conContexto: { type: Boolean },
            // Exportar / descargar PDF.
            descargarPdf: { type: Boolean }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", UserSchema);