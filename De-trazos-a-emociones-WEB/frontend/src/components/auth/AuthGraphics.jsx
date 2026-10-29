import { useEffect, useRef } from 'react';
import { PenLine, Users, FileText } from 'lucide-react';
import { crearTrazoSimbolos } from './trazoSimbolos';
import './AuthGraphics.css';

const PUNTOS = [
  { Icono: PenLine, texto: 'Lectura orientativa de cada dibujo' },
  { Icono: Users, texto: 'Historial y evolución por niño' },
  { Icono: FileText, texto: 'Reportes en PDF' },
];

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Espacio reservado bajo el símbolo para el nombre de la emoción.
const ESPACIO_ETIQUETA = 60;

// Panel izquierdo del login y el registro: un trazo dibujado a mano que forma
// el símbolo de una emoción y se transforma en el siguiente (trazoSimbolos.js).
const AuthGraphics = ({ title, highlight, subtitle }) => {
  const canvasRef = useRef(null);
  const textoRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // El símbolo usa el espacio libre sobre el bloque de texto.
    const ubicar = (w, h) => {
      const inicioTexto = textoRef.current?.offsetTop ?? h * 0.55;
      const alto = Math.max(140, inicioTexto - ESPACIO_ETIQUETA - 24);
      const tam = Math.max(110, Math.min(w * 0.42, alto * 0.8, 250));
      return { cx: w / 2, cy: 24 + alto / 2, tam };
    };
    const sim = crearTrazoSimbolos(canvas, {
      zona: canvas.parentElement,
      ubicar,
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
        <p className="hero-subtitle">{subtitle}</p>
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
