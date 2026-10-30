import { useState } from 'react';
import { ArrowRight, Pencil } from 'lucide-react';
import '../common/ContextoNino.css';
import './AnalyzerContext.css';
import { textoEdad } from '../../utils/emociones';

const AnalyzerContext = ({ formData, handleInputChange, handleRadioChange, onContinuar, ninoConocido }) => {
  // Niño ya conocido: sus datos básicos se muestran resumidos y se pueden editar.
  const [editarBasicos, setEditarBasicos] = useState(false);
  return (
    <div id="screen-1" className="screen">
      {ninoConocido && !editarBasicos ? (
        <div className="card nino-conocido-card">
          <div className="card-header">
            <div className="card-icon">
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="9" cy="6" r="3.5" />
                <path d="M2 16c0-3.3 3.1-6 7-6s7 2.7 7 6" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="card-title">{formData.nombre || 'Niño sin nombre'}</div>
              <div className="card-subtitle">
                {[textoEdad(formData) || null, formData.genero].filter(Boolean).join(' · ') || 'Sin fecha de nacimiento ni género'}
              </div>
            </div>
            <button type="button" className="ctx-editar" onClick={() => setEditarBasicos(true)}>
              <Pencil size={14} /> Editar datos
            </button>
          </div>
          <div className="card-body">
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--muted, #6b7280)' }}>
              Se reutiliza el contexto de este niño (abajo). Revísalo, actualiza lo que haya cambiado y sigue con el dibujo.
            </p>
          </div>
        </div>
      ) : (
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
                <input type="text" id="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Sofía" readOnly={ninoConocido} title={ninoConocido ? 'El nombre identifica al niño en el historial' : undefined} />
              </div>
              <div className="field">
                <label>Fecha de nacimiento</label>
                <input type="date" id="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} />
                {textoEdad(formData) && <span className="field-hint">{textoEdad(formData)}</span>}
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
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{background: 'rgba(52, 211, 153, 0.15)', color: '#10b981'}}>
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
          <div className="card-icon" style={{background: 'rgba(251, 146, 60, 0.15)', color: '#f97316'}}>
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

      <button className="btn-next" onClick={onContinuar} style={{width: '100%'}}>
        Continuar al dibujo
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default AnalyzerContext;
