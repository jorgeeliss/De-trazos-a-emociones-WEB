// Contexto del niño: datos que acompañan a cada análisis (contexto_nino).
import { textoEdad } from './emociones.js';

// Datos propios del niño (se conservan entre análisis).
export const CAMPOS_NINO = ['nombre', 'edad', 'fecha_nacimiento', 'genero', 'situacion_actual', 'comportamiento', 'diagnostico_previo'];
// Datos de cada dibujo en particular (cambian en cada análisis).
export const CAMPOS_DIBUJO = ['descripcion_dibujo', 'dibujo_espontaneo', 'comento_mientras', 'tiempo_dibujo'];

export const OPCIONES = {
  genero: [['niña', 'Niña'], ['niño', 'Niño'], ['no especificado', 'Prefiero no decirlo']],
  comportamiento: ['normal', 'retraído', 'agresivo', 'ansioso', 'triste', 'hiperactivo'],
  dibujo_espontaneo: ['espontáneo', 'se le pidió'],
  tiempo_dibujo: ['menos de 5 minutos', '5 a 15 minutos', 'más de 15 minutos'],
};

const lleno = (v) => String(v ?? '').trim() !== '';
const capital = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

// Contexto más completo del niño a partir de sus análisis (del más reciente al
// más antiguo): para cada dato, el valor más reciente que no esté vacío. Así no
// se pierde lo que se escribió antes aunque el último análisis se hiciera sin
// contexto (p. ej. un dibujo suelto asignado después al niño).
export function contextoDelNino(analisis = []) {
  const ctx = {};
  for (const campo of CAMPOS_NINO) {
    const con = analisis.find((a) => lleno(a?.contexto_nino?.[campo]));
    ctx[campo] = con ? con.contexto_nino[campo] : '';
  }
  return ctx;
}

// Filas legibles [etiqueta, valor] con los datos presentes, para mostrar.
export function filasContexto(ctx = {}) {
  const filas = [];
  const edad = textoEdad(ctx);
  if (edad) filas.push(['Edad', edad]);
  if (lleno(ctx.genero)) filas.push(['Género', capital(ctx.genero)]);
  if (lleno(ctx.situacion_actual)) filas.push(['Situación actual', ctx.situacion_actual]);
  if (lleno(ctx.comportamiento)) filas.push(['Comportamiento reciente', capital(ctx.comportamiento)]);
  if (lleno(ctx.diagnostico_previo)) filas.push(['Diagnóstico previo', ctx.diagnostico_previo]);
  if (lleno(ctx.descripcion_dibujo)) filas.push(['Descripción del dibujo', ctx.descripcion_dibujo]);
  if (lleno(ctx.dibujo_espontaneo)) filas.push(['El dibujo', capital(ctx.dibujo_espontaneo)]);
  if (lleno(ctx.comento_mientras)) filas.push(['Comentó mientras dibujaba', ctx.comento_mientras]);
  if (lleno(ctx.tiempo_dibujo)) filas.push(['Tiempo que tardó', capital(ctx.tiempo_dibujo)]);
  return filas;
}
