import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './ChartCard.css';
import { emotionVisual, formatFechaCorta } from '../../utils/emociones';
import { puntosClima, resumenClima } from '../../utils/clima';

// Clima emocional: cada análisis es un punto con el color y el ícono de su
// emoción. Arriba las emociones más agradables, abajo las más difíciles; la
// distancia a la línea del centro es la intensidad. Clic en un punto abre el análisis.
const X0 = 130, X1 = 588;
const CENTRO = 112, PASO = 30; // intensidad 3 -> 90 px del centro
const ICONO_TENDENCIA = { mejora: TrendingUp, baja: TrendingDown, estable: Minus };

const ChartCard = ({ sessions = [], activeChildName = '', onSelect }) => {
  const [periodo, setPeriodo] = useState('todo');
  const puntos = puntosClima(sessions, periodo);
  const resumen = resumenClima(puntos);

  const n = puntos.length;
  const xFor = (i) => (n <= 1 ? (X0 + X1) / 2 : X0 + (i * (X1 - X0)) / (n - 1));
  const coords = puntos.map((p, i) => ({ ...p, x: xFor(i), y: CENTRO - p.valor * PASO, visual: emotionVisual(p.emocion) }));
  const mostrarFecha = (i) => n <= 8 || i % 2 === (n - 1) % 2; // con muchos puntos, una sí y otra no (siempre la última)

  // Leyenda: emociones distintas del periodo.
  const leyenda = [];
  const vistos = new Set();
  for (const c of coords) {
    const k = c.emocion.toLowerCase();
    if (k && !vistos.has(k)) { vistos.add(k); leyenda.push(c); }
  }

  const abrir = (c) => onSelect && onSelect(c.analisis);
  const IconoTendencia = resumen ? ICONO_TENDENCIA[resumen.tipo] : null;

  return (
    <div className="dashboard-card chart-card">
      <div className="card-header">
        <div>
          <div className="card-label">Evolución temporal</div>
          <div className="card-title">Clima emocional — {activeChildName || 'este niño'}</div>
        </div>
        <div className="clima-periodo" role="group" aria-label="Periodo">
          {[['3m', '3 meses'], ['todo', 'Todo']].map(([clave, label]) => (
            <button key={clave} type="button" className={periodo === clave ? 'activo' : ''} onClick={() => setPeriodo(clave)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {n < 2 ? (
        <div className="chart-wrap clima-vacio">
          {sessions.length >= 2 && periodo !== 'todo'
            ? 'En los últimos 3 meses hay menos de 2 análisis. Prueba con «Todo».'
            : 'Se necesitan al menos 2 análisis de este niño para ver cómo cambia su clima emocional.'}
        </div>
      ) : (
        <div className="chart-wrap">
          <svg
            viewBox="0 0 620 236"
            className="chart-svg-wrap"
            role="img"
            aria-label={`Clima emocional: ${coords.map((c) => `${formatFechaCorta(c.fecha)} ${c.emocion} (${c.intensidad})`).join(', ')}`}
          >
            {/* Zonas: agradable arriba, difícil abajo. Colores por style (variables
                CSS) para que sigan el tema; los atributos SVG no aceptan var(). */}
            <rect x="112" y="16" width="492" height={CENTRO - 16} rx="10" className="clima-zona agradable" />
            <rect x="112" y={CENTRO} width="492" height={CENTRO - 16} rx="10" className="clima-zona dificil" />
            <line x1="112" y1={CENTRO} x2="604" y2={CENTRO} className="clima-centro" />

            <text x="100" y="34" textAnchor="end" className="clima-eje">Más agradable</text>
            <text x="100" y={CENTRO + 4} textAnchor="end" className="clima-eje">Neutral</text>
            <text x="100" y="198" textAnchor="end" className="clima-eje">Más difícil</text>

            <polyline
              points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
              className="clima-linea"
              pathLength="1000"
            />

            {coords.map((c, i) => (
              <g
                key={c.analisis._id || i}
                className="clima-punto"
                style={{ '--emo': c.visual.color, animationDelay: `${0.25 + i * 0.06}s` }}
                role={onSelect ? 'button' : undefined}
                tabIndex={onSelect ? 0 : undefined}
                onClick={() => abrir(c)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(c); } }}
              >
                <title>{`${formatFechaCorta(c.fecha)} · ${c.emocion} · intensidad ${c.intensidad}${onSelect ? ' (clic para ver el análisis)' : ''}`}</title>
                <circle cx={c.x} cy={c.y} r="13" />
                <c.visual.Icono x={c.x - 7.5} y={c.y - 7.5} width="15" height="15" strokeWidth="2.2" />
              </g>
            ))}

            {coords.map((c, i) => mostrarFecha(i) && (
              <text key={`f-${i}`} x={c.x} y="226" textAnchor="middle" className="clima-fecha">{formatFechaCorta(c.fecha)}</text>
            ))}
          </svg>
        </div>
      )}

      {resumen && n >= 2 && (
        <div className={`clima-resumen ${resumen.tipo}`}>
          <IconoTendencia size={16} />
          <span>{resumen.texto}</span>
        </div>
      )}

      <div className="emotion-legend">
        {leyenda.length === 0 ? (
          <div className="legend-item" style={{ color: 'var(--muted)' }}>Sin emociones registradas</div>
        ) : (
          leyenda.map((c, i) => (
            <div className="legend-item" key={i}>
              <span className="legend-dot" style={{ background: c.visual.color, color: c.visual.bg }}></span>
              {c.emocion}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChartCard;
