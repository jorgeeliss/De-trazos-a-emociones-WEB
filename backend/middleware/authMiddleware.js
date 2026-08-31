const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Token no proporcionado"
            });
        }

        const partes = authHeader.split(" ");

        if (partes.length !== 2 || partes[0] !== "Bearer") {
            return res.status(401).json({
                message: "Formato de token inválido"
            });
        }

        const token = partes[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = decoded;

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "El token ha expirado"
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Token inválido"
            });
        }

        return res.status(500).json({
            message: "Error verificando el token"
        });
    }
};

module.exports = verificarToken;