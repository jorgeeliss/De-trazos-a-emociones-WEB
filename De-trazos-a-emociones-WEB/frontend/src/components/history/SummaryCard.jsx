import React, { useState, useEffect } from 'react';
import './SummaryCard.css';

const SummaryCard = ({ sessions = [], dotsHeight = ['0px', '0px', '0px', '0px', '0px', '0px', '0px'] }) => {
  const [animatedWidths, setAnimatedWidths] = useState({});

  const emotionCounts = {};
  sessions.forEach(s => {
    const e = s.resultado_ia?.emocion_predominante?.toLowerCase() || 'desconocida';
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  });

  const total = sessions.length;
  let summaryData = [];

  if (total > 0) {
    summaryData = Object.keys(emotionCounts).map(e => {
      const count = emotionCounts[e];
      const pctValue = Math.round((count / total) * 100);
      let color = '#fbbf24';
      let bg = 'rgba(251,191,36,0.5)';
      
      if (e.includes('ansiedad') || e.includes('enojo') || e.includes('ira')) { color = '#f87171'; bg = 'rgba(248,113,113,0.5)'; }
      else if (e.includes('tristeza') || e.includes('miedo')) { color = '#60a5fa'; bg = 'rgba(96,165,250,0.5)'; }
      else if (e.includes('alegría') || e.includes('felicidad')) { color = '#2dd4bf'; bg = 'rgba(45,212,191,0.5)'; }
      else if (e.includes('calma') || e.includes('tranquilidad')) { color = '#a89ee0'; bg = 'rgba(168,158,224,0.5)'; }

      return {
        name: e.charAt(0).toUpperCase() + e.slice(1),
        color,
        bg,
        trend: 'stable',
        trendTxt: `(${count})`, 
        pct: `${pctValue}%`,
        pctValue
      };
    });
    
    summaryData.sort((a, b) => b.pctValue - a.pctValue);
  } else {
    summaryData = [
       { name: 'Esperando datos', color: '#6b7280', bg: 'rgba(107,114,128,0.5)', trend: 'stable', trendTxt: '-', pct: '0%', pctValue: 0 }
    ];
  }

  summaryData = summaryData.slice(0, 4);

  useEffect(() => {
    const timer = setTimeout(() => {
      const widths = {};
      summaryData.forEach((item, i) => {
        widths[i] = item.pct;
      });
      setAnimatedWidths(widths);
    }, 100);
    return () => clearTimeout(timer);
  }, [sessions]);

  return (
    <div className="dashboard-card summary-card">
      <div className="card-header">
        <div>
          <div className="card-label">Resumen</div>
          <div className="card-title">Emociones predominantes</div>
        </div>
      </div>
      <div className="summary-body">
        {summaryData.map((item, i) => (
          <div key={i}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px'}}>
              <div className="summary-emotion">
                <span className="s-dot" style={{background: item.color, color: item.bg}}></span>
                <span className="s-name">{item.name}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div className={`trend ${item.trend}`} style={{fontSize: '11px'}}>{item.trendTxt}</div>
                <span className="s-pct">{item.pct}</span>
              </div>
            </div>
            <div className="s-bar-wrap">
              <div className="s-bar" style={{width: animatedWidths[i] || '0%', background: item.color, boxShadow: `0 0 10px ${item.bg}`, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'}}></div>
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
              <div key={i} className="w-dot" style={{height: dotsHeight[i] || '4px', background: dot.bg, opacity: dot.opacity, boxShadow: dot.boxShadow, transition: 'height 1s cubic-bezier(0.16, 1, 0.3, 1)'}}></div>
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
