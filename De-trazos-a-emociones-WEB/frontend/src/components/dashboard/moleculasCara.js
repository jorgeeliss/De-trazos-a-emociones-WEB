// Simulación en canvas para el icono del Dashboard: moléculas que flotan
// dispersas y se van juntando, en el orden del trazo, hasta dibujar la cara de
// la emoción. La geometría replica los iconos de lucide (caja de 24 x 24).

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
const puntosDeCara = (cara, escala, ox, oy, espaciado) => {
  const pts = [];
  for (const seg of CARAS[cara] || CARAS.neutra) {
    if (seg.punto) {
      // Ojo: un átomo central con cuatro pequeños alrededor.
      const cx = ox + seg.punto[0] * escala;
      const cy = oy + seg.punto[1] * escala;
      pts.push({ x: cx, y: cy, r: 2.6 });
      for (let k = 0; k < 4; k++) {
        const a = (k * TAU) / 4 + 0.4;
        pts.push({ x: cx + Math.cos(a) * 2.6, y: cy + Math.sin(a) * 2.6, r: 1.2 });
      }
      continue;
    }
    const n = Math.max(3, Math.round((largoDe(seg.f) * escala) / espaciado));
    for (let i = 0; i < n; i++) {
      const [x, y] = seg.f(seg.cerrado ? i / n : i / (n - 1));
      // Cada tanto un átomo más grande, para que se lea como molécula.
      pts.push({ x: ox + x * escala, y: oy + y * escala, r: i % 6 === 0 ? 2.5 : 1.6 });
    }
  }
  return pts;
};

// --- Simulación -------------------------------------------------------------
const MOLECULAS_SUELTAS = 16;
const DISTANCIA_ENLACE = 9;
const DURACION_DIBUJO_MS = 1500;
const RADIO_CURSOR = 30;

export function crearSimulacion(canvas, { cara, reducido = false }) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let color = 'rgb(120, 120, 140)';
  let particulas = []; // las que forman la cara
  let sueltas = []; // las que flotan alrededor
  let ondas = [];
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
  };

  // El color sale del CSS (color: var(--animo-color)), así sigue al tema.
  const leerColor = () => {
    color = getComputedStyle(canvas).color || color;
  };

  const posicionAlAzar = () => ({ x: 12 + Math.random() * (w - 24), y: 12 + Math.random() * (h - 24) });

  // Programa el dibujo: cada molécula "sale" hacia su destino en orden de trazo.
  const dibujar = (nuevaCara, { desdeActual = false, retraso = 0 } = {}) => {
    caraActual = nuevaCara;
    const tam = Math.min(w, h) * 0.66;
    const destinos = puntosDeCara(nuevaCara, tam / 24, (w - tam) / 2, (h - tam) / 2, 3.6);
    const ahora = performance.now();
    const paso = DURACION_DIBUJO_MS / destinos.length;
    const anteriores = particulas;
    particulas = destinos.map((d, i) => {
      const previa = desdeActual && anteriores.length ? anteriores[i % anteriores.length] : null;
      const inicio = previa || posicionAlAzar();
      return {
        x: inicio.x,
        y: inicio.y,
        vx: previa ? previa.vx : (Math.random() - 0.5) * 0.6,
        vy: previa ? previa.vy : (Math.random() - 0.5) * 0.6,
        tx: d.x,
        ty: d.y,
        r: d.r * (0.9 + Math.random() * 0.25),
        sale: ahora + retraso + i * paso,
        fase: Math.random() * TAU,
      };
    });
    if (reducido) particulas.forEach((p) => Object.assign(p, { x: p.tx, y: p.ty, sale: 0 }));
  };

  const crearSueltas = () => {
    sueltas = Array.from({ length: MOLECULAS_SUELTAS }, () => ({
      ...posicionAlAzar(),
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.1 + Math.random() * 1.1,
    }));
  };

  const rebotar = (p) => {
    if (p.x < 8) p.vx = Math.abs(p.vx);
    if (p.x > w - 8) p.vx = -Math.abs(p.vx);
    if (p.y < 8) p.vy = Math.abs(p.vy);
    if (p.y > h - 8) p.vy = -Math.abs(p.vy);
  };

  const apartarDelCursor = (p) => {
    if (!cursor) return;
    const dx = p.x - cursor.x;
    const dy = p.y - cursor.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < RADIO_CURSOR) {
      const fuerza = (1 - d / RADIO_CURSOR) * 1.4;
      p.vx += (dx / d) * fuerza;
      p.vy += (dy / d) * fuerza;
    }
  };

  const actualizar = (ahora) => {
    for (const p of particulas) {
      if (ahora >= p.sale) {
        // Ya va a su sitio: resorte suave + una leve "respiración".
        const tx = p.tx + Math.sin(ahora / 900 + p.fase) * 0.7;
        const ty = p.ty + Math.cos(ahora / 1100 + p.fase) * 0.7;
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
      rebotar(m);
      apartarDelCursor(m);
      m.vx *= 0.99;
      m.vy *= 0.99;
      m.x += m.vx;
      m.y += m.vy;
    }
    ondas = ondas.filter((o) => o.a > 0.01);
    for (const o of ondas) {
      o.r += 2.2;
      o.a *= 0.93;
    }
  };

  // Se desvanece cerca del borde del lienzo: así nunca se nota su recuadro.
  const alfaBorde = (p) => Math.max(0, Math.min(1, (Math.min(p.x, p.y, w - p.x, h - p.y) - 2) / 16));

  const pintar = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.9;

    // Enlaces entre moléculas cercanas.
    const todas = particulas.concat(sueltas);
    for (let i = 0; i < todas.length; i++) {
      const a = todas[i];
      for (let j = i + 1; j < todas.length; j++) {
        const b = todas[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (Math.abs(dx) > DISTANCIA_ENLACE || Math.abs(dy) > DISTANCIA_ENLACE) continue;
        const d = Math.hypot(dx, dy);
        if (d >= DISTANCIA_ENLACE) continue;
        ctx.globalAlpha = (1 - d / DISTANCIA_ENLACE) * 0.5 * Math.min(alfaBorde(a), alfaBorde(b));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const p of particulas) {
      ctx.globalAlpha = 0.92 * alfaBorde(p);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fill();
    }
    for (const m of sueltas) {
      ctx.globalAlpha = 0.45 * alfaBorde(m);
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, TAU);
      ctx.fill();
    }

    // La onda se apaga antes de tocar el borde del lienzo (no se ve recortada).
    ctx.lineWidth = 1.6;
    const radioMax = Math.min(w, h) / 2 - 6;
    for (const o of ondas) {
      ctx.globalAlpha = o.a * Math.max(0, 1 - o.r / radioMax);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, o.r, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const bucle = (ahora) => {
    marco += 1;
    if (marco % 90 === 0) leerColor();
    actualizar(ahora);
    pintar();
    raf = requestAnimationFrame(bucle);
  };

  const alMover = (e) => {
    const r = canvas.getBoundingClientRect();
    cursor = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const alSalir = () => {
    cursor = null;
  };

  // --- Inicio ---
  medir();
  leerColor();
  crearSueltas();
  dibujar(cara, { retraso: 250 });
  if (reducido) {
    pintar();
  } else {
    canvas.addEventListener('pointermove', alMover);
    canvas.addEventListener('pointerleave', alSalir);
    raf = requestAnimationFrame(bucle);
  }

  return {
    // Pasa de la cara actual a la nueva, molécula por molécula.
    cambiarCara(nuevaCara) {
      if (nuevaCara === caraActual) return;
      leerColor();
      dibujar(nuevaCara, { desdeActual: true });
      if (reducido) pintar();
    },
    // Clic: la cara estalla en moléculas y se vuelve a dibujar.
    dispersar() {
      if (reducido) return;
      const ahora = performance.now();
      const paso = (DURACION_DIBUJO_MS * 0.75) / particulas.length;
      ondas.push({ r: Math.min(w, h) * 0.3, a: 0.55 });
      particulas.forEach((p, i) => {
        const dx = p.x - w / 2;
        const dy = p.y - h / 2;
        const d = Math.hypot(dx, dy) || 1;
        const fuerza = 2.5 + Math.random() * 3;
        p.vx += (dx / d) * fuerza + (Math.random() - 0.5) * 1.5;
        p.vy += (dy / d) * fuerza + (Math.random() - 0.5) * 1.5;
        p.sale = ahora + 500 + i * paso;
      });
      for (const m of sueltas) {
        m.vx += (Math.random() - 0.5) * 2;
        m.vy += (Math.random() - 0.5) * 2;
      }
    },
    destruir() {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', alMover);
      canvas.removeEventListener('pointerleave', alSalir);
    },
  };
}
