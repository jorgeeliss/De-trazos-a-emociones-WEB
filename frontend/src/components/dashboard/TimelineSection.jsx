import React from 'react';
import './TimelineSection.css';

const TimelineSection = ({ sessions = [], activeChildName = '' }) => {
  const childNameStr = activeChildName || 'tu hijo/a';
  const displaySessions = sessions.slice(0, 5);

  const getEmotionColor = (emotionStr = '') => {
    const lower = emotionStr.toLowerCase();
    if (lower.includes('ansiedad') || lower.includes('enojo') || lower.includes('ira')) return { dotBg: 'rgba(248,113,113,0.15)', dot: '😟', color: '#f87171' };
    if (lower.includes('tristeza') || lower.includes('melancolía') || lower.includes('miedo')) return { dotBg: 'rgba(96,165,250,0.15)', dot: '😔', color: '#60a5fa' };
    if (lower.includes('alegría') || lower.includes('felicidad')) return { dotBg: 'rgba(45,212,191,0.15)', dot: '😊', color: '#2dd4bf' };
    if (lower.includes('calma') || lower.includes('tranquilidad')) return { dotBg: 'rgba(168,158,224,0.15)', dot: '😌', color: '#a89ee0' };
    return { dotBg: 'rgba(251,191,36,0.15)', dot: '😐', color: '#fbbf24' };
  };

  const getIntensityProps = (intStr = '') => {
    const lower = String(intStr).toLowerCase();
    if (lower.includes('alta') || lower.includes('alto')) return { label: 'Intensidad alta', dotColor: '#f87171' };
    if (lower.includes('baja') || lower.includes('bajo')) return { label: 'Intensidad baja', dotColor: '#4ade80' };
    return { label: 'Intensidad media', dotColor: '#fbbf24' };
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return (isToday ? 'Hoy · ' : '') + date.toLocaleDateString('es-ES', options);
  };

  return (
    <div className="dashboard-card timeline-section">
      <div className="ts-header">
        <div>
          <div className="ts-title">Cómo ha estado {childNameStr}</div>
          <div style={{fontSize: '13px', color: 'var(--muted2)', marginTop: '4px'}}>Sus últimos dibujos contaron esto</div>
        </div>
        <button className="btn-outline">Ver todo</button>
      </div>
      <div className="ts-body">
        {displaySessions.length === 0 ? (
          <div style={{padding: '20px', color: 'var(--muted)'}}>No hay historial reciente.</div>
        ) : (
          displaySessions.map((session, i) => {
            const emocionPrincipal = session.resultado_ia?.emocion_predominante || 'Desconocida';
            const emotionProps = getEmotionColor(emocionPrincipal);
            const intensity = getIntensityProps(session.resultado_ia?.intensidad);
            const summary = session.resultado_ia?.analisis_completo ? session.resultado_ia.analisis_completo.substring(0, 150) + '...' : 'No hay detalles de análisis disponibles.';
            
            return (
              <div key={i} className="tl-item">
                <div className="tl-left">
                  <div className="tl-dot" style={{background: emotionProps.dotBg}}>{emotionProps.dot}</div>
                  {i < displaySessions.length - 1 && <div className="tl-line"></div>}
                </div>
                <div className="tl-right">
                  <div className="tl-date">{formatDate(session.fecha)}</div>
                  <div className="tl-emotion-row">
                    <div className="tl-emotion-name">{emocionPrincipal.charAt(0).toUpperCase() + emocionPrincipal.slice(1)}</div>
                  </div>
                  <div className="tl-chips">
                    <span className="tl-chip" style={{background: emotionProps.dotBg, color: emotionProps.color}}>
                      {emocionPrincipal.charAt(0).toUpperCase() + emocionPrincipal.slice(1)}
                    </span>
                  </div>
                  <div className="tl-summary">{summary}</div>
                  <div className="tl-intensity">
                    <div className="tl-intensity-dot" style={{background: intensity.dotColor}}></div>
                    <span style={{fontSize: '12px', color: 'var(--muted)'}}>{intensity.label}</span>
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
