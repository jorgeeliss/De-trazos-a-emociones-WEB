import { useEffect, useRef } from 'react';
import { PenLine, Users, FileText } from 'lucide-react';
import { crearTrazoLogo } from './trazoLogo';
import './AuthGraphics.css';

const PUNTOS = [
  { Icono: PenLine, texto: 'Lectura orientativa de cada dibujo' },
  { Icono: Users, texto: 'Historial y evolución por niño' },
  { Icono: FileText, texto: 'Reportes en PDF' },
];

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Panel izquierdo del login y el registro: trazos de crayón que forman el logo
// (trazoLogo.js), y abajo el mensaje con los puntos principales.
const AuthGraphics = ({ title, highlight, subtitle }) => {
  const canvasRef = useRef(null);
  const textoRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const inicioTexto = (h) => textoRef.current?.offsetTop ?? h * 0.55;
    // El logo usa el espacio libre sobre el bloque de texto.
    const ubicar = (w, h) => {
      const alto = Math.max(160, inicioTexto(h) - 40);
      const tam = Math.max(120, Math.min(w * 0.44, alto * 0.78, 280));
      return { cx: w / 2, cy: 20 + alto / 2, tam };
    };
    // Garabatos más tenues sobre el texto.
    const atenuar = (x, y, w, h) => {
      const borde = inicioTexto(h) - 30;
      return 1 - 0.75 * Math.min(1, Math.max(0, (y - borde) / 50));
    };
    const sim = crearTrazoLogo(canvas, {
      zona: canvas.parentElement,
      ubicar,
      atenuar,
      reducido: prefiereMenosMovimiento(),
    });
    return () => sim.destruir();
  }, []);

  const [antes, despues] = title.split(highlight);

  return (
    <div className="left-panel">
      <canvas ref={canvasRef} className="auth-lienzo" aria-hidden="true" />
      <div className="hero-text" ref={textoRef}>
        <h1 className="hero-title">
          {antes}
          <span className="highlight">{highlight}</span>
          {despues}
        </h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        <ul className="auth-puntos">
          {PUNTOS.map(({ Icono, texto }) => (
            <li key={texto}>
              <span className="auth-punto-icono"><Icono size={15} /></span>
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AuthGraphics;
