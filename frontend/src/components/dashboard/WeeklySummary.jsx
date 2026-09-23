import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WeeklySummary.css';

const WeeklySummary = ({ sessions = [], activeChildName = '' }) => {
  const navigate = useNavigate();

  const childNameStr = activeChildName || 'tu hijo/a';
  
  let emotion = 'Ninguna';
  let emotionDesc = 'Aún no hay suficientes datos para generar un resumen.';
  let emoji = '😐';
  let alertMode = false;

  const getEmojiAndColor = (eStr) => {
    const lower = eStr.toLowerCase();
    if (lower.includes('ansiedad') || lower.includes('miedo')) return { emoji: '😟', bg: 'rgba(248,113,113,0.5)', height: '48px', color: '#f87171' };
    if (lower.includes('tristeza') || lower.includes('melancolía')) return { emoji: '😔', bg: 'rgba(96,165,250,0.5)', height: '40px', color: '#60a5fa' };
    if (lower.includes('alegría') || lower.includes('felicidad')) return { emoji: '😊', bg: 'rgba(45,212,191,0.5)', height: '56px', color: '#2dd4bf' };
    if (lower.includes('calma') || lower.includes('tranquilidad')) return { emoji: '😌', bg: 'rgba(168,158,224,0.5)', height: '32px', color: '#a89ee0' };
    if (lower.includes('enojo') || lower.includes('ira')) return { emoji: '😠', bg: 'rgba(248,113,113,0.6)', height: '60px', color: '#f87171' };
    return { emoji: '😐', bg: 'rgba(148,144,168,0.4)', height: '24px', color: '#9ca3af' };
  };

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  let weekData = [];
  
  if (sessions.length > 0) {
    const latest = sessions[0];
    const e = latest.resultado_ia?.emocion_predominante || 'Desconocida';
    emotion = e.charAt(0).toUpperCase() + e.slice(1);
    emotionDesc = `${childNameStr} muestra signos de ${emotion.toLowerCase()} en su último dibujo.`;
    emoji = getEmojiAndColor(emotion).emoji;
    
    if (emotion.toLowerCase().includes('ansiedad') || emotion.toLowerCase().includes('tristeza') || emotion.toLowerCase().includes('enojo')) {
      alertMode = true;
    }

    // Generate last 7 elements from sessions
    const recent = sessions.slice(0, 7).reverse();
    weekData = recent.map((s, idx) => {
      const isToday = idx === recent.length - 1;
      const d = new Date(s.fecha);
      const dayName = isToday ? 'Hoy' : dayNames[d.getDay()];
      const meta = getEmojiAndColor(s.resultado_ia?.emocion_predominante || '');
      return { dot: meta.emoji, bg: meta.bg, name: dayName, height: meta.height, active: isToday };
    });
  }

  // Fill remaining days if less than 7
  while (weekData.length < 7) {
    weekData.unshift({ dot: '○', bg: 'var(--border)', name: '-', height: '8px', opacity: 0.2, active: false });
  }
  return (
    <div className="grid-main">
      {/* ESTA SEMANA */}
      <div className="dashboard-card week-card">
        <div className="week-header">
          <div className="week-title">Esta semana</div>
          <div className="week-badge">Última actualización: hoy</div>
        </div>
        <div className="week-body">
          <div className="state-main">
            <div className="state-emoji-wrap">
              <div className="state-pulse"></div>
              {emoji}
            </div>
            <div className="state-info">
              <div className="state-label">Emoción predominante</div>
              <div className="state-emotion">{emotion}</div>
              <div className="state-desc">{emotionDesc}</div>
            </div>
          </div>

          {/* Timeline semanal */}
          <div className="week-timeline">
            {weekData.map((day, i) => (
              <div key={i} className="day-col">
                <div className="day-bar-wrap">
                  <div className="day-dot" style={{ opacity: day.opacity || 1 }}>{day.dot}</div>
                  <div className="day-bar" style={{ background: day.bg, height: day.height, transition: 'height 1s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                </div>
                <div className={`day-name ${day.active ? 'today' : ''}`}>{day.name}</div>
              </div>
            ))}
          </div>

          {/* Mensaje para el padre */}
          <div className="message-box">
            <div className="message-label">💡 Lo que esto significa</div>
            <div className="message-text">Esta sección refleja el estado reciente de <strong>{childNameStr}</strong> según sus últimos análisis. {alertMode ? 'Presta un poco más de atención a sus interacciones diarias.' : 'Sigue monitoreando de forma continua para más información.'}</div>
          </div>
        </div>
      </div>

      {/* DERECHA */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {alertMode && (
          <div className="alert-card">
            <div style={{fontSize: '32px', marginBottom: '12px', animation: 'float 4s infinite ease-in-out'}}>🔔</div>
            <div className="alert-title">Atención necesaria</div>
            <div className="alert-sub">{childNameStr} ha mostrado emociones negativas recientemente. Podría ser útil hablar con su profesora o un especialista.</div>
          </div>
        )}

        <div className="dashboard-card" style={{padding: '22px', animation: 'fadeUp 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both'}}>
          <div style={{fontSize: '12px', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px', fontWeight: 700}}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
