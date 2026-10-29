import { useEffect, useRef, useState } from 'react';
import { PenLine, Users, FileText } from 'lucide-react';
import Logo from '../common/Logo';
import { crearTrazoLogo, ANCHO_LOGO } from './trazoLogo';
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

// Tamaño base del logo de la marca para medirla (luego se ajusta al ancho).
const S_BASE = 64;

// Panel izquierdo del login y el registro: puntos que dibujan el logo en grande
// y lo llevan a su lugar en la marca (logo + nombre, como en las páginas), que
// entonces aparece real (trazoLogo.js). Abajo, el título y los iconos.
const AuthGraphics = ({ title, highlight, subtitle }) => {
  const canvasRef = useRef(null);
  const textoRef = useRef(null);
  const marcaRef = useRef(null);
  const logoRef = useRef(null);
  const [marcaVisible, setMarcaVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const marca = marcaRef.current;
    const inicioTexto = (h) => textoRef.current?.offsetTop ?? h * 0.6;

    // Coloca la marca en el centro del espacio libre y la ajusta al ancho.
    const ubicar = (w, h) => {
      const libre = Math.max(200, inicioTexto(h) - 30);
      const centroY = libre / 2 + 10;
      marca.style.setProperty('--marca-s', `${S_BASE}px`);
      const s = Math.max(44, Math.min(84, (S_BASE * (w - 96)) / (marca.offsetWidth || 1)));
      marca.style.setProperty('--marca-s', `${s}px`);
      marca.style.top = `${centroY}px`;
      // El logo grande de la animación, centrado en el mismo espacio.
      const tam = Math.max(120, Math.min(w * 0.44, libre * 0.8, 280));
      return { cx: w / 2, cy: centroY, tam };
    };

    // Dónde queda el logo dentro de la marca (en coordenadas del lienzo).
    const ubicarMarca = () => {
      const r = logoRef.current.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      return {
        cx: r.left - c.left + r.width / 2,
        cy: r.top - c.top + r.height / 2,
        tam: (r.width * ANCHO_LOGO) / 48,
      };
    };

    // Puntos sueltos más tenues sobre el texto.
    const atenuar = (x, y, w, h) => {
      const borde = inicioTexto(h) - 30;
      return 1 - 0.75 * Math.min(1, Math.max(0, (y - borde) / 50));
    };

    const sim = crearTrazoLogo(canvas, {
      zona: canvas.parentElement,
      ubicar,
      ubicarMarca,
      atenuar,
      reducido: prefiereMenosMovimiento(),
      alMostrarMarca: setMarcaVisible,
    });
    // Con las fuentes ya cargadas, la marca mide distinto: recalcular.
    document.fonts?.ready.then(() => sim.reubicar());
    return () => sim.destruir();
  }, []);

  const [antes, despues] = title.split(highlight);

  return (
    <div className="left-panel">
      <canvas ref={canvasRef} className="auth-lienzo" aria-hidden="true" />

      <div ref={marcaRef} className={`auth-marca ${marcaVisible ? 'visible' : ''}`}>
        <div ref={logoRef} className="auth-marca-logo">
          <Logo size="100%" />
        </div>
        <div className="auth-marca-texto">
          <span className="auth-marca-nombre">De trazos a emociones</span>
          <span className="auth-marca-sub">Psicología infantil · IA</span>
        </div>
      </div>

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
