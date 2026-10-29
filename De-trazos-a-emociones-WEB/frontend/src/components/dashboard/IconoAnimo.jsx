import { useRef, useEffect } from 'react';
import { crearSimulacion } from './moleculasCara';
import './IconoAnimo.css';

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Icono de la emoción predominante del niño hecho de moléculas: al entrar
// están dispersas y se van juntando hasta dibujar la cara. Al pasar el mouse
// se apartan del cursor; al hacer clic la cara estalla y se vuelve a dibujar.
const IconoAnimo = ({ visual, emocion }) => {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const caraRef = useRef(visual.cara);

  useEffect(() => {
    const sim = crearSimulacion(canvasRef.current, {
      cara: caraRef.current,
      reducido: prefiereMenosMovimiento(),
    });
    simRef.current = sim;
    return () => sim.destruir();
  }, []);

  // Al cambiar de niño (o de emoción), las moléculas pasan a la nueva cara.
  useEffect(() => {
    if (caraRef.current === visual.cara) return;
    caraRef.current = visual.cara;
    simRef.current?.cambiarCara(visual.cara);
  }, [visual.cara]);

  const etiqueta = emocion ? `Emoción predominante: ${emocion}` : 'Sin emoción registrada todavía';

  return (
    <button
      type="button"
      className="animo"
      style={{ '--animo-color': visual.color, '--animo-bg': visual.bg }}
      onClick={() => simRef.current?.dispersar()}
      aria-label={etiqueta}
      title={etiqueta}
    >
      <canvas ref={canvasRef} className="animo-lienzo" aria-hidden="true" />
    </button>
  );
};

export default IconoAnimo;
