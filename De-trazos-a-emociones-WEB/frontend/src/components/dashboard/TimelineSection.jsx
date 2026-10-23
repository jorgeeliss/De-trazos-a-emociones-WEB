import './TimelineSection.css';
import { emotionVisual, intensityInfo, formatFecha } from '../../utils/emociones';

const resumenDe = (r = {}) => {
  if (r.lectura_orientativa) return r.lectura_orientativa;
  if (r.interpretacion) return r.interpretacion;
  if (Array.isArray(r.rasgos_observados) && r.rasgos_observados.length) return r.rasgos_observados.join('. ');
  return 'Sin resumen disponible para este análisis.';
};

const TimelineSection = ({ child, onSelect }) => {
  const analisis = (child?.analisis || []).slice(0, 6);
  const nombre = child?.nombre && child.nombre !== 'Sin nombre' ? child.nombre : 'el niño';

  return (
    <div className="dashboard-card timeline-section">
      <div className="ts-header">
        <div>
          <div className="ts-title">Cómo ha estado {nombre}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '4px' }}>Sus últimos dibujos contaron esto</div>
        </div>
      </div>
      <div className="ts-body">
        {analisis.length === 0 ? (
          <div style={{ padding: '20px', color: 'var(--muted)' }}>Aún no hay análisis para este niño.</div>
        ) : (
          analisis.map((a, i) => {
            const r = a.resultado_ia || {};
            const visual = emotionVisual(r.emocion_predominante || '');
            const intensidad = intensityInfo(r.intensidad || '');
            const esUltimo = i === analisis.length - 1;
            return (
              <div className="tl-item tl-item-click" key={a._id || i} onClick={() => onSelect && onSelect(a)} title="Ver el dibujo y el análisis completo">
                <div className="tl-left">
                  <div className="tl-dot" style={{ background: visual.bg }}>{visual.emoji}</div>
                  {!esUltimo && <div className="tl-line"></div>}
                </div>
                <div className="tl-right">
                  <div className="tl-date">{i === 0 ? 'Más reciente · ' : ''}{formatFecha(a.fecha)}</div>
                  <div className="tl-emotion-row">
                    <div className="tl-emotion-name">{r.emocion_predominante || 'Sin emoción detectada'}</div>
                  </div>
                  <div className="tl-chips">
                    <span className="tl-chip" style={{ background: visual.bg, color: visual.color }}>
                      {r.emocion_predominante || 'Desconocida'}
                    </span>
                  </div>
                  <div className="tl-summary tl-summary-clamp">{resumenDe(r)}</div>
                  <div className="tl-footer-row">
                    <div className="tl-intensity">
                      <div className="tl-intensity-dot" style={{ background: intensidad.color }}></div>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Intensidad {intensidad.label}</span>
                    </div>
                    <span className="tl-ver-mas">Ver detalle →</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TimelineSection;
