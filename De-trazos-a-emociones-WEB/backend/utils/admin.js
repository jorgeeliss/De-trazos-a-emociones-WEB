// Correos que son administradores, definidos en ADMIN_EMAILS (.env),
// separados por coma. Un usuario con un correo de esta lista queda como
// administrador y aprobado automáticamente al registrarse o iniciar sesión.

const emailsAdmin = () =>
    (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

const esEmailAdmin = (email) =>
    Boolean(email) && emailsAdmin().includes(email.toLowerCase().trim());

module.exports = { esEmailAdmin };
