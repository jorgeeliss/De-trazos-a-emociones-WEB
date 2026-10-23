import { useState, useEffect } from 'react';
import './AnalyzingProgress.css';

const FASES = [
  { icon: '🖼️', texto: 'Preparando el dibujo…' },
  { icon: '🖌️', texto: 'Mirando los trazos y la presión…' },
  { icon: '🎨', texto: 'Identificando los colores…' },
  { icon: '🧩', texto: 'Observando figuras y composición…' },
  { icon: '🧠', texto: 'Considerando el contexto…' },
  { icon: '✍️', texto: 'Redactando la lectura orientativa…' },
];

const AnalyzingProgress = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev < FASES.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const fase = FASES[i];

  return (
    <div className="analyzing-box">
      <div className="analyzing-spinner"></div>

      <div className="analyzing-current" key={i}>
        <span className="analyzing-icon">{fase.icon}</span>
        <span className="analyzing-text">{fase.texto}</span>
      </div>

      <div className="analyzing-steps">
        {FASES.map((_, idx) => (
          <span key={idx} className={`as-dot ${idx <= i ? 'on' : ''} ${idx === i ? 'active' : ''}`}></span>
        ))}
      </div>

      <div className="analyzing-note">Esto puede tardar unos minutos. No cierres esta ventana.</div>
    </div>
  );
};

export default AnalyzingProgress;
