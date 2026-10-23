import { useNavigate } from 'react-router-dom';
import './WeeklySummary.css';
import { emotionVisual, intensityInfo, emocionPredominante, esEmocionNegativa, formatFechaCorta } from '../../utils/emociones';

const alturaPorIntensidad = { 1: '22px', 2: '40px', 3: '56px' };

const WeeklySummary = ({ child }) => {
  const navigate = useNavigate();
  const analisis = child?.analisis || [];
  const nombre = child?.nombre && child.nombre !== 'Sin nombre' ? child.nombre : 'el niño';

  // Línea de tiempo: hasta los 7 análisis más recientes, en orden cronológico.
  const recientes = analisis.slice(0, 7).reverse();

  const emocion = emocionPredominante(analisis);
  const visual = emotionVisual(emocion || '');

  // Regla de alerta (orientativa, no diagnóstica): se avisa cuando los 3 análisis
  // más recientes muestran emociones negativas. Es una señal para conversar, no un diagnóstico.
  const ultimos3 = analisis.slice(0, 3);
  const alerta = ultimos3.length >= 3 && ultimos3.every((a) => esEmocionNegativa(a.resultado_ia?.emocion_predominante || ''));

  const mensaje = emocion
    ? (esEmocionNegativa(emocion)
        ? `En sus últimos dibujos, ${nombre} ha mostrado sobre todo ${emocion}. Puede estar relacionado con algo en casa o el colegio. No es alarmante, pero es una buena señal para conversar con calma.`
        : `En sus últimos dibujos, ${nombre} ha mostrado sobre todo ${emocion}. Es un buen momento para reforzar lo que le hace sentir bien.`)
    : `Todavía no hay suficientes análisis de ${nombre} para resumir una tendencia.`;

  return (
    <div className="grid-main">
      {/* ESTA SEMANA */}
      <div className="dashboard-card week-card">
        <div className="week-header">
          <div className="week-title">Análisis recientes</div>
          <div className="week-badge">{analisis.length} en total</div>
        </div>
        <div className="week-body">
          <div className="state-main">
            <div className="state-emoji-wrap">
              <div className="state-pulse"></div>
              {visual.emoji}
            </div>
            <div className="state-info">
              <div className="state-label">Emoción predominante</div>
              <div className="state-emotion">{emocion ? emocion.charAt(0).toUpperCase() + emocion.slice(1) : 'Sin datos'}</div>
              <div className="state-desc">{mensaje}</div>
            </div>
          </div>

          {/* Línea de tiempo de análisis reales */}
          <div className="week-timeline">
            {recientes.map((a, i) => {
              const v = emotionVisual(a.resultado_ia?.emocion_predominante || '');
              const inten = intensityInfo(a.resultado_ia?.intensidad || '');
              const esUltimo = i === recientes.length - 1;
              return (
                <div key={a._id || i} className="day-col">
                  <div className="day-bar-wrap">
                    <div className="day-dot">{v.emoji}</div>
                    <div className="day-bar" style={{ background: v.bg, height: alturaPorIntensidad[inten.valor] }}></div>
                  </div>
                  <div className={`day-name ${esUltimo ? 'today' : ''}`}>{formatFechaCorta(a.fecha)}</div>
                </div>
              );
            })}
          </div>

          <div className="message-box">
            <div className="message-label">💡 Lo que esto significa</div>
            <div className="message-text">{mensaje}</div>
          </div>
        </div>
      </div>

      {/* DERECHA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {alerta ? (
          <div className="alert-card">
            <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'float 4s infinite ease-in-out' }}>🔔</div>
            <div className="alert-title">Señal para acompañar</div>
            <div className="alert-sub">Los últimos 3 análisis de {nombre} muestran emociones que suelen asociarse a malestar. Podría ser útil conversar con calma o, si lo consideras, con un profesional.</div>
            <button className="alert-action" disabled title="Próximamente" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Contactar especialista →</button>
          </div>
        ) : (
          <div className="alert-card" style={{ background: 'rgba(45,212,191,0.06)', borderColor: 'rgba(45,212,191,0.25)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌱</div>
            <div className="alert-title">Todo en seguimiento</div>
            <div className="alert-sub">No hay señales de alerta en los análisis recientes de {nombre}. Sigue acompañando y registrando sus dibujos.</div>
          </div>
        )}

        <div className="dashboard-card" style={{ padding: '22px', animation: 'fadeUp 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px', fontWeight: 700 }}>
            Acciones rápidas
          </div>
          <div className="quick-actions">
            <div className="qa-btn" onClick={() => navigate('/app')}>
              <span className="qa-icon">🎨</span>
              Nuevo análisis
            </div>
            <div className="qa-btn" onClick={() => navigate('/historial')}>
              <span className="qa-icon">📊</span>
              Ver historial
            </div>
            <div className="qa-btn" title="Próximamente" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <span className="qa-icon">📄</span>
              Exportar PDF
            </div>
            <div className="qa-btn" title="Próximamente" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <span className="qa-icon">💬</span>
              Compartir
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
