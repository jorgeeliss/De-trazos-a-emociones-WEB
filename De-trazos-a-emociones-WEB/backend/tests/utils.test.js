const test = require("node:test");
const assert = require("node:assert/strict");
const { permisosEfectivos } = require("../utils/permisos");
const { validarPassword } = require("../utils/password");
const { esEmailAdmin } = require("../utils/admin");

test("permisos: admin todo, cuenta heredada todo, cuenta nueva solo lo habilitado", () => {
    assert.deepEqual(permisosEfectivos(null), { conContexto: false, descargarPdf: false, admin: false });
    assert.deepEqual(permisosEfectivos({ esAdmin: true }), { conContexto: true, descargarPdf: true, admin: true });
    assert.deepEqual(permisosEfectivos({}), { conContexto: true, descargarPdf: true, admin: false });
    assert.deepEqual(permisosEfectivos({ permisos: { conContexto: false, descargarPdf: true } }), { conContexto: false, descargarPdf: true, admin: false });
});

test("contraseña segura: largo, mayúscula, minúscula, número y símbolo", () => {
    assert.match(validarPassword("Ab1!"), /8 caracteres/);
    assert.match(validarPassword("abcdefg1!"), /mayúscula/);
    assert.match(validarPassword("ABCDEFG1!"), /minúscula/);
    assert.match(validarPassword("Abcdefgh!"), /número/);
    assert.match(validarPassword("Abcdefg1"), /símbolo/);
    assert.equal(validarPassword("Abcdefg1!"), null);
});

test("correos de administrador desde ADMIN_EMAILS, sin importar mayúsculas ni espacios", () => {
    const antes = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = " Admin@Unac.edu.co , otro@x.co";
    assert.equal(esEmailAdmin("admin@unac.edu.co"), true);
    assert.equal(esEmailAdmin(" OTRO@x.co "), true);
    assert.equal(esEmailAdmin("nadie@x.co"), false);
    assert.equal(esEmailAdmin(""), false);
    if (antes === undefined) delete process.env.ADMIN_EMAILS; else process.env.ADMIN_EMAILS = antes;
});
