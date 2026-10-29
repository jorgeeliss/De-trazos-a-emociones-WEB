import { useState, useRef, useEffect } from 'react';
import { Laugh, Smile, Meh, Frown, Annoyed } from 'lucide-react';
import './IconoAnimo.css';

// Expresiones que recorre el icono al hacer clic, antes de volver a la del niño.
const CICLO = [Laugh, Smile, Meh, Frown, Annoyed];
const VUELTAS = 2;
const INTERVALO_MS = 90;

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Icono de la emoción predominante del niño, dentro de una forma orgánica que
// cambia de contorno. Al pasar el mouse crece y la cara se balancea; al hacer
// clic lanza una onda, la forma gira y la cara recorre las expresiones.
const IconoAnimo = ({ visual, emocion }) => {
  const [paso, setPaso] = useState(null); // null = reposo; número = recorriendo expresiones
  const [ondas, setOndas] = useState([]);
  const timerRef = useRef(null);
  const idRef = useRef(0);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const alHacerClic = () => {
    const id = idRef.current;
    idRef.current += 1;
    setOndas((prev) => [...prev, id]);

    if (paso !== null || prefiereMenosMovimiento()) return;
    let n = 0;
    setPaso(0);
    timerRef.current = setInterval(() => {
      n += 1;
      if (n >= CICLO.length * VUELTAS) {
        clearInterval(timerRef.current);
        setPaso(null);
      } else {
        setPaso(n);
      }
    }, INTERVALO_MS);
  };

  const Icono = paso === null ? visual.Icono : CICLO[paso % CICLO.length];
  const etiqueta = emocion ? `Emoción predominante: ${emocion}` : 'Sin emoción registrada todavía';

  return (
    <button
      type="button"
      className={`animo ${paso !== null ? 'girando' : ''}`}
      style={{ '--animo-color': visual.color, '--animo-bg': visual.bg }}
      onClick={alHacerClic}
      aria-label={etiqueta}
      title={etiqueta}
    >
      <span className="animo-giro" aria-hidden="true">
        <span className="animo-forma animo-forma-fuera" />
        <span className="animo-forma" />
      </span>
      {ondas.map((id) => (
        <span
          key={id}
          className="animo-onda"
          aria-hidden="true"
          onAnimationEnd={() => setOndas((prev) => prev.filter((o) => o !== id))}
        />
      ))}
      <span className="animo-icono" aria-hidden="true">
        <Icono size={46} strokeWidth={1.75} />
      </span>
    </button>
  );
};

export default IconoAnimo;
