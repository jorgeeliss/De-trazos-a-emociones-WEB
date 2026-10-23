import './ChartCard.css';
import { emotionVisual, intensityInfo, formatFechaCorta } from '../../utils/emociones';

// Gráfica real: intensidad emocional a lo largo del tiempo. Cada punto es un
// análisis (coloreado por su emoción); el eje Y es la intensidad baja/media/alta.
const ChartCard = ({ sessions = [], activeChildName = '' }) => {
  const puntos = [...sessions].reverse().slice(-8); // cronológico, hasta 8

  const X0 = 40, X1 = 540, Y_STEP = 50;
  const n = puntos.length;
  const xFor = (i) => (n <= 1 ? (X0 + X1) / 2 : X0 + (i * (X1 - X0)) / (n - 1));
  const yFor = (valor) => 140 - (valor - 1) * Y_STEP; // 1->140, 2->90, 3->40

  const coords = puntos.map((s, i) => {
    const inten = intensityInfo(s.resultado_ia?.intensidad || '');
    const visual = emotionVisual(s.resultado_ia?.emocion_predominante || '');
    return { x: xFor(i), y: yFor(inten.valor), visual, fecha: s.fecha };
  });
  const polyPoints = coords.map((c) => `${c.x},${c.y}`).join(' ');

  // Leyenda: emociones únicas presentes en los puntos mostrados.
  const leyenda = [];
  const vistos = new Set();
  for (const s of puntos) {
    const e = (s.resultado_ia?.emocion_predominante || '').toLowerCase();
    if (e && !vistos.has(e)) {
      vistos.add(e);
      leyenda.push({ nombre: s.resultado_ia.emocion_predominante, visual: emotionVisual(e) });
    }
  }

  return (
    <div className="dashboard-card chart-card">
      <div className="card-header">
        <div>
          <div className="card-label">Evolución temporal</div>
          <div className="card-title">Tendencia emocional — {activeChildName || 'este niño'}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ background: 'var(--purple-dim)', color: 'var(--purple-light)', border: 'none', borderRadius: '10px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, cursor: 'default', fontFamily: "'DM Sans', sans-serif" }}>Por intensidad</button>
          <button className="btn-outline-small" disabled title="Próximamente" style={{ opacity: 0.55, cursor: 'not-allowed' }}>3 meses</button>
        </div>
      </div>

      {puntos.length < 2 ? (
        <div className="chart-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', minHeight: '180px', textAlign: 'center', padding: '0 20px' }}>
          Se necesitan al menos 2 análisis de este niño para mostrar la tendencia emocional.
        </div>
      ) : (
        <div className="chart-wrap">
          <svg viewBox="0 0 560 180" className="chart-svg-wrap" xmlns="http://www.w3.org/2000/svg">
            <line x1="40" y1="40" x2="540" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="40" y1="90" x2="540" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="40" y1="140" x2="540" y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

            <text x="28" y="44" fill="#a1a1aa" fontSize="10" textAnchor="end">Alta</text>
            <text x="28" y="94" fill="#a1a1aa" fontSize="10" textAnchor="end">Media</text>
            <text x="28" y="144" fill="#a1a1aa" fontSize="10" textAnchor="end">Baja</text>

            {coords.map((c, i) => (
              <text key={`x-${i}`} x={c.x} y="165" fill="#a1a1aa" fontSize="9" textAnchor="middle">{formatFechaCorta(c.fecha)}</text>
            ))}

            <polyline points={polyPoints} fill="none" stroke="#a89ee0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {coords.map((c, i) => (
              <circle key={`p-${i}`} cx={c.x} cy={c.y} r="5" fill={c.visual.color} stroke="#1e1e30" strokeWidth="2" />
            ))}
          </svg>
        </div>
      )}

      <div className="emotion-legend">
        {leyenda.length === 0 ? (
          <div className="legend-item" style={{ color: 'var(--muted)' }}>Sin emociones registradas</div>
        ) : (
          leyenda.map((l, i) => (
            <div className="legend-item" key={i}>
              <span className="legend-dot" style={{ background: l.visual.color, color: l.visual.bg }}></span>
              {l.nombre}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChartCard;
