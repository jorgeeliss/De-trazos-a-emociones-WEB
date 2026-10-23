// Helpers compartidos para representar emociones e intensidades en la UI.
// Centraliza el mapeo emoción -> emoji/color para no repetirlo en cada componente.

export function emotionVisual(emocion = '') {
  const e = String(emocion).toLowerCase();
  if (e.includes('ansiedad') || e.includes('enojo') || e.includes('ira') || e.includes('frustración') || e.includes('estrés') || e.includes('angustia'))
    return { emoji: '😟', color: '#f87171', bg: 'rgba(248,113,113,0.15)' };
  if (e.includes('tristeza') || e.includes('miedo') || e.includes('melancolía') || e.includes('soledad'))
    return { emoji: '😔', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' };
  if (e.includes('alegría') || e.includes('alegria') || e.includes('felicidad') || e.includes('euforia') || e.includes('entusiasmo') || e.includes('amor'))
    return { emoji: '😊', color: '#2dd4bf', bg: 'rgba(45,212,191,0.15)' };
  if (e.includes('calma') || e.includes('tranquilidad') || e.includes('paz'))
    return { emoji: '😌', color: '#a89ee0', bg: 'rgba(168,158,224,0.15)' };
  return { emoji: '🙂', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' };
}

export function intensityInfo(intensidad = '') {
  const i = String(intensidad).toLowerCase();
  if (i.includes('alta') || i.includes('alto')) return { label: 'alta', color: '#f87171', valor: 3 };
  if (i.includes('baja') || i.includes('bajo') || i.includes('leve')) return { label: 'baja', color: '#4ade80', valor: 1 };
  return { label: 'media', color: '#fbbf24', valor: 2 };
}

// Emociones consideradas negativas, para reglas de alerta orientativas.
export function esEmocionNegativa(emocion = '') {
  const e = String(emocion).toLowerCase();
  return ['ansiedad', 'enojo', 'ira', 'frustración', 'estrés', 'tristeza', 'miedo', 'melancolía', 'soledad', 'angustia']
    .some((neg) => e.includes(neg));
}

// Edad en años a partir de una fecha de nacimiento (YYYY-MM-DD). null si no es válida.
export function edadDesde(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento);
  if (isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad >= 0 ? edad : null;
}

// Devuelve el texto de edad de un niño: calculada desde la fecha de nacimiento,
// o la edad guardada (registros viejos). Cadena vacía si no hay dato.
export function textoEdad({ fecha_nacimiento, edad } = {}) {
  const calc = edadDesde(fecha_nacimiento);
  if (calc != null) return `${calc} años`;
  if (edad) return `${edad} años`;
  return '';
}

// Si el cumpleaños es hoy o mañana, devuelve { cuando, edad }; si no, null.
export function infoCumple(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento);
  if (isNaN(nac.getTime())) return null;
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const mismaFecha = (d) => d.getMonth() === nac.getMonth() && d.getDate() === nac.getDate();
  const edadActual = edadDesde(fechaNacimiento) ?? 0;
  if (mismaFecha(hoy)) return { cuando: 'hoy', edad: edadActual };
  if (mismaFecha(manana)) return { cuando: 'mañana', edad: edadActual + 1 };
  return null;
}

export function formatFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatFechaCorta(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// Emoción predominante (la más frecuente) de una lista de análisis.
export function emocionPredominante(analisis = []) {
  const conteo = {};
  for (const a of analisis) {
    const e = (a.resultado_ia?.emocion_predominante || '').toLowerCase().trim();
    if (!e) continue;
    conteo[e] = (conteo[e] || 0) + 1;
  }
  let top = null;
  let max = 0;
  for (const e in conteo) {
    if (conteo[e] > max) { max = conteo[e]; top = e; }
  }
  return top;
}
