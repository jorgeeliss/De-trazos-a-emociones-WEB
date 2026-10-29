// Simulación en canvas para el Dashboard: trazos cortos de crayón que llegan
// dispersos y se acomodan, en el orden del dibujo, hasta formar la cara de la
// emoción. Alrededor flotan garabatos sueltos. Todo en el color de la emoción
// (color CSS del lienzo). La geometría replica los iconos de lucide (caja 24x24).

const TAU = Math.PI * 2;

// --- Geometría de las caras (unidades de la caja 24 x 24) -------------------
const arco = (cx, cy, rx, ry, a0, a1) => (t) => {
  const a = a0 + (a1 - a0) * t;
  return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
};
const linea = ([x0, y0], [x1, y1]) => (t) => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
const curva = ([x0, y0], [cx, cy], [x1, y1]) => (t) => {
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
};

// El contorno empieza arriba y gira en sentido horario, como un trazo a mano.
const CONTORNO = { f: arco(12, 12, 10, 10, -Math.PI / 2, 1.5 * Math.PI), cerrado: true };
const ojos = (y = 9) => [{ punto: [9, y] }, { punto: [15, y] }];
const OJOS_LINEA = [{ f: linea([8, 9], [10, 9]) }, { f: linea([14, 9], [16, 9]) }];

const CARAS = {
  risa: [CONTORNO, { f: arco(12, 13, 6, 5, 0, Math.PI) }, { f: linea([6, 13], [18, 13]) }, ...ojos()],
  sonrisa: [CONTORNO, { f: curva([8, 14], [12, 18], [16, 14]) }, ...ojos()],
  triste: [CONTORNO, { f: curva([8, 16], [12, 12], [16, 16]) }, ...ojos()],
  neutra: [CONTORNO, { f: linea([8, 15], [16, 15]) }, ...ojos()],
  molesta: [CONTORNO, { f: linea([8, 15], [16, 15]) }, ...OJOS_LINEA],
  enojo: [
    CONTORNO,
    { f: curva([8, 16], [12, 12], [16, 16]) },
    { f: linea([7.5, 8], [10, 9]) },
    { f: linea([14, 9], [16.5, 8]) },
    ...ojos(10.5),
  ],
};

const largoDe = (f) => {
  let largo = 0;
  let [px, py] = f(0);
  for (let i = 1; i <= 40; i++) {
    const [x, y] = f(i / 40);
    largo += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return largo;
};

const azar = (a, b) => a + Math.random() * (b - a);

// Destinos de los trazos (posición, ángulo y largo) en el orden del dibujo.
// "k" escala tamaños para que se vea igual en cualquier lienzo.
const trazosDeCara = (cara, { cx, cy, tam }, k) => {
  const escala = tam / 24;
  const ox = cx - tam / 2;
  const oy = cy - tam / 2;
  const espaciado = 4.2 * k;
  const marcas = [];
  for (const seg of CARAS[cara] || CARAS.neutra) {
    if (seg.punto) {
      // Ojo: un pequeño garabato de tres rayitas cruzadas.
      const x = ox + seg.punto[0] * escala;
      const y = oy + seg.punto[1] * escala;
      for (const ang of [0.3, 1.4, 2.5]) marcas.push({ x, y, ang, largo: 4.2 * k });
      continue;
    }
    const n = Math.max(3, Math.round((largoDe(seg.f) * escala) / espaciado));
    for (let i = 0; i < n; i++) {
      const t = seg.cerrado ? i / n : i / (n - 1);
      const [x, y] = seg.f(t);
      const [x0, y0] = seg.f(Math.max(0, t - 0.01));
      const [x1, y1] = seg.f(Math.min(1, t + 0.01));
      const ang = Math.atan2(y1 - y0, x1 - x0);
      // Un poco de imprecisión de mano: corrimiento perpendicular y ángulo.
      const corr = azar(-0.6, 0.6) * k;
      marcas.push({
        x: ox + x * escala - Math.sin(ang) * corr,
        y: oy + y * escala + Math.cos(ang) * corr,
        ang: ang + azar(-0.15, 0.15),
        largo: espaciado * azar(1.35, 1.7),
      });
    }
  }
  return marcas;
};

// Garabatos sueltos: puntos de un trazo corto, centrados en (0, 0).
const GARABATOS = [
  (s) => Array.from({ length: 14 }, (_, i) => [(i / 13 - 0.5) * 22 * s, Math.sin((i / 13) * TAU * 1.2) * 3.5 * s]),
  (s) => Array.from({ length: 18 }, (_, i) => {
    const a = (i / 17) * TAU * 1.3;
    const r = (2 + i * 0.45) * s;
    return [Math.cos(a) * r, Math.sin(a) * r];
  }),
  (s) => Array.from({ length: 6 }, (_, i) => [(i / 5 - 0.5) * 20 * s, (i % 2 ? 4 : -4) * s]),
  (s) => Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI * (0.15 + 0.7 * (i / 9));
    return [Math.cos(a) * 9 * s, -Math.sin(a) * 6 * s];
  }),
];

const DURACION_DIBUJO_MS = 1500;

export function crearSimulacion(canvas, {
  cara,
  reducido = false,
  // Elemento que recibe el puntero (los trazos se apartan del cursor).
  zona = canvas,
  // Dónde va la cara dentro del lienzo: { cx, cy, tam } en píxeles.
  ubicarCara = (w, h) => ({ cx: w / 2, cy: h / 2, tam: Math.min(w, h) * 0.66 }),
  // Garabatos sueltos por píxel cuadrado.
  densidadSueltas = 1 / 11000,
  // (x, y, w, h) => 0..1: baja la opacidad en zonas con texto encima.
  atenuar = null,
}) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let k = 1;
  let ubicacion = { cx: 0, cy: 0, tam: 0 };
  let color = '#8b79f2';
  let rgb = null;
  let trazos = []; // los que forman la cara
  let sueltos = []; // garabatos que flotan alrededor
  let cursor = null;
  let raf = 0;
  let marco = 0;
  let caraActual = cara;

  const medir = () => {
    const dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ubicacion = ubicarCara(w, h);
    k = Math.max(0.8, Math.min(2.6, ubicacion.tam / 96));
  };

  // El color sale del CSS del lienzo (color: var(--animo-color)): sigue al tema.
  const leerColor = () => {
    color = getComputedStyle(canvas).color || color;
    const m = color.match(/\d+(\.\d+)?/g);
    rgb = m ? `${m[0]}, ${m[1]}, ${m[2]}` : null;
  };

  const posicionAlAzar = () => ({ x: 12 + Math.random() * (w - 24), y: 12 + Math.random() * (h - 24) });
  // Para los trazos de la cara: preferir zonas sin texto encima.
  const posicionLibre = () => {
    let p = posicionAlAzar();
    for (let i = 0; i < 6 && atenuar && atenuar(p.x, p.y, w, h) < 0.7; i++) p = posicionAlAzar();
    return p;
  };

  // Programa el dibujo: cada trazo "sale" hacia su sitio en el orden del dibujo.
  const dibujar = (nuevaCara, { desdeActual = false, retraso = 0, duracion = DURACION_DIBUJO_MS } = {}) => {
    caraActual = nuevaCara;
    const destinos = trazosDeCara(nuevaCara, ubicacion, k);
    const ahora = performance.now();
    const paso = duracion / destinos.length;
    const anteriores = trazos;
    trazos = destinos.map((d, i) => {
      const previo = desdeActual && anteriores.length ? anteriores[i % anteriores.length] : null;
      const inicio = previo || posicionLibre();
      return {
        x: inicio.x,
        y: inicio.y,
        ang: previo ? previo.ang : Math.random() * TAU,
        vx: previo ? previo.vx : azar(-0.3, 0.3) * k,
        vy: previo ? previo.vy : azar(-0.3, 0.3) * k,
        va: previo ? previo.va : azar(-0.04, 0.04),
        tx: d.x,
        ty: d.y,
        tang: d.ang,
        largo: d.largo,
        alfa: azar(0.75, 1),
        sale: ahora + retraso + i * paso,
        fase: Math.random() * TAU,
      };
    });
    if (reducido) trazos.forEach((p) => Object.assign(p, { x: p.tx, y: p.ty, ang: p.tang, sale: 0 }));
  };

  const crearSueltos = () => {
    const cantidad = Math.max(5, Math.min(40, Math.round(w * h * densidadSueltas)));
    sueltos = Array.from({ length: cantidad }, () => ({
      ...posicionAlAzar(),
      vx: azar(-0.18, 0.18),
      vy: azar(-0.18, 0.18),
      ang: Math.random() * TAU,
      va: azar(-0.005, 0.005),
      puntos: GARABATOS[Math.floor(Math.random() * GARABATOS.length)](azar(0.6, 1) * k * 0.8),
      alfa: azar(0.25, 0.45),
    }));
  };

  const rebotar = (p, margen = 8) => {
    if (p.x < margen) p.vx = Math.abs(p.vx);
    if (p.x > w - margen) p.vx = -Math.abs(p.vx);
    if (p.y < margen) p.vy = Math.abs(p.vy);
    if (p.y > h - margen) p.vy = -Math.abs(p.vy);
  };

  const apartarDelCursor = (p) => {
    if (!cursor) return;
    const radio = 30 * k;
    const dx = p.x - cursor.x;
    const dy = p.y - cursor.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < radio) {
      const fuerza = (1 - d / radio) * 1.4;
      p.vx += (dx / d) * fuerza;
      p.vy += (dy / d) * fuerza;
    }
  };

  // Gira el ángulo hacia el destino por el camino más corto.
  const girarHacia = (a, destino, factor) => {
    let d = (destino - a) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return a + d * factor;
  };

  const actualizar = (ahora) => {
    const resp = 0.6 * k;
    for (const p of trazos) {
      if (ahora >= p.sale) {
        // Ya va a su sitio: resorte suave + una leve "respiración".
        const tx = p.tx + Math.sin(ahora / 900 + p.fase) * resp;
        const ty = p.ty + Math.cos(ahora / 1100 + p.fase) * resp;
        p.vx = (p.vx + (tx - p.x) * 0.045) * 0.84;
        p.vy = (p.vy + (ty - p.y) * 0.045) * 0.84;
        p.ang = girarHacia(p.ang, p.tang, 0.12);
      } else {
        // Todavía suelto: deriva y gira despacio.
        p.vx = (p.vx + azar(-0.025, 0.025)) * 0.98;
        p.vy = (p.vy + azar(-0.025, 0.025)) * 0.98;
        p.ang += p.va;
        rebotar(p);
      }
      apartarDelCursor(p);
      p.x += p.vx;
      p.y += p.vy;
    }
    for (const g of sueltos) {
      g.vx += azar(-0.015, 0.015);
      g.vy += azar(-0.015, 0.015);
      const v = Math.hypot(g.vx, g.vy);
      if (v > 0.35) {
        g.vx *= 0.35 / v;
        g.vy *= 0.35 / v;
      }
      rebotar(g, 16 * k);
      apartarDelCursor(g);
      g.vx *= 0.99;
      g.vy *= 0.99;
      g.x += g.vx;
      g.y += g.vy;
      g.ang += g.va;
    }
  };

  // Se desvanece cerca del borde del lienzo (así nunca se nota su recuadro) y
  // donde haya texto encima.
  const alfaBorde = (x, y) =>
    Math.max(0, Math.min(1, (Math.min(x, y, w - x, h - y) - 2) / (16 * k))) *
    (atenuar ? atenuar(x, y, w, h) : 1);

  const pintar = () => {
    ctx.clearRect(0, 0, w, h);
    const { cx, cy, tam } = ubicacion;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Halo suave detrás de la cara.
    if (rgb) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, tam * 0.85);
      g.addColorStop(0, `rgba(${rgb}, 0.14)`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(cx - tam, cy - tam, tam * 2, tam * 2);
    }

    ctx.strokeStyle = color;

    // Garabatos sueltos.
    ctx.lineWidth = 1.5 * Math.min(k, 1.6);
    for (const g of sueltos) {
      const cos = Math.cos(g.ang);
      const sin = Math.sin(g.ang);
      ctx.globalAlpha = g.alfa * alfaBorde(g.x, g.y);
      ctx.beginPath();
      g.puntos.forEach(([px, py], i) => {
        const x = g.x + px * cos - py * sin;
        const y = g.y + px * sin + py * cos;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Trazos de la cara, con una segunda pasada fina que imita el crayón.
    const grosor = 2.1 * k;
    for (const p of trazos) {
      const fa = alfaBorde(p.x, p.y) * p.alfa;
      const dx = (Math.cos(p.ang) * p.largo) / 2;
      const dy = (Math.sin(p.ang) * p.largo) / 2;
      ctx.globalAlpha = 0.9 * fa;
      ctx.lineWidth = grosor;
      ctx.beginPath();
      ctx.moveTo(p.x - dx, p.y - dy);
      ctx.lineTo(p.x + dx, p.y + dy);
      ctx.stroke();
      const ox = -Math.sin(p.ang) * 0.7 * k;
      const oy = Math.cos(p.ang) * 0.7 * k;
      ctx.globalAlpha = 0.35 * fa;
      ctx.lineWidth = grosor * 0.45;
      ctx.beginPath();
      ctx.moveTo(p.x - dx * 0.8 + ox, p.y - dy * 0.8 + oy);
      ctx.lineTo(p.x + dx * 0.9 + ox, p.y + dy * 0.9 + oy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const bucle = (ahora) => {
    marco += 1;
    if (marco % 90 === 0) leerColor();
    if (w > 0 && h > 0) {
      actualizar(ahora);
      pintar();
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

  // Impulso hacia afuera desde la cara (clic).
  const empujar = (fuerzaMin, fuerzaVar) => {
    const { cx, cy } = ubicacion;
    for (const p of trazos) {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const f = (fuerzaMin + Math.random() * fuerzaVar) * Math.sqrt(k);
      p.vx += (dx / d) * f + azar(-0.75, 0.75);
      p.vy += (dy / d) * f + azar(-0.75, 0.75);
      p.va = azar(-0.15, 0.15);
    }
    for (const g of sueltos) {
      g.vx += azar(-1, 1);
      g.vy += azar(-1, 1);
    }
  };

  // Si cambia el tamaño del lienzo, se recoloca la cara y los garabatos.
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
            dibujar(caraActual, { desdeActual: true, duracion: 500 });
            if (reducido) pintar();
          }, 150);
        })
      : null;

  // --- Inicio ---
  medir();
  leerColor();
  crearSueltos();
  dibujar(cara, { retraso: 250 });
  observador?.observe(canvas);
  if (reducido) {
    pintar();
  } else {
    zona.addEventListener('pointermove', alMover);
    zona.addEventListener('pointerleave', alSalir);
    raf = requestAnimationFrame(bucle);
  }

  return {
    // Pasa de la cara actual a la nueva, trazo por trazo.
    cambiarCara(nuevaCara) {
      leerColor();
      if (nuevaCara === caraActual) {
        if (reducido) pintar();
        return;
      }
      dibujar(nuevaCara, { desdeActual: true });
      if (reducido) pintar();
    },
    // Clic: la cara se deshace en trazos sueltos y se vuelve a dibujar.
    dispersar() {
      if (reducido) return;
      empujar(2.5, 3);
      dibujar(caraActual, { desdeActual: true, retraso: 500, duracion: DURACION_DIBUJO_MS * 0.75 });
    },
    destruir() {
      cancelAnimationFrame(raf);
      clearTimeout(tiempoResize);
      observador?.disconnect();
      zona.removeEventListener('pointermove', alMover);
      zona.removeEventListener('pointerleave', alSalir);
    },
  };
}
