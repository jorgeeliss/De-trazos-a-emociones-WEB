import React from 'react';
import './ChartCard.css';

const ChartCard = () => {
  return (
    <div className="dashboard-card chart-card">
      <div className="card-header">
        <div>
          <div className="card-label">Evolución temporal</div>
          <div className="card-title">Tendencia emocional — Sofía</div>
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button style={{background: 'var(--purple-dim)', color: 'var(--purple-light)', border: 'none', borderRadius: '10px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"}}>8 sem</button>
          <button className="btn-outline-small">3 meses</button>
        </div>
      </div>
      <div className="chart-wrap">
        <svg viewBox="0 0 560 180" className="chart-svg-wrap" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b79f2" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b79f2" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradCoral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
            </linearGradient>
          </defs>

          <line x1="40" y1="20" x2="540" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="40" y1="60" x2="540" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="40" y1="100" x2="540" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="40" y1="140" x2="540" y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          <text x="28" y="24" fill="#a1a1aa" fontSize="10" textAnchor="end">Alto</text>
          <text x="28" y="104" fill="#a1a1aa" fontSize="10" textAnchor="end">Medio</text>
          <text x="28" y="144" fill="#a1a1aa" fontSize="10" textAnchor="end">Bajo</text>

          <text x="40" y="165" fill="#a1a1aa" fontSize="10" textAnchor="middle">Sem 1</text>
          <text x="120" y="165" fill="#a1a1aa" fontSize="10" textAnchor="middle">Sem 2</text>
          <text x="200" y="165" fill="#a1a1aa" fontSize="10" textAnchor="middle">Sem 3</text>
          <text x="280" y="165" fill="#a1a1aa" fontSize="10" textAnchor="middle">Sem 4</text>
          <text x="360" y="165" fill="#a1a1aa" fontSize="10" textAnchor="middle">Sem 5</text>
          <text x="440" y="165" fill="#a1a1aa" fontSize="10" textAnchor="middle">Sem 6</text>
          <text x="520" y="165" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontWeight="bold">Hoy</text>

          <path className="animated-area" d="M40,130 L120,110 L200,90 L280,70 L360,55 L440,45 L520,30 L520,155 L360,155 L280,155 L200,155 L120,155 L40,155 Z" fill="url(#gradCoral)" />
          <polyline className="animated-line" points="40,130 120,110 200,90 280,70 360,55 440,45 520,30" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          <path className="animated-area" d="M40,120 L120,115 L200,125 L280,118 L360,105 L440,98 L520,112 L520,155 L440,155 L360,155 L280,155 L200,155 L120,155 L40,155 Z" fill="url(#gradTeal)" />
          <polyline className="animated-line" points="40,120 120,115 200,125 280,118 360,105 440,98 520,112" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          <path className="animated-area" d="M40,80 L120,95 L200,105 L280,88 L360,75 L440,80 L520,70 L520,155 L440,155 L360,155 L280,155 L200,155 L120,155 L40,155 Z" fill="url(#gradPurple)" />
          <polyline className="animated-line" points="40,80 120,95 200,105 280,88 360,75 440,80 520,70" fill="none" stroke="#a89ee0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6,4" />

          <g style={{animation: 'fadeIn 2.5s ease forwards', opacity: 0}}>
            <circle cx="40" cy="130" r="4" fill="#f87171" stroke="#1e1e30" strokeWidth="2" />
            <circle cx="120" cy="110" r="4" fill="#f87171" stroke="#1e1e30" strokeWidth="2" />
            <circle cx="200" cy="90" r="4" fill="#f87171" stroke="#1e1e30" strokeWidth="2" />
            <circle cx="280" cy="70" r="4" fill="#f87171" stroke="#1e1e30" strokeWidth="2" />
            <circle cx="360" cy="55" r="4" fill="#f87171" stroke="#1e1e30" strokeWidth="2" />
            <circle cx="440" cy="45" r="4" fill="#f87171" stroke="#1e1e30" strokeWidth="2" />
            <circle cx="520" cy="30" r="6" fill="#f87171" stroke="#1e1e30" strokeWidth="2" />

            <line x1="520" y1="20" x2="520" y2="155" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />
            <rect x="504" y="10" width="32" height="18" rx="4" fill="rgba(248,113,113,0.15)" />
            <text x="520" y="23" fill="#f87171" fontSize="9" textAnchor="middle" fontWeight="700">↑ Alta</text>
          </g>
        </svg>
      </div>
      <div className="emotion-legend">
        <div className="legend-item"><span className="legend-dot" style={{background: '#f87171', color: 'rgba(248,113,113,0.5)'}}></span>Ansiedad</div>
        <div className="legend-item"><span className="legend-dot" style={{background: '#2dd4bf', color: 'rgba(45,212,191,0.5)'}}></span>Alegría</div>
        <div className="legend-item"><span className="legend-dot" style={{background: '#a89ee0', color: 'rgba(168,158,224,0.5)'}}></span>Calma</div>
      </div>
    </div>
  );
};

export default ChartCard;
