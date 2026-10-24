import { useState } from 'react';
import { X } from 'lucide-react';
import './ActivitiesSection.css';
import { emocionPredominante } from '../../utils/emociones';
import { actividadesPara } from '../../data/actividades';

const claveDone = (nombre, emocion) => `actividades-done:${nombre || 'sin-nombre'}:${emocion || 'default'}`;

// Este componente se remonta al cambiar de niño (key en Dashboard), por eso el
// estado "hecho" se puede inicializar de forma perezosa desde localStorage.
const ActivitiesSection = ({ child }) => {
  const nombre = child?.nombre && child.nombre !== 'Sin nombre' ? child.nombre : 'el niño';
  const emocion = emocionPredominante(child?.analisis || []);
  const { actividades, consejos } = actividadesPara(emocion);

  const [detalle, setDetalle] = useState(null);
  const [dones, setDones] = useState(() => {
    try {
      const raw = localStorage.getItem(claveDone(child?.nombre, emocion));
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length === actividades.length) return parsed;
    } catch { /* ignore */ }
    return actividades.map(() => false);
  });

  const toggle = (i) => {
    const next = dones.map((d, idx) => (idx === i ? !d : d));
    setDones(next);
    try {
      localStorage.setItem(claveDone(child?.nombre, emocion), JSON.stringify(next));
    } catch { /* ignore */ }
  };

  return (
    <div className="dashboard-card activities-section">
      <div className="act-header">
        <div>
          <div className="act-title">Actividades sugeridas</div>
          <div className="act-subtitle">Para hacer con {nombre} esta semana · toca una para ver por qué</div>
        </div>
        <span style={{ fontSize: '24px', animation: 'float 3s infinite ease-in-out alternate' }}>✨</span>
      </div>
      <div className="act-body">
        {actividades.map((act, i) => (
          <div className="act-card" key={i} onClick={() => setDetalle(act)}>
            <div className="act-icon" style={{ background: act.bg }}>{act.icon}</div>
            <div className="act-info">
              <div className="act-name">{act.nombre}</div>
              <div className="act-desc">{act.desc}</div>
              <span className="act-tag" style={{ background: act.bg, color: act.color }}>{act.tag}</span>
            </div>
            <button
              className={`act-done ${dones[i] ? 'checked' : ''}`}
              title={dones[i] ? 'Hecho' : 'Marcar como hecho'}
              onClick={(e) => { e.stopPropagation(); toggle(i); }}
            >
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {detalle && (
        <div className="act-modal-overlay" onClick={() => setDetalle(null)}>
          <div className="act-modal" onClick={(e) => e.stopPropagation()}>
            <button className="act-modal-close" onClick={() => setDetalle(null)} title="Cerrar"><X size={18} /></button>
            <div className="act-modal-head">
              <div className="act-icon" style={{ background: detalle.bg }}>{detalle.icon}</div>
              <div className="act-modal-title">{detalle.nombre}</div>
            </div>
            <p className="act-modal-desc">{detalle.desc}</p>

            <div className="act-modal-section">
              <div className="act-modal-label">Por qué ayuda</div>
              <p className="act-modal-text">{detalle.fundamento}</p>
            </div>

            {consejos?.length > 0 && (
              <div className="act-modal-section">
                <div className="act-modal-label">Consejos para acompañar</div>
                <ul className="act-modal-consejos">
                  {consejos.map((c, idx) => (
                    <li key={idx}><strong>{c.titulo}:</strong> {c.texto}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="act-modal-nota">
              Sugerencia orientativa de acompañamiento, no una indicación clínica.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesSection;
