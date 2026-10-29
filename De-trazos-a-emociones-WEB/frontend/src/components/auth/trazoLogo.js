// Panel del login y el registro: rayitas de crayón de los cuatro colores del
// logo llegan dispersas y dibujan sus cuatro círculos; luego se rellenan y se
// traza la onda blanca: se forma el logo "De trazos a emociones". Después de un
// rato se deshace en rayitas y se vuelve a formar (o con un clic).
// Geometría igual a components/common/Logo.jsx (viewBox 48 x 48).
import {
  TAU, azar, suave, girarHacia, aRgb, pintarMarca, crearGarabato, pintarGarabato,
  derivar, rebotar, apartarDe, ajustarLienzo,
} from '../common/crayon';

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
const T_QUIETO = 9500; // a partir de aquí se deshace solo
const D_DESHACER = 750;

export function crearTrazoLogo(canvas, { zona = canvas, ubicar, atenuar = null, reducido = false }) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let k = 1;
  let caja = { cx: 0, cy: 0, tam: 0 };
  let colores = ['139, 121, 242'];
  let opacidad = 0.85;
  let marcas = [];
  let sueltos = [];
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

  // Programa un ciclo: cada círculo se dibuja con sus rayitas, uno tras otro.
  const formar = (desdeActual = false) => {
    inicio = performance.now();
    deshaciendo = null;
    const escala = caja.tam / ANCHO_LOGO;
    const espaciado = 4.6 * k;
    const anteriores = marcas;
    const nuevas = [];
    CIRCULOS.forEach((c, ci) => {
      const n = Math.round((TAU * RADIO * escala) / espaciado);
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i / n) * TAU;
        const corr = azar(-0.7, 0.7) * k;
        const [x, y] = aPx([c.x + RADIO * Math.cos(a), c.y + RADIO * Math.sin(a)]);
        nuevas.push({
          tx: x + Math.cos(a) * corr,
          ty: y + Math.sin(a) * corr,
          tang: a + Math.PI / 2 + azar(-0.15, 0.15),
          largo: espaciado * azar(1.35, 1.7),
          color: COLOR_DE[ci] - 1,
          alfa: azar(0.75, 1),
          sale: inicio + ci * T_CIRCULO + (i / n) * T_TRAZO,
          fase: Math.random() * TAU,
        });
      }
    });
    marcas = nuevas.map((m, i) => {
      const previa = desdeActual && anteriores.length ? anteriores[i % anteriores.length] : null;
      const p = previa || posicionLibre();
      return {
        ...m,
        x: p.x,
        y: p.y,
        ang: previa ? previa.ang : Math.random() * TAU,
        vx: previa ? previa.vx : azar(-0.3, 0.3),
        vy: previa ? previa.vy : azar(-0.3, 0.3),
        va: previa ? previa.va : azar(-0.04, 0.04),
      };
    });
    if (reducido) {
      marcas.forEach((m) => Object.assign(m, { x: m.tx, y: m.ty, ang: m.tang, sale: 0 }));
      inicio = performance.now() - T_ONDA - D_ONDA;
    }
  };

  const crearSueltos = () => {
    const cantidad = Math.max(6, Math.min(36, Math.round((w * h) / 16000)));
    sueltos = Array.from({ length: cantidad }, () =>
      crearGarabato(posicionAlAzar(), k * 0.8, { color: Math.floor(Math.random() * 4) }),
    );
  };

  // Se deshace: rayitas hacia afuera y luego vuelve a formarse.
  const deshacer = () => {
    if (deshaciendo) return;
    deshaciendo = performance.now();
    for (const m of marcas) {
      const dx = m.x - caja.cx;
      const dy = m.y - caja.cy;
      const d = Math.hypot(dx, dy) || 1;
      const f = azar(2.5, 5.5) * Math.sqrt(k);
      m.vx += (dx / d) * f + azar(-0.8, 0.8);
      m.vy += (dy / d) * f + azar(-0.8, 0.8);
      m.va = azar(-0.15, 0.15);
      m.sale = Infinity;
    }
  };

  const actualizar = (ahora) => {
    const t = ahora - inicio;
    if (!deshaciendo && t > T_QUIETO) deshacer();
    if (deshaciendo && ahora - deshaciendo > D_DESHACER) formar(true);

    const flota = Math.sin(ahora / 1600) * 3; // el logo flota apenas
    for (const m of marcas) {
      if (ahora >= m.sale) {
        const tx = m.tx + Math.sin(ahora / 900 + m.fase) * 0.5 * k;
        const ty = m.ty + Math.cos(ahora / 1100 + m.fase) * 0.5 * k + flota;
        m.vx = (m.vx + (tx - m.x) * 0.045) * 0.84;
        m.vy = (m.vy + (ty - m.y) * 0.045) * 0.84;
        m.ang = girarHacia(m.ang, m.tang, 0.12);
      } else {
        m.vx = (m.vx + azar(-0.025, 0.025)) * 0.98;
        m.vy = (m.vy + azar(-0.025, 0.025)) * 0.98;
        m.ang += m.va;
        rebotar(m, w, h);
      }
      apartarDe(m, cursor, 32 * k);
      m.x += m.vx;
      m.y += m.vy;
    }
    for (const g of sueltos) {
      derivar(g);
      rebotar(g, w, h, 16 * k);
      apartarDe(g, cursor, 32 * k);
      g.vx *= 0.99;
      g.vy *= 0.99;
      g.x += g.vx;
      g.y += g.vy;
      g.ang += g.va;
    }
    return flota;
  };

  const alfaBorde = (x, y) =>
    Math.max(0, Math.min(1, (Math.min(x, y, w - x, h - y) - 2) / (16 * k))) *
    (atenuar ? atenuar(x, y, w, h) : 1);

  const pintar = (ahora, flota = 0) => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const t = ahora - inicio;
    const salida = deshaciendo ? Math.max(0, 1 - (ahora - deshaciendo) / 400) : 1;
    const escala = caja.tam / ANCHO_LOGO;

    // Garabatos sueltos en los colores del logo.
    ctx.lineWidth = 1.5 * Math.min(k, 1.6);
    for (const g of sueltos) {
      ctx.strokeStyle = `rgb(${colores[g.color % colores.length]})`;
      pintarGarabato(ctx, g, g.alfa * alfaBorde(g.x, g.y));
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

    // Rayitas de crayón (el contorno dibujado a mano).
    const relleno = Math.min(1, Math.max(0, (t - T_RELLENO) / 900));
    for (const m of marcas) {
      ctx.strokeStyle = `rgb(${colores[m.color]})`;
      const alfa = m.alfa * alfaBorde(m.x, m.y) * (1 - 0.65 * relleno * salida);
      pintarMarca(ctx, m, 2.2 * k, alfa, 0.7 * k);
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
