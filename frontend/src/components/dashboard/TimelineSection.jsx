import React from 'react';
import './TimelineSection.css';

const TimelineSection = () => {
  return (
    <div className="dashboard-card timeline-section">
      <div className="ts-header">
        <div>
          <div className="ts-title">Cómo ha estado Sofía</div>
          <div style={{fontSize: '13px', color: 'var(--muted2)', marginTop: '4px'}}>Sus últimos dibujos contaron esto</div>
        </div>
        <button className="btn-outline">Ver todo</button>
      </div>
      <div className="ts-body">
        <div className="tl-item">
          <div className="tl-left">
            <div className="tl-dot" style={{background: 'rgba(248,113,113,0.15)'}}>😟</div>
            <div className="tl-line"></div>
          </div>
          <div className="tl-right">
            <div className="tl-date">Hoy · 22 de abril, 2026</div>
            <div className="tl-emotion-row">
              <div className="tl-emotion-name">Ansiedad</div>
            </div>
            <div className="tl-chips">
              <span className="tl-chip" style={{background: 'rgba(248,113,113,0.15)', color: '#f87171'}}>Ansiedad</span>
              <span className="tl-chip" style={{background: 'rgba(251,191,36,0.12)', color: '#fbbf24'}}>Tristeza</span>
            </div>
            <div className="tl-summary">Sus trazos fueron rápidos y con mucha presión. Usó colores oscuros, lo que podría indicar que está cargando algo emocionalmente.</div>
            <div className="tl-intensity">
              <div className="tl-intensity-dot" style={{background: '#f87171'}}></div>
              <span style={{fontSize: '12px', color: 'var(--muted)'}}>Intensidad alta</span>
            </div>
          </div>
        </div>

        <div className="tl-item">
          <div className="tl-left">
            <div className="tl-dot" style={{background: 'rgba(251,191,36,0.15)'}}>😔</div>
            <div className="tl-line"></div>
          </div>
          <div className="tl-right">
            <div className="tl-date">Hace 1 semana · 15 de abril</div>
            <div className="tl-emotion-row">
              <div className="tl-emotion-name">Tristeza leve</div>
            </div>
            <div className="tl-chips">
              <span className="tl-chip" style={{background: 'rgba(148,144,168,0.2)', color: '#a89ee0'}}>Calma</span>
              <span className="tl-chip" style={{background: 'rgba(248,113,113,0.12)', color: '#f87171'}}>Ansiedad</span>
            </div>
            <div className="tl-summary">Dibujó figuras pequeñas y alejadas entre sí. Podría sentirse un poco sola o desconectada de quienes la rodean.</div>
            <div className="tl-intensity">
              <div className="tl-intensity-dot" style={{background: '#fbbf24'}}></div>
              <span style={{fontSize: '12px', color: 'var(--muted)'}}>Intensidad media</span>
            </div>
          </div>
        </div>

        <div className="tl-item">
          <div className="tl-left">
            <div className="tl-dot" style={{background: 'rgba(45,212,191,0.15)'}}>😊</div>
          </div>
          <div className="tl-right">
            <div className="tl-date">Hace 2 semanas · 8 de abril</div>
            <div className="tl-emotion-row">
              <div className="tl-emotion-name">Alegría</div>
            </div>
            <div className="tl-chips">
              <span className="tl-chip" style={{background: 'rgba(45,212,191,0.15)', color: '#2dd4bf'}}>Alegría</span>
              <span className="tl-chip" style={{background: 'rgba(96,165,250,0.15)', color: '#60a5fa'}}>Energía</span>
            </div>
            <div className="tl-summary">¡Esta fue una buena semana! Usó colores brillantes y dibujó escenas con mucha gente, lo que refleja que se sentía conectada y feliz.</div>
            <div className="tl-intensity">
              <div className="tl-intensity-dot" style={{background: '#4ade80'}}></div>
              <span style={{fontSize: '12px', color: 'var(--muted)'}}>Intensidad baja</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSection;
