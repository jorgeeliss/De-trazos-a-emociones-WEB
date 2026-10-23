const express = require("express");
const User = require("../models/User");
const verificarToken = require("../middleware/authMiddleware");
const verificarAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

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

module.exports = router;
