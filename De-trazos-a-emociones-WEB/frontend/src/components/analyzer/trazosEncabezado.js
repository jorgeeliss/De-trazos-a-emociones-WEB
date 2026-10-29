// Encabezado del Analyzer: trazos ondulados (como la onda del logo), cada uno
// en el color de una emoción, que se dibujan solos, se ondulan un rato y se
// borran. Al pasar el mouse se agitan más; al hacer clic nace un trazo nuevo
// desde ese punto con una pequeña chispa de rayitas.

const TAU = Math.PI * 2;
const EMOCIONES = ['alegria', 'calma', 'tristeza', 'enojo', 'miedo', 'ansiedad'];
const SEGMENTOS = 48;

const azar = (a, b) => a + Math.random() * (b - a);
const suave = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const hexARgb = (valor) => {
  const v = (valor || '').trim();
  const m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).join(', ');
  const n = v.match(/\d+(\.\d+)?/g);
  return n && n.length >= 3 ? n.slice(0, 3).join(', ') : '139, 121, 242';
};

export function crearTrazosEncabezado(canvas, {
  zona = canvas,
  // Hasta dónde llega el texto del encabezado (px desde la izquierda del lienzo).
  finTexto = () => 0,
  cantidad = 6,
  reducido = false,
}) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let colores = {};
  let trazos = [];
  let chispas = [];
  let raf = 0;
  let marco = 0;
  let agitacion = 1; // sube al pasar el mouse
  let encima = false;
  let siguienteColor = 0;

  const medir = () => {
    const dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const leerColores = () => {
    const raiz = getComputedStyle(document.documentElement);
    colores = Object.fromEntries(EMOCIONES.map((e) => [e, hexARgb(raiz.getPropertyValue(`--emo-${e}`))]));
  };

  const colorNuevo = () => {
    const e = EMOCIONES[siguienteColor % EMOCIONES.length];
    siguienteColor += 1;
    return e;
  };

  // Un trazo: onda entre dos puntos, con su propio ciclo de vida.
  const crearTrazo = (ahora, { x = null, y = null, rapido = false } = {}) => {
    const inicioX = Math.max(finTexto() + 20, w * 0.36);
    const largo = azar(0.16, 0.3) * w;
    const x0 = x ?? azar(inicioX, Math.max(inicioX + 10, w - largo - 24));
    const y0 = y ?? azar(h * 0.22, h * 0.78);
    const dir = x != null && x > w * 0.7 ? -1 : 1;
    return {
      x0,
      y0,
      dx: largo * dir,
      dy: azar(-0.18, 0.18) * h,
      amp: azar(4, 9),
      ciclos: azar(1.2, 2.4),
      fase: azar(0, TAU),
      vel: azar(0.0015, 0.003),
      grosor: azar(2.6, 3.6),
      emocion: colorNuevo(),
      nace: ahora + (rapido ? 0 : azar(0, 900)),
      dibujo: rapido ? 550 : azar(900, 1300),
      vive: azar(1800, 3400),
      borra: azar(700, 1000),
      unaVez: rapido,
    };
  };

  // Puntos del trazo entre las fracciones "desde" y "hasta" de su largo.
  const puntos = (t, ahora, desde, hasta) => {
    const pts = [];
    for (let i = 0; i <= SEGMENTOS; i++) {
      const u = desde + ((hasta - desde) * i) / SEGMENTOS;
      const onda = Math.sin(u * TAU * t.ciclos + t.fase + ahora * t.vel * agitacion) * t.amp * agitacion;
      // Perpendicular aproximada: el trazo es casi horizontal.
      pts.push([t.x0 + t.dx * u, t.y0 + t.dy * u + onda * (0.4 + 0.6 * Math.sin(Math.PI * u))]);
    }
    return pts;
  };

  // Se desvanece cerca del borde del encabezado y antes del texto.
  const alfa = (x, y) => {
    const borde = Math.min(1, Math.max(0, (Math.min(x, y, w - x, h - y) - 2) / 14));
    const texto = Math.min(1, Math.max(0, (x - finTexto()) / 40));
    return borde * texto;
  };

  const trazar = (pts, rgb, grosor, alfaBase, ox = 0, oy = 0) => {
    // Por tramos, para que cada parte tenga su opacidad según el borde.
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      ctx.globalAlpha = alfaBase * alfa(x1, y1);
      if (ctx.globalAlpha <= 0.01) continue;
      ctx.strokeStyle = `rgb(${rgb})`;
      ctx.lineWidth = grosor;
      ctx.beginPath();
      ctx.moveTo(x0 + ox, y0 + oy);
      ctx.lineTo(x1 + ox, y1 + oy);
      ctx.stroke();
    }
  };

  const pintarTrazo = (t, ahora) => {
    const edad = ahora - t.nace;
    if (edad < 0) return true;
    let desde = 0;
    let hasta = 1;
    if (edad < t.dibujo) hasta = suave(edad / t.dibujo);
    else if (edad > t.dibujo + t.vive) {
      const b = (edad - t.dibujo - t.vive) / t.borra;
      if (b >= 1) return false;
      desde = suave(b);
    }
    if (hasta - desde < 0.01) return true;
    const pts = puntos(t, ahora, desde, hasta);
    const rgb = colores[t.emocion];
    trazar(pts, rgb, t.grosor, 0.9);
    // Segunda pasada fina, desplazada: textura de crayón.
    trazar(pts, rgb, t.grosor * 0.4, 0.35, 0.8, -0.9);
    return true;
  };

  const pintarChispas = (ahora) => {
    chispas = chispas.filter((c) => ahora - c.nace < 520);
    for (const c of chispas) {
      const p = suave(Math.min(1, (ahora - c.nace) / 520));
      const r0 = 6 + 10 * p;
      const r1 = 10 + 18 * p;
      const x0 = c.x + Math.cos(c.ang) * r0;
      const y0 = c.y + Math.sin(c.ang) * r0;
      const x1 = c.x + Math.cos(c.ang) * r1;
      const y1 = c.y + Math.sin(c.ang) * r1;
      ctx.globalAlpha = (1 - p) * 0.9 * alfa(x1, y1);
      ctx.strokeStyle = `rgb(${colores[c.emocion]})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  };

  const pintar = (ahora) => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    trazos = trazos.filter((t) => {
      const sigue = pintarTrazo(t, ahora);
      return sigue || !t.unaVez;
    });
    // Los trazos del ciclo que terminaron renacen en otro lugar.
    trazos = trazos.map((t) => (!t.unaVez && ahora - t.nace > t.dibujo + t.vive + t.borra ? crearTrazo(ahora) : t));
    pintarChispas(ahora);
    ctx.globalAlpha = 1;
  };

  const bucle = (ahora) => {
    marco += 1;
    if (marco % 120 === 0) leerColores();
    agitacion += ((encima ? 1.9 : 1) - agitacion) * 0.06;
    if (w > 0 && h > 0) pintar(ahora);
    raf = requestAnimationFrame(bucle);
  };

  const alEntrar = () => {
    encima = true;
  };
  const alSalir = () => {
    encima = false;
  };

  let tiempoResize = 0;
  const observador =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          clearTimeout(tiempoResize);
          tiempoResize = setTimeout(medir, 120);
        })
      : null;

  medir();
  leerColores();
  const ahora0 = performance.now();
  trazos = Array.from({ length: cantidad }, (_, i) => {
    const t = crearTrazo(ahora0);
    t.nace = ahora0 + i * 350;
    return t;
  });
  observador?.observe(canvas);
  if (reducido) {
    // Sin movimiento: los trazos quedan dibujados y quietos.
    trazos.forEach((t) => {
      t.nace = ahora0 - t.dibujo - 10;
      t.vive = Infinity;
    });
    pintar(ahora0);
  } else {
    zona.addEventListener('pointerenter', alEntrar);
    zona.addEventListener('pointerleave', alSalir);
    raf = requestAnimationFrame(bucle);
  }

  return {
    // Clic: nace un trazo desde ese punto (coordenadas de pantalla).
    nacerEn(clientX, clientY) {
      if (reducido) return;
      const r = canvas.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      const ahora = performance.now();
      const nuevo = crearTrazo(ahora, { x, y, rapido: true });
      trazos.push(nuevo);
      for (let i = 0; i < 5; i++) {
        chispas.push({ x, y, ang: (i / 5) * TAU + azar(-0.3, 0.3), nace: ahora, emocion: nuevo.emocion });
      }
    },
    destruir() {
      cancelAnimationFrame(raf);
      clearTimeout(tiempoResize);
      observador?.disconnect();
      zona.removeEventListener('pointerenter', alEntrar);
      zona.removeEventListener('pointerleave', alSalir);
    },
  };
}
