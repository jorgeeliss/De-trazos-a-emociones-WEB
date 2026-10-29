// Permisos efectivos de un usuario.
// - Los administradores tienen todos los permisos.
// - Las cuentas creadas ANTES de esta función (sin el objeto permisos) se
//   consideran "heredadas" con acceso completo, para no romper cuentas que ya
//   funcionaban.
// - Las cuentas nuevas se crean con permisos explícitos (solo dibujo suelto);
//   el administrador habilita lo demás por usuario.
function permisosEfectivos(usuario) {
    if (!usuario) {
        return { conContexto: false, descargarPdf: false, admin: false };
    }

    if (usuario.esAdmin) {
        return { conContexto: true, descargarPdf: true, admin: true };
    }

    const p = usuario.permisos;
    const sinDefinir =
        !p || (p.conContexto === undefined && p.descargarPdf === undefined);

    if (sinDefinir) {
        // Cuenta heredada: mantiene acceso completo hasta que el admin la ajuste.
        return { conContexto: true, descargarPdf: true, admin: false };
    }

    return {
        conContexto: !!p.conContexto,
        descargarPdf: !!p.descargarPdf,
        admin: false
    };
}

module.exports = { permisosEfectivos };
