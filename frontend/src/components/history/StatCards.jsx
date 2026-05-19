import React from 'react';
import './StatCards.css';

const StatCards = () => {
  return (
    <div className="grid-bottom" style={{marginBottom: '20px'}}>
      <div className="dashboard-card stat-card">
        <div style={{fontSize: '11px', color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', fontWeight: 700}}>Total análisis</div>
        <div className="stat-num">14</div>
        <div className="stat-label">sesiones registradas</div>
        <div className="stat-sub">
          <span className="trend up" style={{fontSize: '11px'}}>+3 este mes</span>
        </div>
      </div>
      <div className="dashboard-card stat-card">
        <div style={{fontSize: '11px', color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', fontWeight: 700}}>Emoción dominante</div>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: '26px', fontWeight: 800, color: '#f87171', lineHeight: 1, letterSpacing: '-0.02em'}}>Ansiedad</div>
        <div className="stat-label">últimas 3 semanas</div>
        <div className="stat-sub">
          <span style={{width: '8px', height: '8px', borderRadius: '50%', background: '#f87171', display: 'inline-block', boxShadow: '0 0 8px rgba(248,113,113,0.5)'}}></span>
          <span style={{fontSize: '11px', color: 'var(--muted2)', fontWeight: 500}}>Intensidad alta</span>
        </div>
      </div>
      <div className="dashboard-card stat-card">
        <div style={{fontSize: '11px', color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', fontWeight: 700}}>Mejor momento</div>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: '26px', fontWeight: 800, color: '#2dd4bf', lineHeight: 1, letterSpacing: '-0.02em'}}>Sem 2</div>
        <div className="stat-label">mayor índice de alegría</div>
        <div className="stat-sub">
          <span className="trend up" style={{fontSize: '11px'}}>↑ 71% alegría</span>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
