import React from 'react';
import { ArrowRight } from 'lucide-react';
import './AnalyzerContext.css';

const AnalyzerContext = ({ formData, handleInputChange, handleRadioChange, setStep }) => {
  return (
    <div id="screen-1" className="screen">
      <div className="card">
        <div className="card-header">
          <div className="card-icon">
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="9" cy="6" r="3.5" />
              <path d="M2 16c0-3.3 3.1-6 7-6s7 2.7 7 6" />
            </svg>
          </div>
          <div>
            <div className="card-title">Información básica</div>
            <div className="card-subtitle">Datos generales del niño</div>
          </div>
        </div>
        <div className="card-body">
          <div className="form-grid cols-3">
            <div className="field">
              <label>Nombre <span className="optional">Opcional</span></label>
              <input type="text" id="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Sofía" />
            </div>
            <div className="field">
              <label>Edad</label>
              <input type="number" id="edad" value={formData.edad} onChange={handleInputChange} placeholder="Ej: 7" min="2" max="17" />
            </div>
            <div className="field">
              <label>Género</label>
              <select id="genero" value={formData.genero} onChange={handleInputChange}>
                <option value="">Seleccionar</option>
                <option value="niña">Niña</option>
                <option value="niño">Niño</option>
                <option value="no especificado">Prefiero no decirlo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{background: 'rgba(52, 211, 153, 0.15)', color: '#ffffff'}}>
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="9" cy="9" r="7" />
              <path d="M9 6v4l2.5 2.5" />
            </svg>
          </div>
          <div>
            <div className="card-title">Situación actual</div>
            <div className="card-subtitle">Contexto del entorno familiar o escolar</div>
          </div>
        </div>
        <div className="card-body">
          <div className="field">
            <label>¿Está pasando por algo en casa o el colegio? <span className="optional">Opcional</span></label>
            <textarea id="situacion_actual" value={formData.situacion_actual} onChange={handleInputChange} placeholder="Ej: Los padres se separaron hace 2 meses, cambió de colegio recientemente..."></textarea>
          </div>
          <div className="field">
            <label>Comportamiento reciente</label>
            <div className="radio-group">
              {['normal', 'retraído', 'agresivo', 'ansioso', 'triste', 'hiperactivo'].map(opt => (
                <label key={opt} className={`radio-opt ${formData.comportamiento === opt ? 'selected' : ''}`}>
                  <input type="radio" name="comportamiento" checked={formData.comportamiento === opt} onChange={() => handleRadioChange('comportamiento', opt)} />
                  <span className="radio-dot"></span>{opt.charAt(0).toUpperCase() + opt.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Diagnóstico previo <span className="optional">Opcional</span></label>
            <input type="text" id="diagnostico_previo" value={formData.diagnostico_previo} onChange={handleInputChange} placeholder="Ej: TDAH, ansiedad, TEA... o ninguno" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{background: 'rgba(251, 146, 60, 0.15)', color: '#ffffff'}}>
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 15l3-1 9-9-2-2-9 9-1 3z" />
              <path d="M12 4l2 2" />
            </svg>
          </div>
          <div>
            <div className="card-title">Contexto del dibujo</div>
            <div className="card-subtitle">Cómo y cuándo se realizó</div>
          </div>
        </div>
        <div className="card-body">
          <div className="field">
            <label>¿El dibujo fue espontáneo o se le pidió?</label>
            <div className="radio-group">
              {['espontáneo', 'se le pidió'].map(opt => (
                <label key={opt} className={`radio-opt ${formData.dibujo_espontaneo === opt ? 'selected' : ''}`}>
                  <input type="radio" name="dibujo_espontaneo" checked={formData.dibujo_espontaneo === opt} onChange={() => handleRadioChange('dibujo_espontaneo', opt)} />
                  <span className="radio-dot"></span>{opt.charAt(0).toUpperCase() + opt.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <label>¿Comentó algo mientras dibujaba? <span className="optional">Opcional</span></label>
            <textarea id="comento_mientras" value={formData.comento_mientras} onChange={handleInputChange} placeholder="Ej: Dijo 'esta soy yo cuando estoy sola', o estuvo en silencio todo el tiempo..."></textarea>
          </div>
          <div className="field">
            <label>Tiempo aproximado que tardó <span className="optional">Opcional</span></label>
            <div className="radio-group">
              {['menos de 5 minutos', '5 a 15 minutos', 'más de 15 minutos'].map(opt => (
                <label key={opt} className={`radio-opt ${formData.tiempo_dibujo === opt ? 'selected' : ''}`}>
                  <input type="radio" name="tiempo_dibujo" checked={formData.tiempo_dibujo === opt} onChange={() => handleRadioChange('tiempo_dibujo', opt)} />
                  <span className="radio-dot"></span>{opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button className="btn-next" onClick={() => setStep(2)} style={{width: '100%'}}>
        Continuar al dibujo
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default AnalyzerContext;
