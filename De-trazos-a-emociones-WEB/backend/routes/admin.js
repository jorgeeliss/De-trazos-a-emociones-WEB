const express = require("express");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Analysis = require("../models/Analysis");
const verificarToken = require("../middleware/authMiddleware");
const verificarAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "uploads");
const perfilesDir = path.join(uploadsDir, "perfiles");

/*
========================================
LISTAR USUARIOS POR ESTADO
GET /admin/usuarios?estado=pendiente|aprobado|rechazado
Por defecto devuelve los pendientes.
========================================
*/

router.get("/usuarios", verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { estado } = req.query;

        const filtro = {};
        if (["pendiente", "aprobado", "rechazado"].includes(estado)) {
            filtro.estado = estado;
        } else {
            filtro.estado = "pendiente";
        }

        const usuarios = await User.find(filtro)
            .select("nombre apellido email rol institucion estado esAdmin createdAt")
            .sort({ createdAt: -1 });

        return res.json(usuarios);
    } catch (error) {
        console.error("Error listando usuarios:", error);
        return res.status(500).json({ message: "Error al obtener los usuarios" });
    }
});

/*
========================================
APROBAR O RECHAZAR UNA SOLICITUD
PATCH /admin/usuarios/:id   body: { accion: "aprobar" | "rechazar" }
========================================
*/

router.patch("/usuarios/:id", verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { accion } = req.body;
        const mapa = { aprobar: "aprobado", rechazar: "rechazado" };
        const nuevoEstado = mapa[accion];

        if (!nuevoEstado) {
            return res.status(400).json({ message: "Acción no válida" });
        }

        const usuario = await User.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // No permitir cambiar el estado de un administrador.
        if (usuario.esAdmin) {
            return res.status(400).json({ message: "No se puede cambiar el estado de un administrador" });
        }

        usuario.estado = nuevoEstado;
        await usuario.save();

        return res.json({
            message: nuevoEstado === "aprobado" ? "Cuenta aprobada" : "Cuenta rechazada",
            id: usuario._id,
            estado: usuario.estado
        });
    } catch (error) {
        console.error("Error actualizando solicitud:", error);
        return res.status(500).json({ message: "Error al actualizar la solicitud" });
    }
});

/*
========================================
ELIMINAR UNA CUENTA Y SUS DATOS
DELETE /admin/usuarios/:id
========================================
*/

router.delete("/usuarios/:id", verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // No permitir eliminar administradores desde el panel.
        if (usuario.esAdmin) {
            return res.status(400).json({ message: "No se puede eliminar a un administrador" });
        }

        // Borrar las imágenes de sus análisis.
        const analisis = await Analysis.find({ usuarioId: usuario._id }).select("ruta_imagen");
        for (const a of analisis) {
            if (a.ruta_imagen) {
                fs.unlink(path.join(uploadsDir, path.basename(a.ruta_imagen)), () => {});
            }
        }
        await Analysis.deleteMany({ usuarioId: usuario._id });

        // Borrar su foto de perfil.
        if (usuario.fotoPerfil) {
            fs.unlink(path.join(perfilesDir, path.basename(usuario.fotoPerfil)), () => {});
        }

        await User.findByIdAndDelete(usuario._id);

        return res.json({ message: "Cuenta eliminada", id: usuario._id });
    } catch (error) {
        console.error("Error eliminando usuario:", error);
        return res.status(500).json({ message: "Error al eliminar la cuenta" });
    }
});

module.exports = router;
