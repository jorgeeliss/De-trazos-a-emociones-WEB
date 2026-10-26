import { useState, useEffect, useCallback } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import './GuidedTour.css';

// Recorrido guiado: ilumina elementos reales de la página y muestra un globo
// con la explicación. Cada paso puede apuntar a un selector CSS; si no hay
// selector (o el elemento no existe), el globo se muestra centrado.
const GuidedTour = ({ open, steps, onClose }) => {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);

  const paso = open ? steps[i] : null;

  const actualizar = useCallback(() => {
    if (!paso || !paso.selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(paso.selector);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [paso]);

  useEffect(() => {
    if (!open) return;
    // Llevar el elemento a la vista y luego medir.
    if (paso?.selector) {
      const el = document.querySelector(paso.selector);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const t0 = setTimeout(actualizar, 0);
    const t = setTimeout(actualizar, 350);
    window.addEventListener('resize', actualizar);
    window.addEventListener('scroll', actualizar, true);
    return () => {
      clearTimeout(t0);
      clearTimeout(t);
      window.removeEventListener('resize', actualizar);
      window.removeEventListener('scroll', actualizar, true);
    };
  }, [open, i, actualizar, paso]);

  if (!open || !paso) return null;

  const cerrar = () => {
    setI(0);
    setRect(null);
    onClose();
  };
  const siguiente = () => (i < steps.length - 1 ? setI(i + 1) : cerrar());
  const anterior = () => setI((n) => Math.max(0, n - 1));

  // Posición del globo respecto al elemento resaltado.
  let tipStyle;
  if (rect) {
    const anchoTip = 340;
    const espacioAbajo = window.innerHeight - (rect.top + rect.height);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - anchoTip - 12);
    tipStyle =
      espacioAbajo > 220
        ? { top: `${rect.top + rect.height + 12}px`, left: `${left}px` }
        : { top: `${Math.max(12, rect.top - 12)}px`, left: `${left}px`, transform: 'translateY(-100%)' };
  }

  return (
    <div className="gt-root">
      <div className={`gt-catch ${rect ? '' : 'dim'}`} />
      {rect && (
        <div
          className="gt-spot"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}

      <div
        className={`gt-tip ${rect ? '' : 'centrado'}`}
        style={rect ? tipStyle : undefined}
      >
        <button className="gt-close" onClick={cerrar} title="Cerrar"><X size={16} /></button>
        <div className="gt-paso">Paso {i + 1} de {steps.length}</div>
        <h3 className="gt-title">{paso.titulo}</h3>
        <p className="gt-text">{paso.texto}</p>
        <div className="gt-actions">
          {i > 0 ? (
            <button className="gt-btn ghost" onClick={anterior}><ArrowLeft size={15} /> Atrás</button>
          ) : (
            <button className="gt-btn ghost" onClick={cerrar}>Saltar</button>
          )}
          <button className="gt-btn" onClick={siguiente}>
            {i < steps.length - 1 ? <>Siguiente <ArrowRight size={15} /></> : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
