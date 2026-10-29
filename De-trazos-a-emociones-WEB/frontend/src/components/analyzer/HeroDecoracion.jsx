import { useEffect, useRef } from 'react';
import { crearTrazosEncabezado } from './trazosEncabezado';
import './HeroDecoracion.css';

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Decoración del encabezado del Analyzer: trazos ondulados en los colores de
// las emociones que se dibujan y se borran solos (trazosEncabezado.js). El
// lienzo cubre todo el encabezado (.hero recorta con su borde redondeado);
// este bloque ocupa el espacio libre a la derecha y recibe el clic.
const HeroDecoracion = () => {
  const canvasRef = useRef(null);
  const zonaRef = useRef(null);
  const simRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const encabezado = canvas.parentElement;
    // Los trazos empiezan después del bloque de título.
    const finTexto = () => {
      const texto = encabezado.querySelector('.hero-text');
      return texto ? texto.offsetLeft + texto.offsetWidth : 0;
    };
    const sim = crearTrazosEncabezado(canvas, {
      zona: encabezado,
      finTexto,
      cantidad: 4,
      reducido: prefiereMenosMovimiento(),
    });
    simRef.current = sim;
    return () => sim.destruir();
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="hero-trazos" aria-hidden="true" />
      <div
        ref={zonaRef}
        className="hero-deco"
        aria-hidden="true"
        onClick={(e) => simRef.current?.nacerEn(e.clientX, e.clientY)}
      />
    </>
  );
};

export default HeroDecoracion;
