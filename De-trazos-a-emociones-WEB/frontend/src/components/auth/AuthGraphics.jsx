import { useEffect, useRef, useState } from 'react';
import Logo from '../common/Logo';
import { crearTrazoLogo, ANCHO_LOGO } from './trazoLogo';
import './AuthGraphics.css';

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Tamaño base del logo de la marca para medirla (luego se ajusta al ancho).
const S_BASE = 64;

// Panel izquierdo del login y el registro: puntos que dibujan el logo en grande
// y lo llevan a su lugar en la marca (logo + nombre, como en las páginas), que
// entonces aparece real (trazoLogo.js). Al terminar avisa con "alTerminar".
const AuthGraphics = ({ alTerminar = () => {} }) => {
  const canvasRef = useRef(null);
  const marcaRef = useRef(null);
  const logoRef = useRef(null);
  const terminarRef = useRef(alTerminar);
  const [marcaVisible, setMarcaVisible] = useState(false);

  useEffect(() => {
    terminarRef.current = alTerminar;
  }, [alTerminar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const marca = marcaRef.current;

    // Marca centrada en el panel. Su tamaño sale del ancho final del panel
    // (mientras se forma el logo ocupa toda la pantalla y luego se corre), así
    // no cambia de tamaño al correrse. 1.1 / 2.1: proporción de los paneles;
    // 64: margen horizontal del panel del formulario (2rem a cada lado).
    const ubicar = (w, h) => {
      const contenedor = canvas.parentElement.parentElement;
      const anchoFinal = Math.min(w, (((contenedor?.clientWidth || w) - 64) * 1.1) / 2.1);
      marca.style.setProperty('--marca-s', `${S_BASE}px`);
      const s = Math.max(44, Math.min(84, (S_BASE * (anchoFinal - 96)) / (marca.offsetWidth || 1)));
      marca.style.setProperty('--marca-s', `${s}px`);
      const centroY = h / 2;
      marca.style.top = `${centroY}px`;
      // El logo grande de la animación, centrado en el mismo punto.
      const tam = Math.max(120, Math.min(w * 0.46, h * 0.5, 300));
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

    const sim = crearTrazoLogo(canvas, {
      zona: canvas.parentElement,
      ubicar,
      ubicarMarca,
      reducido: prefiereMenosMovimiento(),
      alMostrarMarca: (si) => {
        setMarcaVisible(si);
        if (si) terminarRef.current();
      },
    });
    // Con las fuentes ya cargadas, la marca mide distinto: recalcular.
    let vivo = true;
    document.fonts?.ready.then(() => vivo && sim.reubicar());
    return () => {
      vivo = false;
      sim.destruir();
    };
  }, []);

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
    </div>
  );
};

export default AuthGraphics;
