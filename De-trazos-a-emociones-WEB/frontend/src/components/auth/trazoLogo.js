// Panel del login y el registro: puntos de los cuatro colores del logo llegan
// dispersos y dibujan sus cuatro círculos; luego se rellenan, se traza la onda
// blanca y aparece debajo el nombre "De trazos a emociones". Después de un rato
// se deshace en puntos y se vuelve a formar (o con un clic).
// Geometría igual a components/common/Logo.jsx (viewBox 48 x 48).
import { TAU, azar, suave, aRgb, derivar, rebotar, apartarDe, ajustarLienzo } from '../common/crayon';

const CIRCULOS = [
  { x: 19, y: 19 },
  { x: 29, y: 19 },
  { x: 29, y: 29 },
  { x: 19, y: 29 },
];
// Índice de color (--rueda-N) de cada círculo, como en Logo.jsx.
const COLOR_DE = [1, 2, 4, 3];
const ORDEN_RELLENO = [0, 1, 3, 2];
const RADIO = 11.5;
const CENTRO = 24;
const ANCHO_LOGO = 33; // de 7.5 a 40.5 en el viewBox

const NOMBRE = 'De trazos a emociones';

// Onda del logo: "M11 26 C16 20.5 20 30 24 26 C28 22 32 31.5 37 26".
const bezier = (p0, p1, p2, p3) => (t) => {
  const u = 1 - t;
  return [0, 1].map(
    (i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i],
  );
};
const ONDA = [
  ...Array.from({ length: 40 }, (_, i) => bezier([11, 26], [16, 20.5], [20, 30], [24, 26])(i / 40)),
  ...Array.from({ length: 41 }, (_, i) => bezier([24, 26], [28, 22], [32, 31.5], [37, 26])(i / 40)),
];

// Tiempos del ciclo (ms desde que empieza a formarse).
const T_CIRCULO = 450; // desfase entre círculos
const T_TRAZO = 800; // cuánto tarda en salir cada círculo completo
const T_RELLENO = 2300;
const T_ONDA = 3100;
const D_ONDA = 900;
const T_NOMBRE = T_ONDA + D_ONDA - 150;
const T_QUIETO = 10500; // a partir de aquí se deshace solo
const D_DESHACER = 750;

// Espacio bajo el logo para el nombre (lo usa quien ubica el logo).
export const espacioNombre = (tam) => tam * 0.13 + 36;

export function crearTrazoLogo(canvas, { zona = canvas, ubicar, atenuar = null, reducido = false }) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let k = 1;
  let caja = { cx: 0, cy: 0, tam: 0 };
  let colores = ['139, 121, 242'];
  let opacidad = 0.85;
  let colorNombre = '#1f2430';
  let puntos = []; // los que dibujan el logo
  let sueltos = []; // puntos que flotan alrededor
  let cursor = null;
  let raf = 0;
  let marco = 0;
  let inicio = performance.now();
  let deshaciendo = null; // momento en que empezó a deshacerse

  const medir = () => {
    [w, h] = ajustarLienzo(canvas, ctx);
    caja = ubicar(w, h);
    k = Math.max(0.8, Math.min(2.4, caja.tam / 150));
  };

  const leerColores = () => {
    const raiz = getComputedStyle(document.documentElement);
    colores = [1, 2, 3, 4].map((n) => aRgb(raiz.getPropertyValue(`--rueda-${n}`)));
    opacidad = parseFloat(raiz.getPropertyValue('--rueda-op')) || 0.85;
    colorNombre = raiz.getPropertyValue('--text').trim() || colorNombre;
  };

  // Paso de unidades del logo a píxeles del lienzo.
  const aPx = ([x, y]) => {
    const escala = caja.tam / ANCHO_LOGO;
    return [caja.cx + (x - CENTRO) * escala, caja.cy + (y - CENTRO) * escala];
  };

  const posicionAlAzar = () => ({ x: 12 + Math.random() * (w - 24), y: 12 + Math.random() * (h - 24) });
  const posicionLibre = () => {
    let p = posicionAlAzar();
    for (let i = 0; i < 6 && atenuar && atenuar(p.x, p.y, w, h) < 0.7; i++) p = posicionAlAzar();
    return p;
  };

  // Programa un ciclo: cada círculo se dibuja con sus puntos, uno tras otro.
  const formar = (desdeActual = false) => {
    inicio = performance.now();
    deshaciendo = null;
    const escala = caja.tam / ANCHO_LOGO;
    const espaciado = 4.4 * k;
    const anteriores = puntos;
    const nuevos = [];
    CIRCULOS.forEach((c, ci) => {
      const n = Math.round((TAU * RADIO * escala) / espaciado);
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i / n) * TAU;
        const corr = azar(-0.5, 0.5) * k;
        const [x, y] = aPx([c.x + RADIO * Math.cos(a), c.y + RADIO * Math.sin(a)]);
        nuevos.push({
          tx: x + Math.cos(a) * corr,
          ty: y + Math.sin(a) * corr,
          // Cada tanto un punto más grande, para que no se vea mecánico.
          r: (i % 6 === 0 ? 2.6 : azar(1.4, 2)) * k,
          color: COLOR_DE[ci] - 1,
          alfa: azar(0.8, 1),
          sale: inicio + ci * T_CIRCULO + (i / n) * T_TRAZO,
          fase: Math.random() * TAU,
        });
      }
    });
    puntos = nuevos.map((p, i) => {
      const previo = desdeActual && anteriores.length ? anteriores[i % anteriores.length] : null;
      const pos = previo || posicionLibre();
      return {
        ...p,
        x: pos.x,
        y: pos.y,
        vx: previo ? previo.vx : azar(-0.3, 0.3),
        vy: previo ? previo.vy : azar(-0.3, 0.3),
      };
    });
    if (reducido) {
      puntos.forEach((p) => Object.assign(p, { x: p.tx, y: p.ty, sale: 0 }));
      inicio = performance.now() - T_QUIETO + 1;
    }
  };

  const crearSueltos = () => {
    const cantidad = Math.max(10, Math.min(60, Math.round((w * h) / 9000)));
    sueltos = Array.from({ length: cantidad }, () => ({
      ...posicionAlAzar(),
      vx: azar(-0.18, 0.18),
      vy: azar(-0.18, 0.18),
      r: azar(1, 2.2) * k,
      color: Math.floor(Math.random() * 4),
      alfa: azar(0.3, 0.55),
    }));
  };

  // Se deshace: puntos hacia afuera y luego vuelve a formarse.
  const deshacer = () => {
    if (deshaciendo) return;
    deshaciendo = performance.now();
    for (const p of puntos) {
      const dx = p.x - caja.cx;
      const dy = p.y - caja.cy;
      const d = Math.hypot(dx, dy) || 1;
      const f = azar(2.5, 5.5) * Math.sqrt(k);
      p.vx += (dx / d) * f + azar(-0.8, 0.8);
      p.vy += (dy / d) * f + azar(-0.8, 0.8);
      p.sale = Infinity;
    }
  };

  const actualizar = (ahora) => {
    const t = ahora - inicio;
    if (!deshaciendo && t > T_QUIETO && !reducido) deshacer();
    if (deshaciendo && ahora - deshaciendo > D_DESHACER) formar(true);

    const flota = Math.sin(ahora / 1600) * 3; // el logo flota apenas
    for (const p of puntos) {
      if (ahora >= p.sale) {
        const tx = p.tx + Math.sin(ahora / 900 + p.fase) * 0.5 * k;
        const ty = p.ty + Math.cos(ahora / 1100 + p.fase) * 0.5 * k + flota;
        p.vx = (p.vx + (tx - p.x) * 0.045) * 0.84;
        p.vy = (p.vy + (ty - p.y) * 0.045) * 0.84;
      } else {
        p.vx = (p.vx + azar(-0.025, 0.025)) * 0.98;
        p.vy = (p.vy + azar(-0.025, 0.025)) * 0.98;
        rebotar(p, w, h);
      }
      apartarDe(p, cursor, 32 * k);
      p.x += p.vx;
      p.y += p.vy;
    }
    for (const s of sueltos) {
      derivar(s);
      rebotar(s, w, h, 12 * k);
      apartarDe(s, cursor, 32 * k);
      s.vx *= 0.99;
      s.vy *= 0.99;
      s.x += s.vx;
      s.y += s.vy;
    }
    return flota;
  };

  const alfaBorde = (x, y) =>
    Math.max(0, Math.min(1, (Math.min(x, y, w - x, h - y) - 2) / (16 * k))) *
    (atenuar ? atenuar(x, y, w, h) : 1);

  const punto = (x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  };

  const pintar = (ahora, flota = 0) => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const t = ahora - inicio;
    const salida = deshaciendo ? Math.max(0, 1 - (ahora - deshaciendo) / 400) : 1;
    const escala = caja.tam / ANCHO_LOGO;

    // Puntos sueltos en los colores del logo.
    for (const s of sueltos) {
      ctx.globalAlpha = s.alfa * alfaBorde(s.x, s.y);
      ctx.fillStyle = `rgb(${colores[s.color % colores.length]})`;
      punto(s.x, s.y, s.r);
    }

    // Relleno de los círculos, uno tras otro, superpuestos en el mismo orden
    // que en Logo.jsx (colores 1, 2, 3, 4).
    ORDEN_RELLENO.forEach((ci) => {
      const c = CIRCULOS[ci];
      const p = suave(Math.min(1, Math.max(0, (t - T_RELLENO - ci * 150) / 600)));
      if (p <= 0) return;
      const [x, y] = aPx([c.x, c.y]);
      ctx.globalAlpha = opacidad * p * salida;
      ctx.fillStyle = `rgb(${colores[COLOR_DE[ci] - 1]})`;
      ctx.beginPath();
      ctx.arc(x, y + flota, RADIO * escala, 0, TAU);
      ctx.fill();
    });

    // Puntos que dibujan el contorno (se atenúan un poco al rellenarse).
    const relleno = Math.min(1, Math.max(0, (t - T_RELLENO) / 900));
    for (const p of puntos) {
      ctx.globalAlpha = p.alfa * alfaBorde(p.x, p.y) * (1 - 0.55 * relleno * salida);
      ctx.fillStyle = `rgb(${colores[p.color]})`;
      punto(p.x, p.y, p.r);
    }

    // Onda blanca del logo.
    const po = suave(Math.min(1, Math.max(0, (t - T_ONDA) / D_ONDA)));
    if (po > 0) {
      const hasta = Math.max(2, Math.round(po * ONDA.length));
      ctx.globalAlpha = salida;
      ctx.strokeStyle = '#ffffff';
      // Un poco más fina que en el logo pequeño: a este tamaño 3.1 se ve pesada.
      ctx.lineWidth = 2.4 * escala;
      ctx.beginPath();
      ONDA.slice(0, hasta).forEach((pt, i) => {
        const [x, y] = aPx(pt);
        if (i === 0) ctx.moveTo(x, y + flota);
        else ctx.lineTo(x, y + flota);
      });
      ctx.stroke();
    }

    // Nombre de la app bajo el logo, cuando termina de formarse.
    const pn = suave(Math.min(1, Math.max(0, (t - T_NOMBRE) / 700)));
    if (pn > 0) {
      const tamLetra = Math.round(Math.max(18, caja.tam * 0.13));
      ctx.globalAlpha = pn * salida;
      ctx.fillStyle = colorNombre;
      ctx.font = `800 ${tamLetra}px 'Inter', system-ui, sans-serif`;
      ctx.letterSpacing = '-0.5px';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(NOMBRE, caja.cx, caja.cy + caja.tam / 2 + 22 + (1 - pn) * 10 + flota);
      ctx.letterSpacing = '0px';
    }
    ctx.globalAlpha = 1;
  };

  const bucle = (ahora) => {
    marco += 1;
    if (marco % 120 === 0) leerColores();
    if (w > 0 && h > 0) {
      const flota = actualizar(ahora);
      pintar(ahora, flota);
    }
    raf = requestAnimationFrame(bucle);
  };

  const alMover = (e) => {
    const r = canvas.getBoundingClientRect();
    cursor = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const alSalir = () => {
    cursor = null;
  };
  // Clic: si ya está formado, se deshace y se vuelve a formar.
  const alClic = () => {
    if (performance.now() - inicio > T_ONDA) deshacer();
  };

  let tiempoResize = 0;
  const observador =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          clearTimeout(tiempoResize);
          tiempoResize = setTimeout(() => {
            const antes = `${w}x${h}`;
            medir();
            if (`${w}x${h}` === antes) return;
            crearSueltos();
            formar(true);
            if (reducido) pintar(performance.now());
          }, 150);
        })
      : null;

  medir();
  leerColores();
  crearSueltos();
  formar();
  observador?.observe(canvas);
  if (reducido) {
    pintar(performance.now());
  } else {
    zona.addEventListener('pointermove', alMover);
    zona.addEventListener('pointerleave', alSalir);
    zona.addEventListener('click', alClic);
    raf = requestAnimationFrame(bucle);
  }

  return {
    destruir() {
      cancelAnimationFrame(raf);
      clearTimeout(tiempoResize);
      observador?.disconnect();
      zona.removeEventListener('pointermove', alMover);
      zona.removeEventListener('pointerleave', alSalir);
      zona.removeEventListener('click', alClic);
    },
  };
}
