import React from 'react';
import './ChartCard.css';

const ChartCard = ({ activeChildName = '', sessions = [] }) => {
  const childNameStr = activeChildName || 'este niño';
  
  let dataPoints = sessions.slice(0, 7).reverse();
  const xCoords = [40, 120, 200, 280, 360, 440, 520];
  
  const getIntensityY = (intensityStr = '') => {
    const lower = String(intensityStr).toLowerCase();
    if (lower.includes('alta') || lower.includes('alto')) return 30;
    if (lower.includes('baja') || lower.includes('bajo')) return 140;
    return 90;
  };

  const getEmotionColor = (emotionStr = '') => {
    const lower = String(emotionStr).toLowerCase();
    if (lower.includes('ansiedad') || lower.includes('enojo') || lower.includes('ira')) return '#f87171';
    if (lower.includes('tristeza') || lower.includes('melancolía') || lower.includes('miedo')) return '#60a5fa';
    if (lower.includes('alegría') || lower.includes('felicidad')) return '#2dd4bf';
    return '#a89ee0'; 
  };

  const formattedPoints = xCoords.map((x, i) => {
    const s = dataPoints[i - (7 - dataPoints.length)];
    if (s) {
      return {
        x,
        y: getIntensityY(s.resultado_ia?.intensidad),
        color: getEmotionColor(s.resultado_ia?.emocion_predominante),
        label: i === 6 ? 'Hoy' : `Sem ${i+1}`
      };
    }
    return { x, y: 155, color: 'transparent', label: i === 6 ? 'Hoy' : `Sem ${i+1}` }; 
  });

  const validPoints = formattedPoints.filter(p => p.color !== 'transparent');
  let polylinePoints = '';
  let areaPath = '';

  if (validPoints.length > 0) {
    polylinePoints = validPoints.map(p => `${p.x},${p.y}`).join(' ');
    areaPath = `M${validPoints[0].x},155 L${validPoints.map(p => `${p.x},${p.y}`).join(' L')} L${validPoints[validPoints.length-1].x},155 Z`;
  }

  const latestPoint = validPoints[validPoints.length - 1];

  return (
    <div className="dashboard-card chart-card">
      <div className="card-header">
        <div>
          <div className="card-label">Evolución temporal</div>
          <div className="card-title">Tendencia emocional — {childNameStr}</div>
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
          </defs>

          <line x1="40" y1="20" x2="540" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="40" y1="60" x2="540" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="40" y1="100" x2="540" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="40" y1="140" x2="540" y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          <text x="28" y="24" fill="#a1a1aa" fontSize="10" textAnchor="end">Alto</text>
          <text x="28" y="104" fill="#a1a1aa" fontSize="10" textAnchor="end">Medio</text>
          <text x="28" y="144" fill="#a1a1aa" fontSize="10" textAnchor="end">Bajo</text>

          {formattedPoints.map((p, i) => (
             <text key={`label-${i}`} x={p.x} y="165" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontWeight={i === 6 ? 'bold' : 'normal'}>{p.label}</text>
          ))}

          {validPoints.length > 0 && (
            <>
              <path className="animated-area" d={areaPath} fill="url(#gradPurple)" />
              <polyline className="animated-line" points={polylinePoints} fill="none" stroke="#a89ee0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          <g style={{animation: 'fadeIn 2.5s ease forwards', opacity: 0}}>
            {validPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === validPoints.length - 1 ? 6 : 4} fill={p.color} stroke="#1e1e30" strokeWidth="2" />
            ))}

            {latestPoint && (
              <>
                <line x1={latestPoint.x} y1="20" x2={latestPoint.x} y2="155" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />
                <rect x={latestPoint.x - 16} y="10" width="32" height="18" rx="4" fill="rgba(255,255,255,0.1)" /> 
                <text x={latestPoint.x} y="23" fill={latestPoint.color} fontSize="9" textAnchor="middle" fontWeight="700">
                  {latestPoint.y === 30 ? '↑ Alta' : latestPoint.y === 90 ? 'Media' : '↓ Baja'}
                </text>
              </>
            )}
          </g>
        </svg>
      </div>
      <div className="emotion-legend">
        <div className="legend-item"><span className="legend-dot" style={{background: '#f87171'}}></span>Ansiedad / Enojo</div>
        <div className="legend-item"><span className="legend-dot" style={{background: '#60a5fa'}}></span>Tristeza / Miedo</div>
        <div className="legend-item"><span className="legend-dot" style={{background: '#2dd4bf'}}></span>Alegría</div>
        <div className="legend-item"><span className="legend-dot" style={{background: '#a89ee0'}}></span>Calma</div>
      </div>
    </div>
  );
};

export default ChartCard;
