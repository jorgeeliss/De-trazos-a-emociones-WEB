import { ArrowRight } from 'lucide-react';
import './ComparisonSection.css';
import { emotionVisual, emocionPredominante, formatFechaCorta } from '../../utils/emociones';
import { actividadesPara } from '../../data/actividades';

const API_URL = 'http://localhost:3000';

const Miniatura = ({ analisis }) => {
  const visual = emotionVisual(analisis?.resultado_ia?.emocion_predominante || '');
  if (analisis?.ruta_imagen) {
    return <img className="compare-thumb" src={`${API_URL}${analisis.ruta_imagen}`} alt="Dibujo" style={{ objectFit: 'cover' }} />;
  }
  return <div className="compare-thumb">{visual.emoji}</div>;
};

const ComparisonSection = ({ child }) => {
  const analisis = child?.analisis || [];
  const nombre = child?.nombre && child.nombre !== 'Sin nombre' ? child.nombre : 'el niño';

  const ahora = analisis[0];
  const antes = analisis[1];
  const emocionAhora = (ahora?.resultado_ia?.emocion_predominante || '').toLowerCase();
  const emocionAntes = (antes?.resultado_ia?.emocion_predominante || '').toLowerCase();

  let cambio;
  if (!antes) {
    cambio = `Necesitas al menos dos análisis de ${nombre} para comparar su evolución. Por ahora solo hay uno.`;
  } else if (emocionAhora && emocionAntes && emocionAhora === emocionAntes) {
    cambio = `Entre estos dos dibujos, ${nombre} se ha mantenido sobre todo en ${emocionAhora}.`;
  } else {
    cambio = `Entre estos dos dibujos, ${nombre} pasó de ${emocionAntes || 'una emoción no detectada'} a ${emocionAhora || 'una emoción no detectada'}. Puede ser útil observar si el cambio se sostiene en los próximos análisis.`;
  }

  const { consejos } = actividadesPara(emocionPredominante(analisis));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dashboard-card compare-card">
        <div className="ts-header">
          <div>
            <div className="ts-title">Antes y ahora</div>
            <div style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '4px' }}>Comparación de dibujos</div>
          </div>
        </div>
        <div className="compare-body">
          {antes ? (
            <div className="compare-pair">
              <div style={{ flex: 1, textAlign: 'center' }}>
                <Miniatura analisis={antes} />
                <div className="compare-date">{formatFechaCorta(antes.fecha)}</div>
              </div>
              <div className="compare-arrow">
                <ArrowRight size={24} />
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <Miniatura analisis={ahora} />
                <div className="compare-date">{formatFechaCorta(ahora.fecha)}</div>
              </div>
            </div>
          ) : (
            ahora && (
              <div className="compare-pair">
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <Miniatura analisis={ahora} />
                  <div className="compare-date">{formatFechaCorta(ahora.fecha)}</div>
                </div>
              </div>
            )
          )}
          <div className="compare-result">
            <strong>{antes ? 'Cambio detectado:' : 'Sin comparación aún:'}</strong> {cambio}
          </div>
        </div>
      </div>

      <div className="dashboard-card tips-card">
        <div className="ts-header">
          <div className="ts-title">Consejos para esta semana</div>
        </div>
        <div className="tips-body">
          {consejos.map((c, i) => (
            <div className="tip-item" key={i}>
              <div className="tip-num">{i + 1}</div>
              <div className="tip-text"><strong>{c.titulo}.</strong> {c.texto}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonSection;
