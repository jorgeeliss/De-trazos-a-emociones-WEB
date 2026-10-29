import { useRef, useEffect } from 'react';
import './Analyzer.css';
import Sidebar from '../components/layout/Sidebar';
import AnalyzerContext from '../components/analyzer/AnalyzerContext';
import AnalyzerUpload from '../components/analyzer/AnalyzerUpload';
import AnalyzerResult from '../components/analyzer/AnalyzerResult';
import AnalyzerSavePanel from '../components/analyzer/AnalyzerSavePanel';
import { useAnalisisSesion } from '../context/AnalisisSesionContext';
import { useTour } from '../context/TourContext';
import Logo from '../components/common/Logo';

const STYLES = [
  { bg: '#e0f2fe', color: '#1e40af', dot: '#93c5fd' },
  { bg: '#dbeafe', color: '#1e3a8a', dot: '#2563eb' },
  { bg: '#fffbdf', color: '#334443', dot: '#e6d78a' },
  { bg: '#e0f2fe', color: '#1e40af', dot: '#7dd3fc' },
  { bg: '#eff6ff', color: '#2563eb', dot: '#93c5fd' },
  { bg: '#dbeafe', color: '#1e40af', dot: '#2563eb' },
];

const Analyzer = () => {
  const fileInputRef = useRef(null);

  const { start: iniciarTour } = useTour();

  const {
    modo, ninoConocido, step, setStep, formData,
    selectedFile, previewUrl, isAnalyzing, error, analysisResult,
    pendienteGuardar, guardadoEstado, guardando, ninosExistentes, analisisInicio,
    handleInputChange, handleRadioChange, handleFileChange, handleDrop, clearFile,
    cargarNinos, cambiarModo, analizar, cancelarAnalisis, nuevaSesion,
    guardarIndependiente, asignarANino, noGuardar, resetAll, setNotificacion,
  } = useAnalisisSesion();

  // Al entrar al Analyzer: refresca la lista de niños, limpia el aviso pendiente
  // y lanza el recorrido guiado la primera vez (o si se pidió desde Configuración).
  useEffect(() => {
    const t = setTimeout(() => {
      cargarNinos();
      setNotificacion(null);
      try {
        if (localStorage.getItem('tutorial_forzar') === '1' || localStorage.getItem('tutorial_visto') !== '1') {
          iniciarTour();
        }
      } catch { /* ignore */ }
    }, 0);
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

        <header className="hero">
          <div className="hero-left">
            <h1 className="hero-title">De trazos a <span>emociones</span></h1>
          </div>
          <div className="hero-logo" aria-hidden="true">
            <Logo size={82} />
          </div>
        </header>

        {ninoConocido && (
          <div className="nino-activo-bar">
            <div className="nino-activo-info">
              Analizando a <strong>{formData.nombre}</strong>
              <span>Puedes seguir con el mismo niño o empezar uno nuevo.</span>
            </div>
            <div className="nino-activo-acts">
              <button className="nino-activo-btn" onClick={nuevaSesion}>Analizar otro niño</button>
              <button className="nino-activo-btn ghost" onClick={() => cambiarModo('solo')}>Solo dibujo</button>
            </div>
          </div>
        )}

        {!ninoConocido && (
          <div className="modo-selector" data-tour="modo">
            <button className={`modo-opt ${modo === 'contexto' ? 'active' : ''}`} onClick={() => cambiarModo('contexto')}>
              Con contexto del niño
            </button>
            <button className={`modo-opt ${modo === 'solo' ? 'active' : ''}`} onClick={() => cambiarModo('solo')}>
              Solo dibujo
            </button>
          </div>
        )}

        <div className="steps" data-tour="pasos">
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
            analisisInicio={analisisInicio}
            analyze={analizar}
            onCancelar={cancelarAnalisis}
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
