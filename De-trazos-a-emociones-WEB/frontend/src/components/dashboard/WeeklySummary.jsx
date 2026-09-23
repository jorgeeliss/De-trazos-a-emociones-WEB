import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WeeklySummary.css';

const WeeklySummary = ({ barsHeight }) => {
  const navigate = useNavigate();
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
              😟
            </div>
            <div className="state-info">
              <div className="state-label">Emoción predominante</div>
              <div className="state-emotion">Ansiedad</div>
              <div className="state-desc">Sofía podría estar experimentando algo que la preocupa. Sus dibujos muestran trazos tensos y colores oscuros.</div>
            </div>
          </div>

          {/* Timeline semanal */}
          <div className="week-timeline">
            {[
              { dot: '😊', bg: 'rgba(45,212,191,0.5)', name: 'Lun' },
              { dot: '😐', bg: 'rgba(148,144,168,0.4)', name: 'Mar' },
              { dot: '😔', bg: 'rgba(251,191,36,0.45)', name: 'Mié' },
              { dot: '😟', bg: 'rgba(248,113,113,0.5)', name: 'Jue' },
              { dot: '😟', bg: 'rgba(248,113,113,0.6)', name: 'Vie' },
              { dot: '😟', bg: 'rgba(248,113,113,0.7)', name: 'Hoy', active: true },
              { dot: '○', bg: 'var(--border)', name: 'Dom', opacity: 0.2 },
            ].map((day, i) => (
              <div key={i} className="day-col">
                <div className="day-bar-wrap">
                  <div className="day-dot" style={{ opacity: day.opacity || 1 }}>{day.dot}</div>
                  <div className="day-bar" style={{ background: day.bg, height: barsHeight[i] }}></div>
                </div>
                <div className={`day-name ${day.active ? 'today' : ''}`}>{day.name}</div>
              </div>
            ))}
          </div>

          {/* Mensaje para el padre */}
          <div className="message-box">
            <div className="message-label">💡 Lo que esto significa</div>
            <div className="message-text">Sofía ha mostrado señales de ansiedad en <strong>3 días seguidos</strong>. Esto puede estar relacionado con algo en el colegio o en casa. <strong>No es alarmante</strong>, pero sí es una buena señal para hablar con ella.</div>
          </div>
        </div>
      </div>

      {/* DERECHA */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        <div className="alert-card">
          <div style={{fontSize: '32px', marginBottom: '12px', animation: 'float 4s infinite ease-in-out'}}>🔔</div>
          <div className="alert-title">Atención necesaria</div>
          <div className="alert-sub">Sofía ha mostrado emociones negativas por 3 sesiones seguidas. Podría ser útil hablar con su profesora o un especialista.</div>
          <button className="alert-action">Contactar especialista →</button>
        </div>

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
            <div className="qa-btn">
              <span className="qa-icon">📄</span>
              Exportar PDF
            </div>
            <div className="qa-btn">
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
