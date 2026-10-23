import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import './AnalyzingProgress.css';

const FASES = [
  'Preparando el dibujo',
  'Observando los trazos y la presión',
  'Identificando los colores',
  'Analizando figuras y composición',
  'Considerando el contexto',
  'Redactando la lectura orientativa',
];

const AnalyzingProgress = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev < FASES.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round(((i + 1) / FASES.length) * 100);

  return (
    <div className="analyzing-box">
      <div className="analyzing-head">
        <div className="analyzing-badge">
          <Sparkles size={18} />
        </div>
        <div className="analyzing-titles">
          <div className="analyzing-title">Analizando el dibujo</div>
          <div className="analyzing-phase" key={i}>{FASES[i]}…</div>
        </div>
      </div>

      <div className="analyzing-bar">
        <div className="analyzing-bar-fill" style={{ width: `${pct}%` }}></div>
      </div>

      <div className="analyzing-note">Esto puede tardar unos minutos. No cierres esta ventana.</div>
    </div>
  );
};

export default AnalyzingProgress;
