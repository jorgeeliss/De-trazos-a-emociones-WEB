import React from 'react';
import { Upload, X, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import './AnalyzerUpload.css';

const AnalyzerUpload = ({ 
  step, setStep, selectedFile, previewUrl, 
  handleDrop, handleFileChange, clearFile, fileInputRef, 
  error, isAnalyzing, analyze 
}) => {
  return (
    <div id="screen-2" className="screen">
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{background: 'rgba(167, 139, 250, 0.15)', color: '#ffffff'}}>
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="2" width="14" height="14" rx="3" />
              <circle cx="6.5" cy="6.5" r="1.5" />
              <path d="M2 12l4-4 3 3 3-3.5 4 4.5" />
            </svg>
          </div>
          <div>
            <div className="card-title">Sube el dibujo</div>
            <div className="card-subtitle">Formatos admitidos: PNG, JPG, WEBP</div>
          </div>
        </div>
        <div className="card-body">
          {!previewUrl ? (
            <div 
              className="upload-area"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('drag')}
              onDrop={handleDrop}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
              <div className="upload-icon">
                <Upload size={28} />
              </div>
              <p className="upload-title">Arrastra el dibujo aquí</p>
              <p className="upload-hint">o haz clic para seleccionar un archivo</p>
            </div>
          ) : (
            <div className="preview-img-wrap">
              <img src={previewUrl} alt="Vista previa" />
              <div className="preview-toolbar">
                <span className="preview-name">{selectedFile?.name}</span>
                <button className="btn-remove" onClick={clearFile}>
                  <X size={14} style={{marginRight: '4px', verticalAlign: 'middle'}}/>
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-box active">
          <div className="error-icon">
            <AlertCircle size={14} />
          </div>
          <div>
            <strong>Error al analizar</strong><br/>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="nav-row">
        <button className="btn-back" onClick={() => setStep(1)}>
          <ArrowLeft size={18} style={{marginRight: '6px'}}/>
          Volver
        </button>
        <button className="btn-analyze" disabled={!selectedFile || isAnalyzing} onClick={analyze}>
          {isAnalyzing ? (
            <><div className="spinner"></div> Analizando...</>
          ) : (
            <><Sparkles size={18} /> Analizar emociones</>
          )}
        </button>
      </div>
    </div>
  );
};

export default AnalyzerUpload;
