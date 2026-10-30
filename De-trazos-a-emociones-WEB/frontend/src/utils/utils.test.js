// Pruebas de utilidades puras del frontend: npm test (node --test).
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDuracion } from './tiempo.js';
import { limpiarTextoIA, limpiarResultadoIA, enParrafos } from './textoIA.js';
import { mensajeDeError } from './errores.js';
import { correoValido, avisoDeError } from '../components/auth/avisos.js';

test('formatDuracion: segundos, minutos, horas y sin dato', () => {
  assert.equal(formatDuracion(45000), '45 s');
  assert.equal(formatDuracion(60000), '1 min');
  assert.equal(formatDuracion(3492000), '58 min 12 s');
  assert.equal(formatDuracion(3780000), '1 h 3 min');
  assert.equal(formatDuracion(7200000), '2 h');
  assert.equal(formatDuracion(undefined), null);
  assert.equal(formatDuracion(-5), null);
});

test('limpiarTextoIA quita chino y respeta el español', () => {
  assert.equal(limpiarTextoIA('emocional: en一方面，el sol'), 'emocional: en, el sol');
  assert.equal(limpiarTextoIA('¿Tildes? áéíóú ñ.'), '¿Tildes? áéíóú ñ.');
  assert.deepEqual(limpiarResultadoIA({ rasgos_observados: ['a，b'], raw: 'x，y' }), { rasgos_observados: ['a, b'], raw: 'x，y' });
});

test('enParrafos respeta los saltos y agrupa frases de a 3', () => {
  assert.deepEqual(enParrafos('Uno.\n\nDos.'), ['Uno.', 'Dos.']);
  assert.deepEqual(enParrafos('Uno. Dos. Tres. Cuatro.'), ['Uno. Dos. Tres.', 'Cuatro.']);
  assert.deepEqual(enParrafos(''), []);
});

test('mensajeDeError traduce la falta de conexión', () => {
  assert.match(mensajeDeError(new TypeError('Failed to fetch')), /No pudimos conectar/);
  assert.equal(mensajeDeError(new Error('Error eliminando el análisis')), 'Error eliminando el análisis');
  assert.equal(mensajeDeError(null), 'Inténtalo de nuevo.');
});

test('avisos del login: correo y mensajes del backend', () => {
  assert.equal(correoValido('ana@correo.com'), true);
  assert.equal(correoValido('ana@correo'), false);
  assert.equal(avisoDeError(new Error('Credenciales incorrectas')).titulo, 'Correo o contraseña incorrectos');
  assert.equal(avisoDeError(new Error('Tu cuenta está pendiente de aprobación por el administrador.')).tipo, 'espera');
  assert.deepEqual(avisoDeError(new Error('El correo ya está registrado')).campos, ['email']);
});
