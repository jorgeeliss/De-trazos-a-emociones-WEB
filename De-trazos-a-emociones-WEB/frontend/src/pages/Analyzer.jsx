import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Analyzer.css';
import Sidebar from '../components/layout/Sidebar';
import AnalyzerContext from '../components/analyzer/AnalyzerContext';
import AnalyzerUpload from '../components/analyzer/AnalyzerUpload';
import AnalyzerResult from '../components/analyzer/AnalyzerResult';
import AnalyzerSavePanel from '../components/analyzer/AnalyzerSavePanel';
import { api } from '../api';

const Analyzer = () => {
  const location = useLocation();
  // Si se llega desde un niño ya existente, su contexto viene por el estado de
  // navegación: se precargan los datos y solo se pide el contexto del dibujo.
  const contextoInicial = location.state?.contexto;
  const ninoConocido = !!(contextoInicial && contextoInicial.nombre);

  const nombreUsuario = JSON.parse(localStorage.getItem('user') || '{}').nombre || '';

  // Modo: "contexto" (con datos del niño) o "solo" (solo dibujo, se decide guardar después).
  const [modo, setModo] = useState('contexto');
  const [pendienteGuardar, setPendienteGuardar] = useState(null);
  const [guardadoEstado, setGuardadoEstado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [ninosExistentes, setNinosExistentes] = useState([]);

  // Lista de niños existentes (para "asignar a un niño" en el modo solo dibujo).
  useEffect(() => {
    let cancel = false;
    api.getAnalisis().then((data) => {
      if (cancel) return;
      const map = new Map();
      data.filter((a) => !a.independiente).forEach((a) => {
        const nombre = (a.contexto_nino?.nombre || '').trim();
        if (nombre && !map.has(nombre)) map.set(nombre, a.contexto_nino);
      });
      setNinosExistentes([...map.entries()].map(([nombre, ctx]) => ({ nombre, contexto: ctx })));
    }).catch(() => {});
    return () => { cancel = true; };
  }, []);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => ({
    nombre: contextoInicial?.nombre || '',
    edad: contextoInicial?.edad || '',
    genero: contextoInicial?.genero || '',
    situacion_actual: contextoInicial?.situacion_actual || '',
    diagnostico_previo: contextoInicial?.diagnostico_previo || '',
    comportamiento: contextoInicial?.comportamiento || '',
    dibujo_espontaneo: '',
    comento_mientras: '',
    tiempo_dibujo: ''
  }));

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRadioChange = (group, value) => {
    setFormData(prev => ({ ...prev, [group]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyze = async () => {
    if (!selectedFile) return;
    setError(null);
    setIsAnalyzing(true);

  const fd = new FormData();

  fd.append('imagen', selectedFile);

  if (modo === 'solo') {
    // Solo dibujo: sin contexto y sin guardar de una.
    fd.append('persistir', 'false');
  } else {
    Object.entries(formData).forEach(([k, v]) => {
      if (v) {
        fd.append(k, v);
      }
    });
  }

  try {
    const data = await api.analizarImagen(fd);

    if (!data.analisis) {
      throw new Error('La API no devolvió un campo "analisis"');
    }

    processResult(data.analisis, data.aviso);
    if (modo === 'solo') {
      setPendienteGuardar({ imagen: data.imagen, analisis: data.analisis });
      setGuardadoEstado(null);
    }
    setStep(3);

  } catch (err) {
    setError(err.message + '. Verifica que el backend esté corriendo.');
  } finally {
    setIsAnalyzing(false);
  }
  };

  const guardarIndependiente = async () => {
    setGuardando(true);
    try {
      await api.guardarAnalisis({ analisis: pendienteGuardar.analisis, imagen: pendienteGuardar.imagen, independiente: true });
      setGuardadoEstado('independiente');
      setPendienteGuardar(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const asignarANino = async (nombre) => {
    const nino = ninosExistentes.find((n) => n.nombre === nombre);
    const ctx = nino?.contexto || {};
    setGuardando(true);
    try {
      await api.guardarAnalisis({
        analisis: pendienteGuardar.analisis,
        imagen: pendienteGuardar.imagen,
        independiente: false,
        contexto_nino: { nombre, edad: ctx.edad, genero: ctx.genero }
      });
      setGuardadoEstado('asignado');
      setPendienteGuardar(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const noGuardar = async () => {
    setGuardando(true);
    try {
      await api.descartarAnalisis(pendienteGuardar.imagen);
      setGuardadoEstado('descartado');
      setPendienteGuardar(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarModo = (nuevo) => {
    if (nuevo === modo) return;
    setModo(nuevo);
    clearFile();
    setAnalysisResult(null);
    setPendienteGuardar(null);
    setGuardadoEstado(null);
    setError(null);
    setStep(nuevo === 'solo' ? 2 : 1);
  };

  const KEYWORDS = ['alegría', 'tristeza', 'miedo', 'enojo', 'calma', 'ansiedad', 'inseguridad', 'energía', 'amor', 'felicidad', 'ira', 'frustración', 'estrés', 'tranquilidad', 'entusiasmo', 'soledad', 'angustia', 'nerviosismo', 'euforia', 'melancolía'];
  
  const intensityFromText = (text) => {
    const lower = String(text || '').toLowerCase();
    if (lower.includes('alta') || lower.includes('alto')) return 'high';
    if (lower.includes('baja') || lower.includes('bajo') || lower.includes('leve')) return 'low';
    return 'medio';
  };

  const intensityLabel = (intensity) => ({ low: 'Baja', medio: 'Media', high: 'Alta' }[intensity]);

  const processResult = (raw, aviso) => {
    // Respaldo: si la IA devuelve un string suelto, usamos la lógica por palabras clave.
    if (typeof raw === 'string') {
      const lower = raw.toLowerCase();
      const found = [...new Set(KEYWORDS.filter(k => lower.includes(k)))].slice(0, 6);
      const chips = found.length ? found : ['emoción detectada'];

      let intensity = 'medio';
      if (/intensidad[:\s]*(emocional[:\s]*)?(alta|alto)/i.test(lower) || / alto/.test(lower)) intensity = 'high';
      else if (/intensidad[:\s]*(emocional[:\s]*)?(baja|bajo)/i.test(lower) || / bajo/.test(lower) || / leve/.test(lower)) intensity = 'low';

      const clean = raw.replace(/\*\*/g, '').replace(/#{1,4}\s*/g, '').trim();

      setAnalysisResult({
        chips,
        intensity,
        intensityLabel: intensityLabel(intensity),
        rasgos: [],
        interpretacion: '',
        lectura: clean,
        aviso: aviso || '',
        simulado: false,
        rawText: raw
      });
      return;
    }

    // Formato nuevo: { rasgos_observados, interpretacion, emocion_predominante, intensidad, lectura_orientativa }
    // Compatibilidad con registros viejos: { ..., analisis_completo }.
    const chips = [raw.emocion_predominante || 'emoción detectada'];
    const intensity = intensityFromText(raw.intensidad);
    const rasgos = Array.isArray(raw.rasgos_observados) ? raw.rasgos_observados.filter(Boolean) : [];
    const interpretacion = raw.interpretacion || '';
    const lectura = raw.lectura_orientativa
      || raw.analisis_completo
      || 'El modelo no proporcionó un análisis detallado.';

    setAnalysisResult({
      chips,
      intensity,
      intensityLabel: intensityLabel(intensity),
      rasgos,
      interpretacion,
      lectura,
      aviso: aviso || (raw.parseo_incompleto
        ? 'El modelo no devolvió un JSON completo. Se muestra el texto recuperado; puedes intentar analizar de nuevo.'
        : ''),
      simulado: raw.simulado === true,
      rawText: JSON.stringify(raw, null, 2),
      jsonObj: raw
    });
  };

  const resetAll = () => {
    clearFile();
    setFormData({
      nombre: '', edad: '', genero: '', situacion_actual: '', diagnostico_previo: '',
      comportamiento: '', dibujo_espontaneo: '', comento_mientras: '', tiempo_dibujo: ''
    });
    setAnalysisResult(null);
    setPendienteGuardar(null);
    setGuardadoEstado(null);
    setStep(modo === 'solo' ? 2 : 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const STYLES = [
    { bg: '#e0f2fe', color: '#1e40af', dot: '#93c5fd' },
    { bg: '#dbeafe', color: '#1e3a8a', dot: '#2563eb' },
    { bg: '#fffbdf', color: '#334443', dot: '#e6d78a' },
    { bg: '#e0f2fe', color: '#1e40af', dot: '#7dd3fc' },
    { bg: '#eff6ff', color: '#2563eb', dot: '#93c5fd' },
    { bg: '#dbeafe', color: '#1e40af', dot: '#2563eb' },
  ];

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
          <div className={`step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`} onClick={() => (step > 2 || (step === 1 && formData.edad)) && setStep(2)}>
            <div className="step-num">{modo === 'contexto' ? '2' : '1'}</div> Dibujo
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step === 3 ? 'active' : ''}`}>
            <div className="step-num">{modo === 'contexto' ? '3' : '2'}</div> Análisis
          </div>
        </div>

        {/* PASO 1: CONTEXTO */}
        {step === 1 && (
          <AnalyzerContext
            formData={formData}
            handleInputChange={handleInputChange}
            handleRadioChange={handleRadioChange}
            setStep={setStep}
            ninoConocido={ninoConocido}
          />
        )}

        {/* PASO 2: DIBUJO */}
        {step === 2 && (
          <AnalyzerUpload
            step={step}
            setStep={setStep}
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            handleDrop={handleDrop}
            handleFileChange={handleFileChange}
            clearFile={clearFile}
            fileInputRef={fileInputRef}
            error={error}
            isAnalyzing={isAnalyzing}
            analyze={analyze}
            mostrarVolver={modo === 'contexto'}
          />
        )}

        {/* PASO 3: RESULTADO */}
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
