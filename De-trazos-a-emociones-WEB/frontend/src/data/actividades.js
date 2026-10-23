// Catálogo FIJO de actividades y consejos por emoción, revisable por el equipo.
// NO se genera con IA. Se usa para sugerir acompañamiento según la emoción
// predominante del niño. El lenguaje es orientativo, nunca clínico ni diagnóstico.

const PURPURA = { bg: 'rgba(139, 121, 242, 0.15)', color: 'var(--purple-light)' };
const TEAL = { bg: 'rgba(45,212,191,0.15)', color: 'var(--teal)' };
const AMBAR = { bg: 'rgba(251,191,36,0.15)', color: 'var(--amber)' };

const CATALOGO = {
  alegria: {
    actividades: [
      { icon: '🎨', nombre: 'Dibujen juntos lo que lo hace feliz', desc: 'Acompáñalo sin pantallas y deja que elija el tema. Celebra sus ideas sin corregir.', tag: 'Conexión', ...PURPURA },
      { icon: '🗣️', nombre: 'Pregúntale qué fue lo mejor de su día', desc: 'Darle espacio para contar lo bueno refuerza su bienestar y la confianza.', tag: 'Diálogo', ...AMBAR },
      { icon: '🏞️', nombre: 'Un rato de juego libre al aire libre', desc: 'El movimiento y el aire libre ayudan a sostener los momentos de alegría.', tag: 'Juego', ...TEAL },
    ],
    consejos: [
      { titulo: 'Refuerza lo positivo', texto: 'Nómbrale lo que ves ("te vi muy contento hoy"); ayuda a que reconozca sus emociones buenas.' },
      { titulo: 'Comparte el momento', texto: 'Participa de lo que disfruta. La alegría compartida fortalece el vínculo.' },
    ],
  },
  tristeza: {
    actividades: [
      { icon: '🤗', nombre: 'Un rato de compañía tranquila', desc: 'A veces un abrazo o estar cerca en silencio acompaña más que muchas preguntas.', tag: 'Calma', ...TEAL },
      { icon: '📖', nombre: 'Un cuento sobre emociones', desc: 'Leer un cuento donde el personaje se siente triste ayuda a poner nombre a lo que siente.', tag: 'Diálogo', ...AMBAR },
      { icon: '🎨', nombre: 'Dibujar cómo se siente hoy', desc: 'Invítalo a dibujar su emoción. Es una forma suave de expresar lo que no dice con palabras.', tag: 'Expresión', ...PURPURA },
    ],
    consejos: [
      { titulo: 'Valida lo que siente', texto: 'Dile que está bien sentirse triste y que no está solo. Evita minimizar ("no es para tanto").' },
      { titulo: 'No fuerces la conversación', texto: 'Ofrece tu presencia y espera a que quiera hablar; a veces llega más tarde.' },
    ],
  },
  ansiedad: {
    actividades: [
      { icon: '🫧', nombre: 'Respiración de la burbuja', desc: 'Inhalar lento y soplar como inflando una burbuja grande, varias veces juntos. Calma el cuerpo.', tag: 'Calma', ...TEAL },
      { icon: '📝', nombre: 'Rutina visible del día', desc: 'Anticipar lo que viene (con dibujos o lista) reduce la incertidumbre que alimenta la ansiedad.', tag: 'Rutina', ...PURPURA },
      { icon: '🗣️', nombre: 'Nombrar la preocupación', desc: 'Pregúntale "¿qué es lo que más te preocupa?" y escúchalo sin apurarlo.', tag: 'Diálogo', ...AMBAR },
    ],
    consejos: [
      { titulo: 'Normaliza la emoción', texto: 'Cuéntale que a veces tú también te sientes nervioso y cómo lo manejas.' },
      { titulo: 'Ofrece previsibilidad', texto: 'Las rutinas claras y los avisos de los cambios le dan seguridad.' },
    ],
  },
  enojo: {
    actividades: [
      { icon: '🏃', nombre: 'Descargar la energía', desc: 'Correr, saltar o apretar una pelota blanda ayuda a soltar la tensión del enojo.', tag: 'Juego', ...TEAL },
      { icon: '🎨', nombre: 'Dibujar el enojo con colores', desc: 'Dejar que dibuje su enojo como quiera es una salida segura para esa emoción.', tag: 'Expresión', ...PURPURA },
      { icon: '🗣️', nombre: 'Poner en palabras lo que pasó', desc: 'Cuando esté más calmado, ayúdalo a contar qué lo molestó, sin juzgar.', tag: 'Diálogo', ...AMBAR },
    ],
    consejos: [
      { titulo: 'Acompaña la calma primero', texto: 'Primero ayúdalo a calmarse; las conversaciones funcionan mejor después, no en pleno enojo.' },
      { titulo: 'Pon límites con cariño', texto: 'Está bien sentir enojo; lo que se cuida es cómo se expresa. Ofrécele alternativas.' },
    ],
  },
  calma: {
    actividades: [
      { icon: '🎨', nombre: 'Aprovechar para crear juntos', desc: 'Un momento de calma es ideal para dibujar o construir algo sin prisa.', tag: 'Conexión', ...PURPURA },
      { icon: '📖', nombre: 'Lectura compartida', desc: 'Leer juntos sostiene la tranquilidad y fortalece el vínculo.', tag: 'Calma', ...TEAL },
      { icon: '🗣️', nombre: 'Conversar con tranquilidad', desc: 'Los momentos calmados son buenos para hablar de cómo se ha sentido en la semana.', tag: 'Diálogo', ...AMBAR },
    ],
    consejos: [
      { titulo: 'Refuerza el bienestar', texto: 'Hazle notar lo bien que se siente estar tranquilos juntos.' },
      { titulo: 'Mantén lo que funciona', texto: 'Identifica qué ayudó a esta calma para repetirlo otros días.' },
    ],
  },
  miedo: {
    actividades: [
      { icon: '🔦', nombre: 'Explorar el miedo con seguridad', desc: 'Hablar del miedo con una linterna o un peluche "valiente" lo hace más manejable.', tag: 'Juego', ...TEAL },
      { icon: '📖', nombre: 'Cuento de superar un miedo', desc: 'Historias donde el personaje enfrenta un miedo ayudan a procesarlo.', tag: 'Diálogo', ...AMBAR },
      { icon: '🤗', nombre: 'Compañía al dormir', desc: 'Si el miedo aparece de noche, una rutina tranquila y tu cercanía dan seguridad.', tag: 'Calma', ...PURPURA },
    ],
    consejos: [
      { titulo: 'No ridiculices el miedo', texto: 'Para el niño es real. Reconócelo ("entiendo que te asuste") antes de tranquilizarlo.' },
      { titulo: 'Avanza de a poco', texto: 'Acompáñalo a enfrentar el miedo en pasos pequeños, a su ritmo.' },
    ],
  },
  default: {
    actividades: [
      { icon: '🎨', nombre: 'Dibujen juntos 15 minutos', desc: 'Siéntate con el niño sin pantallas. Deja que elija qué dibujar. No corrijas, solo acompaña.', tag: 'Conexión', ...PURPURA },
      { icon: '📖', nombre: 'Cuento antes de dormir', desc: 'Un cuento donde el personaje vive una emoción ayuda a procesarla.', tag: 'Calma', ...TEAL },
      { icon: '💬', nombre: 'Pregúntale cómo estuvo su día', desc: 'No "¿cómo te fue?" sino "¿qué fue lo más raro que pasó hoy?".', tag: 'Diálogo', ...AMBAR },
    ],
    consejos: [
      { titulo: 'Acompaña sin presionar', texto: 'Ofrece tu presencia y escucha; no siempre hace falta resolver, a veces basta estar.' },
      { titulo: 'Observa con cariño', texto: 'Registrar sus dibujos con regularidad ayuda a notar cómo va cambiando su ánimo.' },
    ],
  },
};

export function actividadesPara(emocion = '') {
  const e = String(emocion).toLowerCase();
  if (e.includes('alegr') || e.includes('felic') || e.includes('entusias') || e.includes('euforia')) return CATALOGO.alegria;
  if (e.includes('triste') || e.includes('melanc') || e.includes('soled')) return CATALOGO.tristeza;
  if (e.includes('ansied') || e.includes('estrés') || e.includes('estres') || e.includes('nervios') || e.includes('angustia')) return CATALOGO.ansiedad;
  if (e.includes('enojo') || e.includes('ira') || e.includes('frustr')) return CATALOGO.enojo;
  if (e.includes('calma') || e.includes('tranquil') || e.includes('paz')) return CATALOGO.calma;
  if (e.includes('miedo') || e.includes('temor')) return CATALOGO.miedo;
  return CATALOGO.default;
}
