/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GuidedTour from '../components/common/GuidedTour';

const TourContext = createContext(null);
export const useTour = () => useContext(TourContext);

const leerNombre = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}').nombre || '';
  } catch {
    return '';
  }
};

export function TourProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activo, setActivo] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);

  const nombre = leerNombre();

  // Recorrido multi-página: cada paso vive en una ruta y señala un elemento.
  const pasos = useMemo(
    () => [
      { route: '/app', titulo: `¡Hola, ${nombre || 'bienvenido'}!`, texto: 'Te muestro en un recorrido rápido cómo usar la app. Puedes saltarlo cuando quieras.' },
      { route: '/app', selector: '[data-tour="nav"]', titulo: 'Menú de navegación', texto: 'Desde esta barra llegas a Analizar, Panel, Historial, Mis niños, Reportes y Configuración.' },
      { route: '/app', selector: '[data-tour="modo"]', titulo: 'Cómo analizar', texto: 'Elige "Con contexto del niño" para un análisis completo, o "Solo dibujo" para uno rápido.' },
      { route: '/app', selector: '[data-tour="pasos"]', titulo: 'Sigue los pasos', texto: 'Completa el contexto, sube el dibujo y obtén el análisis. Toca cada paso para avanzar.' },
      { route: '/dashboard', selector: '[data-tour="dash"]', titulo: 'El Panel del niño', texto: 'Aquí ves el seguimiento de cada niño: su emoción predominante, su evolución y actividades sugeridas.' },
      { route: '/historial', selector: '[data-tour="hist"]', titulo: 'Historial y evolución', texto: 'Revisa todos los análisis de un niño y compara su evolución (antes y ahora), incluso por hora.' },
      { route: '/ninos', selector: '[data-tour="ninos"]', titulo: 'Mis niños', texto: 'Consulta la información y la situación actual de cada niño registrado.' },
      { route: '/configuracion', selector: '[data-tour="config"]', titulo: 'Configuración', texto: 'Cambia el tema (claro/oscuro), las paletas de color y tu contraseña.' },
      { route: '/app', selector: '[data-tour="perfil"]', titulo: 'Tu cuenta', texto: '¡Listo! Desde tu perfil cambias la foto o cierras sesión. Ya puedes empezar subiendo un dibujo.' },
    ],
    [nombre]
  );

  const paso = activo ? pasos[i] : null;

  const start = useCallback(() => {
    setI(0);
    setRect(null);
    setActivo(true);
  }, []);

  const cerrar = useCallback(() => {
    setActivo(false);
    setRect(null);
    try {
      localStorage.setItem('tutorial_visto', '1');
      localStorage.removeItem('tutorial_forzar');
    } catch {
      /* ignore */
    }
  }, []);

  // 1) Navegar a la ruta del paso si no estamos ahí.
  useEffect(() => {
    if (!paso) return;
    if (paso.route && location.pathname !== paso.route) {
      navigate(paso.route);
    }
  }, [paso, location.pathname, navigate]);

  // 2) Localizar el elemento del paso (con reintentos, porque tras navegar tarda
  //    en montarse) y seguir su posición en scroll/resize.
  useEffect(() => {
    if (!paso) return;
    if (!paso.selector) return; // paso centrado, sin elemento
    if (paso.route && location.pathname !== paso.route) return; // aún no llegamos

    let cancelado = false;
    let intentos = 0;

    const fijarDesde = (el) => {
      const r = el.getBoundingClientRect();
      if (!cancelado) setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const medir = () => {
      if (cancelado) return;
      const el = document.querySelector(paso.selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => !cancelado && fijarDesde(el), 320);
      } else if (intentos < 30) {
        intentos += 1;
        setTimeout(medir, 120);
      }
    };

    const t = setTimeout(medir, 0);

    const onMove = () => {
      const el = document.querySelector(paso.selector);
      if (el) fijarDesde(el);
    };
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);

    return () => {
      cancelado = true;
      clearTimeout(t);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [paso, location.pathname]);

  const siguiente = () => {
    if (i < pasos.length - 1) {
      setRect(null);
      setI((n) => n + 1);
    } else {
      cerrar();
    }
  };
  const anterior = () => {
    setRect(null);
    setI((n) => Math.max(0, n - 1));
  };

  return (
    <TourContext.Provider value={{ start }}>
      {children}
      {activo && paso && (
        <GuidedTour
          step={paso}
          index={i}
          total={pasos.length}
          rect={rect}
          onPrev={anterior}
          onNext={siguiente}
          onClose={cerrar}
        />
      )}
    </TourContext.Provider>
  );
}
