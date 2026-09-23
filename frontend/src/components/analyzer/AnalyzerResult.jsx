import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AnalyzerResult.css';

const AnalyzerResult = ({ analysisResult, STYLES, resetAll }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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

      <div className="analysis-card">
        <div className="analysis-card-top">
          <div className="analysis-icon">
            <Sparkles size={20} />
          </div>
          <div className="analysis-card-title">Análisis emocional completo</div>
        </div>
        <div className="analysis-body">
          {analysisResult.jsonObj && analysisResult.jsonObj.analisis_completo ? (
            <div className="structured-analysis">
              <div className="sa-section highlight">
                <h4 className="sa-title">Análisis Psicológico Detallado</h4>
                <p className="sa-text">{analysisResult.jsonObj.analisis_completo}</p>
              </div>
            </div>
          ) : (
            analysisResult.cleanText
          )}
        </div>
      </div>

      <details>
        <summary>
          <RefreshCw size={16} /> Ver respuesta completa del modelo
        </summary>
        <div className="raw-content">{analysisResult.rawText}</div>
      </details>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="btn-new" onClick={resetAll} style={{ flex: 1 }}>
          <RefreshCw size={16} style={{marginRight: '4px'}}/>
          Analizar otro dibujo
        </button>

        {user.rol === 'padre' && (
          <button className="btn-new" onClick={() => navigate('/dashboard')} style={{ flex: 1, backgroundColor: '#4f46e5', color: 'white' }}>
            Ir al Dashboard
          </button>
        )}

        {(user.rol === 'psicologo' || user.rol === 'profesor') && (
          <button className="btn-new" onClick={() => navigate('/historial')} style={{ flex: 1, backgroundColor: '#4f46e5', color: 'white' }}>
            Ver Historial
          </button>
        )}

        {!user.rol && (
          <button className="btn-new" onClick={() => alert("Tu usuario no tiene rol. Cierra sesión, reinicia el backend y vuelve a entrar.")} style={{ flex: 1, backgroundColor: '#ef4444', color: 'white' }}>
            ⚠️ Rol no detectado
          </button>
        )}
      </div>

    </div>
  );
};

export default AnalyzerResult;
