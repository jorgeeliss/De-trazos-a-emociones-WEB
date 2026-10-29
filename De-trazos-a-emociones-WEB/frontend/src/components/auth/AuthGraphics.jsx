import { useEffect, useRef } from 'react';
import { PenLine, Users, FileText } from 'lucide-react';
import { crearSimulacion } from '../dashboard/moleculasCara';
import './AuthGraphics.css';

// Emociones que las moléculas dibujan una tras otra.
const CICLO = [
  { cara: 'risa', nombre: 'Alegría' },
  { cara: 'triste', nombre: 'Tristeza' },
  { cara: 'sonrisa', nombre: 'Calma' },
  { cara: 'molesta', nombre: 'Enojo' },
  { cara: 'neutra', nombre: 'Neutral' },
];
const INTERVALO_MS = 5200;

const PUNTOS = [
  { Icono: PenLine, texto: 'Lectura orientativa de cada dibujo' },
  { Icono: Users, texto: 'Historial y evolución por niño' },
  { Icono: FileText, texto: 'Reportes en PDF' },
];

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Espacio reservado bajo la cara para el nombre de la emoción.
const ESPACIO_ETIQUETA = 56;

// Panel izquierdo del login y el registro: moléculas que dibujan una emoción,
// se dispersan y forman la siguiente, con su nombre debajo.
const AuthGraphics = ({ title, highlight, subtitle }) => {
  const canvasRef = useRef(null);
  const textoRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reducido = prefiereMenosMovimiento();
    // Dónde empieza el bloque de texto: la cara usa el espacio libre de arriba.
    const inicioTexto = (h) => textoRef.current?.offsetTop ?? h * 0.55;
    const ubicarCara = (w, h) => {
      const alto = Math.max(140, inicioTexto(h) - ESPACIO_ETIQUETA - 24);
      const tam = Math.max(110, Math.min(w * 0.46, alto * 0.82, 270));
      return { cx: w / 2, cy: 24 + alto / 2, tam };
    };
    // Moléculas más tenues sobre el texto.
    const atenuar = (x, y, w, h) => {
      const borde = inicioTexto(h) - 30;
      return 1 - 0.75 * Math.min(1, Math.max(0, (y - borde) / 50));
    };
    const sim = crearSimulacion(canvas, {
      cara: CICLO[0].cara,
      reducido,
      zona: canvas.parentElement,
      ubicarCara,
      atenuar,
      densidadSueltas: 1 / 14000,
      etiquetas: Object.fromEntries(CICLO.map((c) => [c.cara, c.nombre])),
    });
    let i = 0;
    const timer = reducido
      ? null
      : setInterval(() => {
          i = (i + 1) % CICLO.length;
          sim.transformar(CICLO[i].cara);
        }, INTERVALO_MS);
    return () => {
      clearInterval(timer);
      sim.destruir();
    };
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
