import { useRef, useEffect } from 'react';
import { crearSimulacion } from './trazosCara';
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

// Emoción predominante del niño dibujada con trazos de crayón. Ocupa todo el
// banner de bienvenida (se monta dentro de .welcome): al entrar los trazos están
// dispersos y se acomodan hasta dibujar la cara; el puntero los aparta, y al
// hacer clic sobre la cara se deshace y se vuelve a dibujar.
const IconoAnimo = ({ visual, emocion }) => {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const caraRef = useRef(visual.cara);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sim = crearSimulacion(canvas, {
      cara: caraRef.current,
      reducido: prefiereMenosMovimiento(),
      zona: canvas.parentElement,
      ubicarCara,
      atenuar,
      densidadSueltas: 1 / 12000,
    });
    simRef.current = sim;
    return () => sim.destruir();
  }, []);

  // Al cambiar de niño (o de emoción), los trazos pasan a la nueva cara y color.
  useEffect(() => {
    caraRef.current = visual.cara;
    simRef.current?.cambiarCara(visual.cara);
  }, [visual.cara, visual.color]);

  const etiqueta = emocion ? `Emoción predominante: ${emocion}` : 'Sin emoción registrada todavía';

  return (
    <>
      <canvas
        ref={canvasRef}
        className="animo-lienzo"
        style={{ '--animo-color': visual.color }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="animo-boton"
        onClick={() => simRef.current?.dispersar()}
        aria-label={etiqueta}
        title={etiqueta}
      />
    </>
  );
};

export default IconoAnimo;
