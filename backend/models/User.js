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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", UserSchema);