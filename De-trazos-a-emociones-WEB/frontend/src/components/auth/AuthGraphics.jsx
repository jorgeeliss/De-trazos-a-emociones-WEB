import { useEffect, useRef } from 'react';
import { PenLine, Users, FileText } from 'lucide-react';
import { crearTrazoLogo, espacioNombre } from './trazoLogo';
import './AuthGraphics.css';

// Solo iconos; el texto queda como descripción (al pasar el mouse y para
// lectores de pantalla).
const PUNTOS = [
  { Icono: PenLine, texto: 'Lectura orientativa de cada dibujo' },
  { Icono: Users, texto: 'Historial y evolución por niño' },
  { Icono: FileText, texto: 'Reportes en PDF' },
];

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Panel izquierdo del login y el registro: puntos que forman el logo con el
// nombre de la app debajo (trazoLogo.js), y abajo el título y los iconos.
const AuthGraphics = ({ title, highlight, subtitle }) => {
  const canvasRef = useRef(null);
  const textoRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const inicioTexto = (h) => textoRef.current?.offsetTop ?? h * 0.6;
    // El logo (y su nombre debajo) usa el espacio libre sobre el texto.
    const ubicar = (w, h) => {
      const libre = Math.max(200, inicioTexto(h) - 30);
      let tam = Math.min(w * 0.44, 280);
      // Que logo + nombre quepan en el espacio libre.
      while (tam > 110 && tam + espacioNombre(tam) > libre * 0.92) tam -= 4;
      const bloque = tam + espacioNombre(tam);
      return { cx: w / 2, cy: (libre - bloque) / 2 + tam / 2 + 10, tam };
    };
    // Puntos sueltos más tenues sobre el texto.
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
            <li key={texto} title={texto}>
              <Icono size={19} aria-hidden="true" />
              <span className="auth-oculto">{texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AuthGraphics;
