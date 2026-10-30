import { useRef, useEffect, useState } from 'react';
import { crearSimulacion } from './trazosCara';
import { emotionVisual } from '../../utils/emociones';
import './IconoAnimo.css';

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Cara de la emoción a la derecha del banner, con espacio a la izquierda para el texto.
const ubicarCara = (w, h) => {
  const angosto = w < 560;
  const tam = Math.min(h * 0.74, angosto ? 84 : 150);
  return { cx: w - tam / 2 - (angosto ? 22 : 64), cy: h / 2, tam };
};

// Más tenues sobre el saludo (mitad izquierda) para no restarle legibilidad.
const atenuar = (x, y, w) => 0.3 + 0.7 * Math.min(1, Math.max(0, (x / w - 0.3) / 0.25));

// Emociones por las que pasa la cara al hacer clic, cada una con su cara y color.
const CICLO = ['Alegría', 'Calma', 'Tristeza', 'Miedo', 'Enojo', 'Ansiedad'].map((nombre) => ({ nombre, ...emotionVisual(nombre) }));
// Tras unos segundos sin clics, vuelve a la emoción predominante del niño.
const VOLVER_MS = 8000;
const ETIQUETA_MS = 2200;

// Emoción predominante del niño dibujada con trazos de crayón. Ocupa todo el
// banner de bienvenida (se monta dentro de .welcome): al entrar los trazos están
// dispersos y se acomodan hasta dibujar la cara; el puntero los aparta. Al hacer
// clic, la cara explota con su color y se vuelve a juntar como otra emoción,
// cambiando de color a medida que los trazos llegan.
const IconoAnimo = ({ visual, emocion }) => {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const inicialRef = useRef(visual);
  const mostradaRef = useRef(null); // clave de la emoción del ciclo en pantalla (null = la del niño)
  const temporizadores = useRef({ volver: 0, etiqueta: 0 });
  const [etiqueta, setEtiqueta] = useState(null); // { texto, x, y }

  useEffect(() => {
    const canvas = canvasRef.current;
    const sim = crearSimulacion(canvas, {
      cara: inicialRef.current.cara,
      color: inicialRef.current.color,
      reducido: prefiereMenosMovimiento(),
      zona: canvas.parentElement,
      ubicarCara,
      atenuar,
      densidadSueltas: 1 / 12000,
    });
    simRef.current = sim;
    const t = temporizadores.current;
    return () => {
      clearTimeout(t.volver);
      clearTimeout(t.etiqueta);
      sim.destruir();
    };
  }, []);

  // Muestra un momento el nombre de la emoción, debajo de la cara.
  const mostrarEtiqueta = (texto) => {
    const u = simRef.current?.ubicacion();
    if (!u) return;
    clearTimeout(temporizadores.current.etiqueta);
    setEtiqueta({ texto, x: u.cx, y: Math.min(u.cy + u.tam / 2 - 2, u.h - 30), id: Date.now() });
    temporizadores.current.etiqueta = setTimeout(() => setEtiqueta(null), ETIQUETA_MS);
  };

  // Al cambiar de niño (o de emoción), los trazos pasan a la nueva cara y color.
  useEffect(() => {
    clearTimeout(temporizadores.current.volver);
    mostradaRef.current = null;
    simRef.current?.cambiarCara(visual.cara, visual.color);
  }, [visual.cara, visual.color]);

  const volverAlNino = () => {
    mostradaRef.current = null;
    simRef.current?.transicionar(visual.cara, visual.color);
    if (emocion) mostrarEtiqueta(emocion.charAt(0).toUpperCase() + emocion.slice(1));
  };

  const alClic = () => {
    const actual = mostradaRef.current ?? visual.clave;
    let i = (CICLO.findIndex((e) => e.clave === actual) + 1) % CICLO.length;
    if (CICLO[i].clave === actual) i = (i + 1) % CICLO.length;
    const siguiente = CICLO[i];
    mostradaRef.current = siguiente.clave;
    simRef.current?.transicionar(siguiente.cara, siguiente.color);
    mostrarEtiqueta(siguiente.nombre);
    clearTimeout(temporizadores.current.volver);
    temporizadores.current.volver = setTimeout(volverAlNino, VOLVER_MS);
  };

  const descripcion = emocion ? `Emoción predominante: ${emocion}` : 'Sin emoción registrada todavía';

  return (
    <>
      <canvas
        ref={canvasRef}
        className="animo-lienzo"
        style={{ '--animo-color': visual.color }}
        aria-hidden="true"
      />
      {etiqueta && (
        <span key={etiqueta.id} className="animo-etiqueta" style={{ left: etiqueta.x, top: etiqueta.y }} aria-hidden="true">
          {etiqueta.texto}
        </span>
      )}
      <button
        type="button"
        className="animo-boton"
        onClick={alClic}
        aria-label={`${descripcion}. Haz clic para ver otras emociones.`}
        title={`${descripcion} · clic para ver otras emociones`}
      />
    </>
  );
};

export default IconoAnimo;
