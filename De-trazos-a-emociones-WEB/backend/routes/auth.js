const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/*
========================================
REGISTRO
POST /auth/register
========================================
*/

router.post("/register", async (req, res) => {
    try {
        const { nombre, apellido, email, password, rol } = req.body;

        // Validar campos
        if (!nombre || !apellido || !email || !password || !rol) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        // Validar longitud mínima de contraseña
        if (password.length < 8) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 8 caracteres"
            });
        }

        // Normalizar email
        const emailNormalizado = email.toLowerCase().trim();

        // Comprobar si el usuario ya existe
        const usuarioExistente = await User.findOne({
            email: emailNormalizado
        });

        if (usuarioExistente) {
            return res.status(409).json({
                message: "El correo ya está registrado"
            });
        }

        // Hashear contraseña
        const passwordHash = await bcrypt.hash(password, 12);

        // Crear usuario
        const nuevoUsuario = new User({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: emailNormalizado,
            password: passwordHash,
            rol: rol
        });

        await nuevoUsuario.save();

        return res.status(201).json({
            message: "Usuario registrado correctamente",
            usuario: {
                id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email
            }
        });

    } catch (error) {
        console.error("Error en registro:", error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
});


/*
========================================
LOGIN
POST /auth/login
========================================
*/

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos
        if (!email || !password) {
            return res.status(400).json({
                message: "El correo y la contraseña son obligatorios"
            });
        }

        // Normalizar email
        const emailNormalizado = email.toLowerCase().trim();

        // Buscar usuario
        const usuario = await User.findOne({
            email: emailNormalizado
        });

        // No revelar si el correo existe
        if (!usuario) {
            return res.status(401).json({
                message: "Credenciales incorrectas"
            });
        }

        // Comparar contraseña
        const passwordValida = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValida) {
            return res.status(401).json({
                message: "Credenciales incorrectas"
            });
        }

        // Crear JWT
        const token = jwt.sign(
            {
                id: usuario._id,
                email: usuario.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "2h"
            }
        );

        return res.status(200).json({
            message: "Login exitoso",
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error("Error en login:", error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
});


module.exports = router;