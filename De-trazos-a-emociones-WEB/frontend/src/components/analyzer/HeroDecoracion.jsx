import { useState, useRef } from 'react';
import './HeroDecoracion.css';

// Orbes flotantes con los colores de la "rueda emocional" del logo.
const ORBES = [
  { c: '#d7a24c', size: 26, top: '20%', left: '10%', dur: 7, delay: 0 },
  { c: '#6e9a86', size: 18, top: '60%', left: '26%', dur: 9, delay: 0.6 },
  { c: '#7595bf', size: 34, top: '32%', left: '46%', dur: 8, delay: 1.1 },
  { c: '#cf949d', size: 20, top: '68%', left: '64%', dur: 10, delay: 0.3 },
  { c: '#d7a24c', size: 14, top: '24%', left: '80%', dur: 6.5, delay: 0.9 },
  { c: '#7595bf', size: 16, top: '72%', left: '90%', dur: 8.5, delay: 1.6 },
];

const HeroDecoracion = () => {
  // Al hacer clic los orbes dan un "pop" suave. No hay onda que se recorte en un
  // rectángulo, así que ya no se ve el límite de la animación.
  const [pulso, setPulso] = useState(false);
  const tRef = useRef(null);

  const alHacerClic = () => {
    clearTimeout(tRef.current);
    setPulso(false);
    requestAnimationFrame(() => setPulso(true));
    tRef.current = setTimeout(() => setPulso(false), 650);
  };

  return (
    <div className={`hero-deco ${pulso ? 'pulso' : ''}`} onClick={alHacerClic}>
      {ORBES.map((o, i) => (
        <span
          key={i}
          className="hero-orb"
          style={{
            color: o.c,
            width: `${o.size}px`,
            height: `${o.size}px`,
            top: o.top,
            left: o.left,
            animationDuration: `${o.dur}s`,
            animationDelay: `${o.delay}s`,
          }}
        >
          <span className="hero-orb-dot" />
        </span>
      ))}
    </div>
  );
};

export default HeroDecoracion;
