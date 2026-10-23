import { useRef, useEffect } from 'react';
import './Analyzer.css';
import Sidebar from '../components/layout/Sidebar';
import AnalyzerContext from '../components/analyzer/AnalyzerContext';
import AnalyzerUpload from '../components/analyzer/AnalyzerUpload';
import AnalyzerResult from '../components/analyzer/AnalyzerResult';
import AnalyzerSavePanel from '../components/analyzer/AnalyzerSavePanel';
import { useAnalisisSesion } from '../context/AnalisisSesionContext';

const STYLES = [
  { bg: '#e0f2fe', color: '#1e40af', dot: '#93c5fd' },
  { bg: '#dbeafe', color: '#1e3a8a', dot: '#2563eb' },
  { bg: '#fffbdf', color: '#334443', dot: '#e6d78a' },
  { bg: '#e0f2fe', color: '#1e40af', dot: '#7dd3fc' },
  { bg: '#eff6ff', color: '#2563eb', dot: '#93c5fd' },
  { bg: '#dbeafe', color: '#1e40af', dot: '#2563eb' },
];

const Analyzer = () => {
  const nombreUsuario = JSON.parse(localStorage.getItem('user') || '{}').nombre || '';
  const fileInputRef = useRef(null);

  const {
    modo, ninoConocido, step, setStep, formData,
    selectedFile, previewUrl, isAnalyzing, error, analysisResult,
    pendienteGuardar, guardadoEstado, guardando, ninosExistentes,
    handleInputChange, handleRadioChange, handleFileChange, handleDrop, clearFile,
    cargarNinos, cambiarModo, analizar,
    guardarIndependiente, asignarANino, noGuardar, resetAll, setNotificacion,
  } = useAnalisisSesion();

  // Al entrar al Analyzer: refresca la lista de niños y limpia el aviso pendiente.
  useEffect(() => {
    const t = setTimeout(() => { cargarNinos(); setNotificacion(null); }, 0);
    return () => clearTimeout(t);
  }, []);

  const onClear = () => {
    clearFile();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="analyzer-wrapper">
      <Sidebar active="app" />
      <div className="bg-dots"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
      <div className="container">

        <header className="header">
          <div className="badge"><span className="badge-dot"></span> Psicología infantil · IA</div>
          {nombreUsuario && !ninoConocido && (
            <div className="welcome-user">Bienvenido/a, {nombreUsuario}</div>
          )}
          <h1>De trazos<br/>a <em>emociones</em></h1>
          <p className="header-sub">
            {ninoConocido
              ? `Analizando un nuevo dibujo de ${formData.nombre}. Revisa la situación y sube el dibujo.`
              : modo === 'solo'
                ? 'Analiza un dibujo de forma rápida. Al final decides si lo guardas y a quién.'
                : 'Completa el contexto del niño y sube su dibujo para obtener un análisis emocional personalizado y profundo.'}
          </p>
        </header>

        {!ninoConocido && (
          <div className="modo-selector">
            <button className={`modo-opt ${modo === 'contexto' ? 'active' : ''}`} onClick={() => cambiarModo('contexto')}>
              Con contexto del niño
            </button>
            <button className={`modo-opt ${modo === 'solo' ? 'active' : ''}`} onClick={() => cambiarModo('solo')}>
              Solo dibujo
            </button>
          </div>
        )}

        <div className="steps">
          {modo === 'contexto' && (
            <>
              <div className={`step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`} onClick={() => step > 1 && setStep(1)}>
                <div className="step-num">1</div> Contexto
              </div>
              <div className="step-divider"></div>
            </>
          )}
          <div className={`step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`} onClick={() => (step > 2 || (step === 1 && formData.fecha_nacimiento)) && setStep(2)}>
            <div className="step-num">{modo === 'contexto' ? '2' : '1'}</div> Dibujo
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step === 3 ? 'active' : ''}`}>
            <div className="step-num">{modo === 'contexto' ? '3' : '2'}</div> Análisis
          </div>
        </div>

        {step === 1 && (
          <AnalyzerContext
            formData={formData}
            handleInputChange={handleInputChange}
            handleRadioChange={handleRadioChange}
            setStep={setStep}
            ninoConocido={ninoConocido}
          />
        )}

        {step === 2 && (
          <AnalyzerUpload
            setStep={setStep}
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            handleDrop={handleDrop}
            handleFileChange={handleFileChange}
            clearFile={onClear}
            fileInputRef={fileInputRef}
            error={error}
            isAnalyzing={isAnalyzing}
            analyze={analizar}
            mostrarVolver={modo === 'contexto'}
          />
        )}

        {step === 3 && analysisResult && (
          <>
            {(pendienteGuardar || guardadoEstado) && (
              <AnalyzerSavePanel
                ninos={ninosExistentes}
                estado={guardadoEstado}
                ocupado={guardando}
                onGuardarIndependiente={guardarIndependiente}
                onAsignar={asignarANino}
                onNoGuardar={noGuardar}
              />
            )}
            <AnalyzerResult
              analysisResult={analysisResult}
              STYLES={STYLES}
              resetAll={resetAll}
              previewUrl={previewUrl}
            />
          </>
        )}

        <div className="footer">De trazos a emociones · No reemplaza diagnóstico clínico</div>
      </div>
    </div>
  );
};

export default Analyzer;
