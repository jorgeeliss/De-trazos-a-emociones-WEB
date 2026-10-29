// Simulación en canvas de moléculas que flotan dispersas y se van juntando, en
// el orden del trazo, hasta dibujar la cara de una emoción. La geometría replica
// los iconos de lucide (caja de 24 x 24). La usan el Dashboard (IconoAnimo) y el
// panel del login (AuthGraphics). Los colores salen de la rueda del logo
// (--rueda-1..4), así siguen al tema claro/oscuro.

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
const OJOS_PUNTO = [{ punto: [9, 9] }, { punto: [15, 9] }];
const OJOS_LINEA = [{ f: linea([8, 9], [10, 9]) }, { f: linea([14, 9], [16, 9]) }];

const CARAS = {
  risa: [CONTORNO, { f: arco(12, 13, 6, 5, 0, Math.PI) }, { f: linea([6, 13], [18, 13]) }, ...OJOS_PUNTO],
  sonrisa: [CONTORNO, { f: curva([8, 14], [12, 18], [16, 14]) }, ...OJOS_PUNTO],
  triste: [CONTORNO, { f: curva([8, 16], [12, 12], [16, 16]) }, ...OJOS_PUNTO],
  neutra: [CONTORNO, { f: linea([8, 15], [16, 15]) }, ...OJOS_PUNTO],
  molesta: [CONTORNO, { f: linea([8, 15], [16, 15]) }, ...OJOS_LINEA],
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

// Puntos destino (en píxeles) en el orden en que se "dibuja" la cara.
// "k" escala radios y separaciones para que se vea igual en cualquier tamaño.
const puntosDeCara = (cara, { cx, cy, tam }, k) => {
  const escala = tam / 24;
  const ox = cx - tam / 2;
  const oy = cy - tam / 2;
  const espaciado = 3.6 * k;
  const pts = [];
  for (const seg of CARAS[cara] || CARAS.neutra) {
    if (seg.punto) {
      // Ojo: un átomo central con cuatro pequeños alrededor.
      const x = ox + seg.punto[0] * escala;
      const y = oy + seg.punto[1] * escala;
      pts.push({ x, y, r: 2.6 * k });
      for (let i = 0; i < 4; i++) {
        const a = (i * TAU) / 4 + 0.4;
        pts.push({ x: x + Math.cos(a) * 2.6 * k, y: y + Math.sin(a) * 2.6 * k, r: 1.2 * k });
      }
      continue;
    }
    const n = Math.max(3, Math.round((largoDe(seg.f) * escala) / espaciado));
    for (let i = 0; i < n; i++) {
      const [x, y] = seg.f(seg.cerrado ? i / n : i / (n - 1));
      // Cada tanto un átomo más grande, para que se lea como molécula.
      pts.push({ x: ox + x * escala, y: oy + y * escala, r: (i % 6 === 0 ? 2.5 : 1.6) * k });
    }
  }
  return pts;
};

// Formas de las moléculas sueltas: posiciones de sus átomos y enlaces.
const FORMAS = [
  { atomos: [[0, 0], [1, 0]], enlaces: [[0, 1]] },
  { atomos: [[0, 0], [1, 0], [-0.5, 0.86]], enlaces: [[0, 1], [0, 2]] },
  { atomos: [[0, 0], [1, 0], [1.5, 0.86], [-0.5, 0.86]], enlaces: [[0, 1], [1, 2], [0, 3]] },
];

const DURACION_DIBUJO_MS = 1500;

export function crearSimulacion(canvas, {
  cara,
  reducido = false,
  // Elemento que recibe el puntero (las moléculas se apartan del cursor).
  zona = canvas,
  // Dónde va la cara dentro del lienzo: { cx, cy, tam } en píxeles.
  ubicarCara = (w, h) => ({ cx: w / 2, cy: h / 2, tam: Math.min(w, h) * 0.66 }),
  // Moléculas sueltas por píxel cuadrado.
  densidadSueltas = 1 / 11000,
  // Nombre de cada cara para escribirlo debajo cuando termina de dibujarse.
  etiquetas = null,
  // (x, y, w, h) => 0..1: baja la opacidad en zonas con texto encima.
  atenuar = null,
}) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let k = 1;
  let ubicacion = { cx: 0, cy: 0, tam: 0 };
  let colores = ['#8b79f2'];
  let halo = null;
  let colorTexto = '#888';
  let particulas = []; // las que forman la cara
  let sueltas = []; // moléculas que flotan alrededor
  let ondas = [];
  let cursor = null;
  let raf = 0;
  let marco = 0;
  let caraActual = cara;
  let etiquetaDesde = 0;

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

  const leerColores = () => {
    const raiz = getComputedStyle(document.documentElement);
    const rueda = [1, 2, 3, 4].map((n) => raiz.getPropertyValue(`--rueda-${n}`).trim()).filter(Boolean);
    if (rueda.length) colores = rueda;
    const propio = getComputedStyle(canvas);
    colorTexto = propio.getPropertyValue('--muted').trim() || colorTexto;
    // Halo detrás de la cara con el color del lienzo (emoción o acento).
    const m = propio.color.match(/\d+(\.\d+)?/g);
    halo = m ? `${m[0]}, ${m[1]}, ${m[2]}` : null;
  };

  const posicionAlAzar = () => ({ x: 12 + Math.random() * (w - 24), y: 12 + Math.random() * (h - 24) });

  // Para las moléculas de la cara: preferir zonas sin texto encima.
  const posicionLibre = () => {
    let p = posicionAlAzar();
    for (let i = 0; i < 6 && atenuar && atenuar(p.x, p.y, w, h) < 0.7; i++) p = posicionAlAzar();
    return p;
  };

  // Programa el dibujo: cada molécula "sale" hacia su destino en orden de trazo.
  const dibujar = (nuevaCara, { desdeActual = false, retraso = 0, duracion = DURACION_DIBUJO_MS } = {}) => {
    caraActual = nuevaCara;
    const destinos = puntosDeCara(nuevaCara, ubicacion, k);
    const ahora = performance.now();
    const paso = duracion / destinos.length;
    const anteriores = particulas;
    particulas = destinos.map((d, i) => {
      const previa = desdeActual && anteriores.length ? anteriores[i % anteriores.length] : null;
      const inicio = previa || posicionLibre();
      return {
        x: inicio.x,
        y: inicio.y,
        vx: previa ? previa.vx : (Math.random() - 0.5) * 0.6 * k,
        vy: previa ? previa.vy : (Math.random() - 0.5) * 0.6 * k,
        tx: d.x,
        ty: d.y,
        r: d.r * (0.9 + Math.random() * 0.25),
        // Colores del logo en tramos a lo largo del trazo.
        c: Math.floor(i / 7) % 4,
        sale: ahora + retraso + i * paso,
        fase: Math.random() * TAU,
      };
    });
    etiquetaDesde = ahora + retraso + duracion + 500;
    if (reducido) {
      particulas.forEach((p) => Object.assign(p, { x: p.tx, y: p.ty, sale: 0 }));
      etiquetaDesde = 0;
    }
  };

  const crearSueltas = () => {
    const cantidad = Math.max(6, Math.min(60, Math.round(w * h * densidadSueltas)));
    sueltas = Array.from({ length: cantidad }, () => {
      const forma = FORMAS[Math.floor(Math.random() * FORMAS.length)];
      const d = (6 + Math.random() * 3) * k;
      return {
        ...posicionAlAzar(),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        ang: Math.random() * TAU,
        va: (Math.random() - 0.5) * 0.008,
        atomos: forma.atomos.map(([ax, ay]) => ({
          dx: ax * d,
          dy: ay * d,
          r: (1 + Math.random() * 1.1) * k,
          c: Math.floor(Math.random() * 4),
        })),
        enlaces: forma.enlaces,
      };
    });
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

  const actualizar = (ahora) => {
    const resp = 0.7 * k;
    for (const p of particulas) {
      if (ahora >= p.sale) {
        // Ya va a su sitio: resorte suave + una leve "respiración".
        const tx = p.tx + Math.sin(ahora / 900 + p.fase) * resp;
        const ty = p.ty + Math.cos(ahora / 1100 + p.fase) * resp;
        p.vx = (p.vx + (tx - p.x) * 0.045) * 0.84;
        p.vy = (p.vy + (ty - p.y) * 0.045) * 0.84;
      } else {
        // Todavía suelta: deriva lenta por el área.
        p.vx = (p.vx + (Math.random() - 0.5) * 0.05) * 0.98;
        p.vy = (p.vy + (Math.random() - 0.5) * 0.05) * 0.98;
        rebotar(p);
      }
      apartarDelCursor(p);
      p.x += p.vx;
      p.y += p.vy;
    }
    for (const m of sueltas) {
      m.vx += (Math.random() - 0.5) * 0.03;
      m.vy += (Math.random() - 0.5) * 0.03;
      const v = Math.hypot(m.vx, m.vy);
      if (v > 0.45) {
        m.vx *= 0.45 / v;
        m.vy *= 0.45 / v;
      }
      rebotar(m, 14 * k);
      apartarDelCursor(m);
      m.vx *= 0.99;
      m.vy *= 0.99;
      m.x += m.vx;
      m.y += m.vy;
      m.ang += m.va;
    }
    ondas = ondas.filter((o) => o.a > 0.01);
    for (const o of ondas) {
      o.r += 2.2 * k;
      o.a *= 0.93;
    }
  };

  // Se desvanece cerca del borde del lienzo (así nunca se nota su recuadro) y
  // donde haya texto encima.
  const alfaBorde = (x, y) =>
    Math.max(0, Math.min(1, (Math.min(x, y, w - x, h - y) - 2) / (16 * k))) *
    (atenuar ? atenuar(x, y, w, h) : 1);

  const circulo = (x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  };

  const pintar = (ahora = performance.now()) => {
    ctx.clearRect(0, 0, w, h);
    const { cx, cy, tam } = ubicacion;

    // Halo suave detrás de la cara.
    if (halo) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, tam * 0.85);
      g.addColorStop(0, `rgba(${halo}, 0.16)`);
      g.addColorStop(1, `rgba(${halo}, 0)`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(cx - tam, cy - tam, tam * 2, tam * 2);
    }

    // Moléculas sueltas: átomos y sus enlaces.
    ctx.lineWidth = Math.max(0.8, 0.7 * k);
    for (const m of sueltas) {
      const cos = Math.cos(m.ang);
      const sin = Math.sin(m.ang);
      const pos = m.atomos.map((a) => [m.x + a.dx * cos - a.dy * sin, m.y + a.dx * sin + a.dy * cos]);
      const alfa = 0.5 * alfaBorde(m.x, m.y);
      ctx.globalAlpha = alfa * 0.6;
      for (const [i, j] of m.enlaces) {
        ctx.strokeStyle = colores[m.atomos[i].c % colores.length];
        ctx.beginPath();
        ctx.moveTo(pos[i][0], pos[i][1]);
        ctx.lineTo(pos[j][0], pos[j][1]);
        ctx.stroke();
      }
      ctx.globalAlpha = alfa;
      m.atomos.forEach((a, i) => {
        ctx.fillStyle = colores[a.c % colores.length];
        circulo(pos[i][0], pos[i][1], a.r);
      });
    }

    // Enlaces entre los átomos cercanos de la cara.
    const enlace = 9 * k;
    for (let i = 0; i < particulas.length; i++) {
      const a = particulas[i];
      const fa = alfaBorde(a.x, a.y);
      ctx.strokeStyle = colores[a.c % colores.length];
      for (let j = i + 1; j < particulas.length; j++) {
        const b = particulas[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (Math.abs(dx) > enlace || Math.abs(dy) > enlace) continue;
        const d = Math.hypot(dx, dy);
        if (d >= enlace) continue;
        ctx.globalAlpha = (1 - d / enlace) * 0.55 * Math.min(fa, alfaBorde(b.x, b.y));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    for (const p of particulas) {
      ctx.globalAlpha = 0.95 * alfaBorde(p.x, p.y);
      ctx.fillStyle = colores[p.c % colores.length];
      circulo(p.x, p.y, p.r);
    }

    // Onda del clic: se apaga antes de tocar el borde del lienzo.
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = colores[2 % colores.length];
    const radioMax = Math.min(cx, cy, w - cx, h - cy) - 6;
    for (const o of ondas) {
      ctx.globalAlpha = o.a * Math.max(0, 1 - o.r / radioMax);
      ctx.beginPath();
      ctx.arc(cx, cy, o.r, 0, TAU);
      ctx.stroke();
    }

    // Nombre de la emoción, cuando la cara terminó de dibujarse.
    const texto = etiquetas?.[caraActual];
    if (texto && ahora >= etiquetaDesde) {
      ctx.globalAlpha = Math.min(1, (ahora - etiquetaDesde) / 500) * 0.9;
      ctx.fillStyle = colorTexto;
      ctx.font = `600 ${Math.round(9 * Math.min(k, 1.8))}px 'DM Sans', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(texto.toUpperCase(), cx, cy + tam / 2 + 10 + 6 * k);
    }
    ctx.globalAlpha = 1;
  };

  const bucle = (ahora) => {
    marco += 1;
    if (marco % 90 === 0) leerColores();
    if (w > 0 && h > 0) {
      actualizar(ahora);
      pintar(ahora);
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

  // Impulso hacia afuera desde la cara (clic o cambio de emoción).
  const empujar = (fuerzaMin, fuerzaVar) => {
    const { cx, cy } = ubicacion;
    for (const p of particulas) {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const f = (fuerzaMin + Math.random() * fuerzaVar) * Math.sqrt(k);
      p.vx += (dx / d) * f + (Math.random() - 0.5) * 1.5;
      p.vy += (dy / d) * f + (Math.random() - 0.5) * 1.5;
    }
    for (const m of sueltas) {
      m.vx += (Math.random() - 0.5) * 2;
      m.vy += (Math.random() - 0.5) * 2;
    }
  };

  // Si cambia el tamaño del lienzo, se recoloca la cara y las moléculas.
  let tiempoResize = 0;
  const observador =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          clearTimeout(tiempoResize);
          tiempoResize = setTimeout(() => {
            const antes = `${w}x${h}`;
            medir();
            if (`${w}x${h}` === antes) return;
            crearSueltas();
            dibujar(caraActual, { desdeActual: true, duracion: 500 });
            if (reducido) pintar();
          }, 150);
        })
      : null;

  // --- Inicio ---
  medir();
  leerColores();
  crearSueltas();
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
    // Pasa de la cara actual a la nueva, molécula por molécula.
    cambiarCara(nuevaCara) {
      if (nuevaCara === caraActual) return;
      leerColores();
      dibujar(nuevaCara, { desdeActual: true });
      if (reducido) pintar();
    },
    // La cara se dispersa y se dibuja otra (o la misma).
    transformar(nuevaCara = caraActual) {
      leerColores();
      if (reducido) {
        dibujar(nuevaCara);
        pintar();
        return;
      }
      empujar(1.5, 2.5);
      dibujar(nuevaCara, { desdeActual: true, retraso: 550 });
    },
    // Clic: la cara estalla en moléculas, sale una onda y se vuelve a dibujar.
    dispersar() {
      if (reducido) return;
      ondas.push({ r: ubicacion.tam * 0.45, a: 0.55 });
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
