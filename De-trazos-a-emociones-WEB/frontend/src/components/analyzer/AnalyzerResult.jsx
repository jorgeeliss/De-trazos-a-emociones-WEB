import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import './AnalyzerResult.css';

const AnalyzerResult = ({ analysisResult, STYLES, resetAll }) => {
  return (
    <div id="screen-3" className="screen">
      <div className="section-label">Resultado del análisis</div>
      
      <div className="emotions-grid">
        {analysisResult.chips.map((emotion, i) => {
          const s = STYLES[i % STYLES.length];
          return (
            <div key={i} className="emotion-chip" style={{background: s.bg, color: s.color, animationDelay: `${i * 80}ms`}}>
              <span className="chip-dot" style={{background: s.dot}}></span>
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </div>
          );
        })}
      </div>

      <div className="intensity-card">
        <div className="intensity-label-col">
          <div className="intensity-title">Intensidad emocional</div>
          <div className="intensity-value">{analysisResult.intensityLabel}</div>
        </div>
        <div className="intensity-track">
          <div className={`intensity-fill ${analysisResult.intensity}`} style={{width: analysisResult.intensity === 'high' ? '95%' : analysisResult.intensity === 'low' ? '30%' : '65%'}}></div>
        </div>
      </div>

      {analysisResult.simulado && (
        <div className="analysis-notice simulado">Resultado simulado (modo de prueba)</div>
      )}

      {analysisResult.aviso && (
        <div className="analysis-notice">{analysisResult.aviso}</div>
      )}

      <div className="analysis-card">
        <div className="analysis-card-top">
          <div className="analysis-icon">
            <Sparkles size={20} />
          </div>
          <div className="analysis-card-title">Análisis emocional completo</div>
        </div>
        <div className="analysis-body">
          <div className="structured-analysis">
            {analysisResult.rasgos && analysisResult.rasgos.length > 0 && (
              <div className="sa-section">
                <h4 className="sa-title">Rasgos observados</h4>
                <ul className="sa-list">
                  {analysisResult.rasgos.map((rasgo, i) => (
                    <li key={i}>{rasgo}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.interpretacion && (
              <div className="sa-section">
                <h4 className="sa-title">Interpretación</h4>
                <p className="sa-text">{analysisResult.interpretacion}</p>
              </div>
            )}

            <div className="sa-section highlight">
              <h4 className="sa-title">Lectura orientativa</h4>
              <p className="sa-text">{analysisResult.lectura}</p>
            </div>
          </div>
        </div>
      </div>

      <details>
        <summary>
          <RefreshCw size={16} /> Ver respuesta completa del modelo
        </summary>
        <div className="raw-content">{analysisResult.rawText}</div>
      </details>

      <button className="btn-new" onClick={resetAll}>
        <RefreshCw size={16} style={{marginRight: '4px'}}/>
        Analizar otro dibujo
      </button>
    </div>
  );
};

export default AnalyzerResult;
