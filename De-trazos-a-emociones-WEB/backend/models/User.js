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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", UserSchema);