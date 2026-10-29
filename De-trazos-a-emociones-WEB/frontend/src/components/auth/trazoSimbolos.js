// Panel del login y el registro: un solo trazo dibujado a mano que forma el
// símbolo de una emoción (sol, gota, olas, rayo, espiral, rizos) y luego se
// transforma en el siguiente, cambiando al color de esa emoción (--emo-*).
// "De trazos a emociones", literal.

const TAU = Math.PI * 2;
const PUNTOS = 260;

// --- Símbolos: polilíneas en una caja de -1..1 (y hacia abajo) --------------
const muestrear = (f, n = 400) => Array.from({ length: n + 1 }, (_, i) => f(i / n));
const unir = (...partes) => partes.flat();
const segmento = ([x0, y0], [x1, y1], n = 30) =>
  Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
const triangular = (u) => 1 - Math.abs(((u % 1) + 1) % 1 * 2 - 1);

const SIMBOLOS = {
  // Sol: un círculo y, alrededor, una corona de rayos en zigzag.
  sol: () =>
    unir(
      muestrear((u) => {
        const a = -Math.PI / 2 + u * TAU;
        return [0.46 * Math.cos(a), 0.46 * Math.sin(a)];
      }),
      muestrear((u) => {
        const a = -Math.PI / 2 + u * TAU;
        const r = 0.66 + 0.3 * triangular(u * 12);
        return [r * Math.cos(a), r * Math.sin(a)];
      }, 600),
    ),
  // Gota: punta arriba y base redondeada.
  gota: () =>
    muestrear((u) => {
      const t = u * TAU;
      return [0.78 * Math.sin(t) * Math.sin(t / 2), -0.92 * Math.cos(t) + 0.04];
    }),
  // Olas: tres ondas suaves enlazadas en un solo trazo.
  olas: () => {
    const fila = (y, ida) =>
      muestrear((u) => {
        const x = ida ? -0.85 + 1.7 * u : 0.85 - 1.7 * u;
        return [x, y + 0.11 * Math.sin(u * TAU * 2 * (ida ? 1 : -1))];
      }, 200);
    const vuelta = (y, derecha) =>
      muestrear((u) => {
        const a = -Math.PI / 2 + u * Math.PI;
        return [(derecha ? 0.85 : -0.85) + (derecha ? 1 : -1) * 0.22 * Math.cos(a), y + 0.22 + 0.22 * Math.sin(a)];
      }, 60);
    return unir(fila(-0.44, true), vuelta(-0.44, true), fila(0, false), vuelta(0, false), fila(0.44, true));
  },
  // Rayo: contorno de un relámpago.
  rayo: () => {
    const v = [[0.12, -1], [-0.46, 0.12], [-0.03, 0.12], [-0.24, 1], [0.48, -0.2], [0.06, -0.2], [0.32, -1], [0.12, -1]];
    return unir(...v.slice(0, -1).map((p, i) => segmento(p, v[i + 1])));
  },
  // Espiral: tres vueltas hacia adentro.
  espiral: () =>
    muestrear((u) => {
      const r = 0.92 - 0.84 * u;
      const a = -Math.PI / 2 + u * TAU * 3;
      return [r * Math.cos(a), r * Math.sin(a)];
    }, 600),
  // Rizos: un garabato de bucles seguidos, como trazo nervioso.
  rizos: () =>
    muestrear((u) => {
      const w = TAU * 6;
      return [-0.9 + 1.8 * u - 0.2 * Math.sin(w * u), -0.34 * Math.cos(w * u) + 0.34];
    }, 700).map(([x, y]) => [x, y - 0.34]),
};

// Remuestrea una polilínea a "n" puntos equidistantes (para transformar uno en otro).
const remuestrear = (pts, n = PUNTOS) => {
  const acum = [0];
  for (let i = 1; i < pts.length; i++) {
    acum.push(acum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = acum[acum.length - 1];
  const salida = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const objetivo = (total * i) / (n - 1);
    while (j < acum.length - 2 && acum[j + 1] < objetivo) j++;
    const tramo = acum[j + 1] - acum[j] || 1;
    const t = (objetivo - acum[j]) / tramo;
    salida.push([
      pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t,
      pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t,
    ]);
  }
  return salida;
};

export const CICLO = [
  { simbolo: 'sol', emocion: 'alegria', nombre: 'Alegría' },
  { simbolo: 'gota', emocion: 'tristeza', nombre: 'Tristeza' },
  { simbolo: 'olas', emocion: 'calma', nombre: 'Calma' },
  { simbolo: 'rayo', emocion: 'enojo', nombre: 'Enojo' },
  { simbolo: 'espiral', emocion: 'miedo', nombre: 'Miedo' },
  { simbolo: 'rizos', emocion: 'ansiedad', nombre: 'Ansiedad' },
];
const FORMAS = Object.fromEntries(CICLO.map((c) => [c.simbolo, remuestrear(SIMBOLOS[c.simbolo]())]));

const DIBUJO_MS = 1900;
const QUIETO_MS = 2700;
const CAMBIO_MS = 1400;

const suave = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const hexARgb = (valor, porDefecto) => {
  const v = (valor || '').trim();
  const m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  const n = v.match(/\d+(\.\d+)?/g);
  return n && n.length >= 3 ? n.slice(0, 3).map(Number) : porDefecto;
};

export function crearTrazoSimbolos(canvas, { zona = canvas, ubicar, reducido = false }) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let caja = { cx: 0, cy: 0, tam: 0 };
  let colores = {};
  let colorTexto = '#888';
  let indice = 0;
  let fase = reducido ? 'quieto' : 'dibujando';
  let inicioFase = performance.now();
  let raf = 0;
  let marco = 0;
  let cursor = null;
  const desvio = Array.from({ length: PUNTOS }, () => [0, 0]);

  const medir = () => {
    const dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    caja = ubicar(w, h);
  };

  const leerColores = () => {
    const raiz = getComputedStyle(document.documentElement);
    colores = Object.fromEntries(
      CICLO.map((c) => [c.emocion, hexARgb(raiz.getPropertyValue(`--emo-${c.emocion}`), [139, 121, 242])]),
    );
    colorTexto = raiz.getPropertyValue('--muted').trim() || colorTexto;
  };

  const siguiente = () => (indice + 1) % CICLO.length;

  const avanzarFase = (ahora) => {
    const t = ahora - inicioFase;
    if (fase === 'dibujando' && t >= DIBUJO_MS) {
      fase = 'quieto';
      inicioFase = ahora;
    } else if (fase === 'quieto' && t >= QUIETO_MS && !reducido) {
      fase = 'cambiando';
      inicioFase = ahora;
    } else if (fase === 'cambiando' && t >= CAMBIO_MS) {
      indice = siguiente();
      fase = 'quieto';
      inicioFase = ahora;
    }
  };

  // Puntos actuales (en píxeles), el color y cuánto del trazo se ve.
  const estado = (ahora) => {
    const t = ahora - inicioFase;
    const a = FORMAS[CICLO[indice].simbolo];
    const ca = colores[CICLO[indice].emocion];
    const escala = caja.tam / 2;
    let pts = a;
    let color = ca;
    let visible = 1;
    let mezcla = 0;
    if (fase === 'dibujando') visible = suave(Math.min(1, t / DIBUJO_MS));
    if (fase === 'cambiando') {
      mezcla = suave(Math.min(1, t / CAMBIO_MS));
      const b = FORMAS[CICLO[siguiente()].simbolo];
      const cb = colores[CICLO[siguiente()].emocion];
      // A mitad de camino el trazo se ondula un poco: se ve más fluido.
      const onda = Math.sin(Math.PI * mezcla) * 0.07;
      pts = a.map(([x, y], i) => [
        x + (b[i][0] - x) * mezcla + Math.sin(i * 0.21 + ahora / 160) * onda,
        y + (b[i][1] - y) * mezcla + Math.cos(i * 0.17 + ahora / 190) * onda,
      ]);
      color = ca.map((v, i) => Math.round(v + (cb[i] - v) * mezcla));
    }
    // Leve temblor de mano mientras está quieto.
    const temblor = 0.006;
    const enPx = pts.map(([x, y], i) => [
      caja.cx + (x + Math.sin(ahora / 700 + i * 0.5) * temblor) * escala + desvio[i][0],
      caja.cy + (y + Math.cos(ahora / 820 + i * 0.4) * temblor) * escala + desvio[i][1],
    ]);
    return { pts: enPx, color, visible, mezcla };
  };

  // El trazo se aparta suavemente del cursor.
  const actualizarDesvio = (pts) => {
    const radio = 70;
    pts.forEach(([x, y], i) => {
      let ox = 0;
      let oy = 0;
      if (cursor) {
        const dx = x - desvio[i][0] - cursor.x;
        const dy = y - desvio[i][1] - cursor.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < radio) {
          const f = Math.pow(1 - d / radio, 2) * 16;
          ox = (dx / d) * f;
          oy = (dy / d) * f;
        }
      }
      desvio[i][0] += (ox - desvio[i][0]) * 0.15;
      desvio[i][1] += (oy - desvio[i][1]) * 0.15;
    });
  };

  const trazar = (pts, hasta) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < hasta; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  };

  const pintar = (ahora = performance.now()) => {
    ctx.clearRect(0, 0, w, h);
    const { pts, color, visible, mezcla } = estado(ahora);
    actualizarDesvio(pts);
    const hasta = Math.max(2, Math.round(visible * pts.length));
    const rgb = color.join(', ');
    const grosor = Math.max(3, caja.tam / 48);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Halo de color detrás del símbolo.
    const g = ctx.createRadialGradient(caja.cx, caja.cy, 0, caja.cx, caja.cy, caja.tam * 0.8);
    g.addColorStop(0, `rgba(${rgb}, 0.13)`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(caja.cx - caja.tam, caja.cy - caja.tam, caja.tam * 2, caja.tam * 2);

    // Trazo: brillo ancho y tenue, línea principal y una pasada fina de crayón.
    ctx.strokeStyle = `rgb(${rgb})`;
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = grosor * 3.2;
    trazar(pts, hasta);
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = grosor;
    trazar(pts, hasta);
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = grosor * 0.4;
    ctx.save();
    ctx.translate(grosor * 0.35, -grosor * 0.3);
    trazar(pts, hasta);
    ctx.restore();

    // Punta del lápiz mientras se dibuja.
    if (visible < 1) {
      const [px, py] = pts[hasta - 1];
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgb(${rgb})`;
      ctx.beginPath();
      ctx.arc(px, py, grosor * 1.1, 0, TAU);
      ctx.fill();
    }

    // Nombre de la emoción: aparece al terminar de dibujar y se cruza al cambiar.
    const t = ahora - inicioFase;
    let alfaTexto = 1;
    if (fase === 'dibujando') alfaTexto = Math.max(0, (t - DIBUJO_MS * 0.7) / (DIBUJO_MS * 0.3));
    if (fase === 'cambiando') alfaTexto = Math.abs(1 - 2 * mezcla);
    const nombre = fase === 'cambiando' && mezcla > 0.5 ? CICLO[siguiente()].nombre : CICLO[indice].nombre;
    ctx.globalAlpha = alfaTexto;
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.font = `700 ${Math.round(Math.max(15, caja.tam / 12))}px 'DM Sans', system-ui, sans-serif`;
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(nombre.toUpperCase(), caja.cx, caja.cy + caja.tam / 2 + 22);
    ctx.letterSpacing = '0px';
    ctx.globalAlpha = 1;
  };

  const bucle = (ahora) => {
    marco += 1;
    if (marco % 120 === 0) leerColores();
    avanzarFase(ahora);
    if (w > 0 && h > 0) pintar(ahora);
    raf = requestAnimationFrame(bucle);
  };

  const alMover = (e) => {
    const r = canvas.getBoundingClientRect();
    cursor = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const alSalir = () => {
    cursor = null;
  };
  // Clic: pasar a la siguiente emoción.
  const alClic = () => {
    if (fase === 'quieto') {
      fase = 'cambiando';
      inicioFase = performance.now();
    }
  };

  let tiempoResize = 0;
  const observador =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          clearTimeout(tiempoResize);
          tiempoResize = setTimeout(() => {
            medir();
            if (reducido) pintar();
          }, 120);
        })
      : null;

  medir();
  leerColores();
  observador?.observe(canvas);
  if (reducido) {
    pintar();
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
