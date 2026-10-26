import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import './GuidedTour.css';

// Vista del recorrido: si hay "rect", dibuja el spotlight sobre el elemento y el
// globo a su lado; si no, muestra el globo centrado (pasos de bienvenida/cierre).
const GuidedTour = ({ step, index, total, rect, onPrev, onNext, onClose }) => {
  if (!step) return null;
  const ultimo = index === total - 1;

  const contenido = (
    <>
      <button className="gt-close" onClick={onClose} title="Cerrar"><X size={16} /></button>
      <div className="gt-paso">Paso {index + 1} de {total}</div>
      <h3 className="gt-title">{step.titulo}</h3>
      <p className="gt-text">{step.texto}</p>
      <div className="gt-actions">
        {index > 0 ? (
          <button className="gt-btn ghost" onClick={onPrev}><ArrowLeft size={15} /> Atrás</button>
        ) : (
          <button className="gt-btn ghost" onClick={onClose}>Saltar</button>
        )}
        <button className="gt-btn" onClick={onNext}>
          {ultimo ? 'Finalizar' : <>Siguiente <ArrowRight size={15} /></>}
        </button>
      </div>
    </>
  );

  // Paso centrado (sin elemento que resaltar).
  if (!rect) {
    return (
      <div className="gt-center">
        <div className="gt-tip gt-static">{contenido}</div>
      </div>
    );
  }

  // Paso con elemento resaltado: posiciona el globo arriba o abajo del recuadro.
  const anchoTip = 340;
  const espacioAbajo = window.innerHeight - (rect.top + rect.height);
  const left = Math.min(Math.max(12, rect.left), window.innerWidth - anchoTip - 12);
  const tipStyle =
    espacioAbajo > 220
      ? { top: `${rect.top + rect.height + 12}px`, left: `${left}px` }
      : { top: `${Math.max(12, rect.top - 12)}px`, left: `${left}px`, transform: 'translateY(-100%)' };

  return (
    <div className="gt-root">
      <div className="gt-catch" />
      <div
        className="gt-spot"
        style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
      />
      <div className="gt-tip" style={tipStyle}>{contenido}</div>
    </div>
  );
};

export default GuidedTour;
