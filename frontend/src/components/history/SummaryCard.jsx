import React from 'react';
import './SummaryCard.css';

const SummaryCard = ({ barsWidth, dotsHeight }) => {
  return (
    <div className="dashboard-card summary-card">
      <div className="card-header">
        <div>
          <div className="card-label">Resumen</div>
          <div className="card-title">Emociones predominantes</div>
        </div>
      </div>
      <div className="summary-body">
        {[
          { name: 'Ansiedad', color: '#f87171', bg: 'rgba(248,113,113,0.5)', trend: 'up', trendTxt: '↑ +18%', pct: '62%' },
          { name: 'Alegría', color: '#2dd4bf', bg: 'rgba(45,212,191,0.5)', trend: 'stable', trendTxt: '= 0%', pct: '38%' },
          { name: 'Calma', color: '#a89ee0', bg: 'rgba(168,158,224,0.5)', trend: 'down', trendTxt: '↓ -8%', pct: '24%' },
          { name: 'Tristeza', color: '#fbbf24', bg: 'rgba(251,191,36,0.5)', trend: 'stable', trendTxt: '= 0%', pct: '15%' },
        ].map((item, i) => (
          <div key={i}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px'}}>
              <div className="summary-emotion">
                <span className="s-dot" style={{background: item.color, color: item.bg}}></span>
                <span className="s-name">{item.name}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div className={`trend ${item.trend}`}>{item.trendTxt}</div>
                <span className="s-pct">{item.pct}</span>
              </div>
            </div>
            <div className="s-bar-wrap">
              <div className="s-bar" style={{width: barsWidth[i], background: item.color, boxShadow: `0 0 10px ${item.bg}`}}></div>
            </div>
          </div>
        ))}

        <div style={{marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)'}}>
          <div style={{fontSize: '12px', color: 'var(--muted2)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700}}>Actividad semanal</div>
          <div className="week-dots">
            {[
              { bg: 'var(--purple)', opacity: 0.3 },
              { bg: 'var(--purple)', opacity: 0.5 },
              { bg: 'var(--purple)', opacity: 0.4 },
              { bg: 'var(--purple)', opacity: 0.6 },
              { bg: 'var(--purple)', opacity: 0.5 },
              { bg: 'var(--purple-light)', boxShadow: '0 0 8px var(--purple-glow)' },
              { bg: 'var(--border2)' },
            ].map((dot, i) => (
              <div key={i} className="w-dot" style={{height: dotsHeight[i], background: dot.bg, opacity: dot.opacity, boxShadow: dot.boxShadow}}></div>
            ))}
          </div>
          <div style={{fontSize: '11px', color: 'var(--muted)', marginTop: '6px', fontWeight: 500, display: 'flex', justifyContent: 'space-between', width: '105px'}}>
            <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
