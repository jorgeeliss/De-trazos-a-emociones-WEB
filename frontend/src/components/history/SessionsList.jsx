import React from 'react';
import { ChevronRight } from 'lucide-react';
import './SessionsList.css';

const SessionsList = ({ sessions = [], activeChildName = '' }) => {

  const getEmotionColor = (emotionStr = '') => {
    const lower = emotionStr.toLowerCase();
    if (lower.includes('ansiedad') || lower.includes('enojo') || lower.includes('ira')) return { bg: 'rgba(248,113,113,0.15)', color: '#f87171', stroke: '#f87171' };
    if (lower.includes('tristeza') || lower.includes('melancolía') || lower.includes('miedo')) return { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', stroke: '#60a5fa' };
    if (lower.includes('alegría') || lower.includes('felicidad')) return { bg: 'rgba(45,212,191,0.15)', color: '#2dd4bf', stroke: '#2dd4bf' };
    if (lower.includes('calma') || lower.includes('tranquilidad')) return { bg: 'rgba(168,158,224,0.15)', color: '#a89ee0', stroke: '#a89ee0' };
    return { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', stroke: '#fbbf24' }; 
  };

  const getIntensityProps = (intStr = '') => {
    const lower = String(intStr).toLowerCase();
    if (lower.includes('alta') || lower.includes('alto')) return { label: 'Alta', bg: 'rgba(248,113,113,0.15)', color: '#f87171' };
    if (lower.includes('baja') || lower.includes('bajo')) return { label: 'Baja', bg: 'rgba(74,222,128,0.15)', color: '#4ade80' };
    return { label: 'Media', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' };
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
  };

  return (
    <div className="dashboard-card sessions-card">
      <div className="card-header">
        <div>
          <div className="card-label">Registro de sesiones</div>
          <div className="card-title">Todos los análisis de {activeChildName || 'este niño'}</div>
        </div>
        <button className="btn-outline-small">Exportar PDF</button>
      </div>
      <div className="sessions-body">
        {sessions.length === 0 ? (
          <div style={{padding: '30px', textAlign: 'center', color: 'var(--muted)'}}>
            No hay sesiones registradas para {activeChildName}.
          </div>
        ) : (
          sessions.map((session, i) => {
            const emocionPrincipal = session.resultado_ia?.emocion_predominante || 'Desconocida';
            const colors = getEmotionColor(emocionPrincipal);
            const intensity = getIntensityProps(session.resultado_ia?.intensidad);
            const dateObj = new Date(session.fecha);
            const isToday = new Date().toDateString() === dateObj.toDateString();
            const datePrefix = isToday ? 'Hoy · ' : '';

            // Generamos una gráfica visual aleatoria o usamos una por defecto para la decoración
            const sparkPoints = '0,25 13,20 26,15 39,10 52,8 65,5 80,3';

            return (
              <div key={i} className="session-row">
                <div className="session-thumb" style={{padding: 0, overflow: 'hidden', background: '#f0f0f0'}}>
                  {session.ruta_imagen ? (
                    <img src={`http://localhost:3000${session.ruta_imagen}`} alt="Dibujo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : '🖼️'}
                </div>
                <div className="session-info">
                  <div className="session-date">{datePrefix}{formatDate(session.fecha)}</div>
                  <div className="session-emotions">
                    <span className="e-chip" style={{background: colors.bg, color: colors.color}}>
                      {emocionPrincipal.charAt(0).toUpperCase() + emocionPrincipal.slice(1)}
                    </span>
                  </div>
                </div>
                <svg className="sparkline" viewBox="0 0 80 30">
                  <polyline points={sparkPoints} fill="none" stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="session-intensity">
                  <div className="intensity-label">Intensidad</div>
                  <div className="intensity-badge" style={{background: intensity.bg, color: intensity.color}}>
                    {intensity.label}
                  </div>
                </div>
                <ChevronRight className="session-arrow" size={20} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SessionsList;
