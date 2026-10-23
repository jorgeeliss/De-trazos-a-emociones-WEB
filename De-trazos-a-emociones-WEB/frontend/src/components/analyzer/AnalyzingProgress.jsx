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
  const [pct, setPct] = useState(6);

  // El texto de la fase avanza cada ~2.8 s (es informativo).
  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev < FASES.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(id);
  }, []);

  // La barra avanza rápido al inicio y se desacelera acercándose a un tope (~92%);
  // nunca llega a 100%. Cuando el análisis realmente termina, este componente
  // desaparece y se muestra el resultado.
  useEffect(() => {
    const id = setInterval(() => {
      setPct((p) => (p < 92 ? p + (92 - p) * 0.05 : p));
    }, 600);
    return () => clearInterval(id);
  }, []);

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
