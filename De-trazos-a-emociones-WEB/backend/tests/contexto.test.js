const test = require("node:test");
const assert = require("node:assert/strict");
const { edadDesdeFecha, construirContextoFinal } = require("../services/ia/contexto");

test("edadDesdeFecha calcula los años cumplidos y rechaza fechas inválidas", () => {
    const hoy = new Date();
    const haceSiete = new Date(hoy.getFullYear() - 7, hoy.getMonth(), hoy.getDate()).toISOString().slice(0, 10);
    assert.equal(edadDesdeFecha(haceSiete), 7);
    assert.equal(edadDesdeFecha(""), null);
    assert.equal(edadDesdeFecha("no es fecha"), null);
});

test("sin datos (modo solo dibujo) el contexto queda vacío", () => {
    assert.equal(construirContextoFinal({}), "");
    assert.equal(construirContextoFinal(), "");
});

test("arma las secciones solo con los datos presentes", () => {
    const ctx = construirContextoFinal({ nombre: "Ana", edad: "8", situacion_actual: "Cambio de colegio", descripcion_dibujo: "Su familia" });
    assert.match(ctx, /## Información del niño\n- Nombre: Ana\n- Edad: 8 años/);
    assert.match(ctx, /- Situación en casa\/entorno: Cambio de colegio/);
    assert.match(ctx, /- Descripción aportada por el adulto: Su familia/);
    assert.doesNotMatch(ctx, /Género|Comportamiento|espontáneo/);
});
