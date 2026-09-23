import React from 'react';
import './ActivitiesSection.css';

const ActivitiesSection = ({ actDones, toggleActDone }) => {
  return (
    <div className="dashboard-card activities-section">
      <div className="act-header">
        <div>
          <div className="act-title">Actividades sugeridas</div>
          <div className="act-subtitle">Para hacer con Sofía esta semana</div>
        </div>
        <span style={{fontSize: '24px', animation: 'float 3s infinite ease-in-out alternate'}}>✨</span>
      </div>
      <div className="act-body">
        <div className="act-card" onClick={() => toggleActDone(0)}>
          <div className="act-icon" style={{background: 'rgba(139, 121, 242, 0.15)'}}>🎨</div>
          <div className="act-info">
            <div className="act-name">Dibujen juntos 15 minutos</div>
            <div className="act-desc">Siéntate con ella sin pantallas. Deja que elija qué dibujar. No corrijas, solo acompaña.</div>
            <span className="act-tag" style={{background: 'rgba(139, 121, 242, 0.15)', color: 'var(--purple-light)'}}>Conexión</span>
          </div>
          <div className={`act-done ${actDones[0] ? 'checked' : ''}`}>
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="act-card" onClick={() => toggleActDone(1)}>
          <div className="act-icon" style={{background: 'rgba(45,212,191,0.15)'}}>📖</div>
          <div className="act-info">
            <div className="act-name">Cuento antes de dormir</div>
            <div className="act-desc">Un cuento donde el personaje supera un miedo. Ayuda a procesar emociones.</div>
            <span className="act-tag" style={{background: 'rgba(45,212,191,0.15)', color: 'var(--teal)'}}>Calma</span>
          </div>
          <div className={`act-done ${actDones[1] ? 'checked' : ''}`}>
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="act-card" onClick={() => toggleActDone(2)}>
          <div className="act-icon" style={{background: 'rgba(251,191,36,0.15)'}}>💬</div>
          <div className="act-info">
            <div className="act-name">Pregúntale cómo estuvo su día</div>
            <div className="act-desc">No "¿cómo te fue?" sino "¿qué fue lo más raro que pasó hoy?"</div>
            <span className="act-tag" style={{background: 'rgba(251,191,36,0.15)', color: 'var(--amber)'}}>Diálogo</span>
          </div>
          <div className={`act-done ${actDones[2] ? 'checked' : ''}`}>
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesSection;
