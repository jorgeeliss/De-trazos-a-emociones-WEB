import React, { useState, useRef } from 'react';
import { Upload, X, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Sparkles, CheckCircle, Activity, HeartPulse } from 'lucide-react';
import './Analyzer.css';
import AnalyzerContext from '../components/analyzer/AnalyzerContext';
import AnalyzerUpload from '../components/analyzer/AnalyzerUpload';
import AnalyzerResult from '../components/analyzer/AnalyzerResult';

const Analyzer = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    genero: '',
    situacion_actual: '',
    diagnostico_previo: '',
    comportamiento: '',
    dibujo_espontaneo: '',
    comento_mientras: '',
    tiempo_dibujo: ''
  });

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

    const apiUrl = ''; // Proxy handles /analizar-imagen directly

    const fd = new FormData();
    fd.append('imagen', selectedFile);

    Object.entries(formData).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });

    try {
      // In development mode, proxy will handle this
      const resp = await fetch(`${apiUrl}/analizar-imagen`, { method: 'POST', body: fd });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error del servidor');
      if (!data.analisis) throw new Error('La API no devolvió un campo "analisis"');
      
      processResult(data.analisis);
      setStep(3);
    } catch (err) {
      setError(err.message + '. Verifica que el backend esté corriendo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const KEYWORDS = ['alegría', 'tristeza', 'miedo', 'enojo', 'calma', 'ansiedad', 'inseguridad', 'energía', 'amor', 'felicidad', 'ira', 'frustración', 'estrés', 'tranquilidad', 'entusiasmo', 'soledad', 'angustia', 'nerviosismo', 'euforia', 'melancolía'];
  
  const processResult = (raw) => {
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
      intensityLabel: { low: 'Baja', medio: 'Media', high: 'Alta' }[intensity],
      cleanText: clean,
      rawText: raw
    });
  };

  const resetAll = () => {
    clearFile();
    setFormData({
      nombre: '', edad: '', genero: '', situacion_actual: '', diagnostico_previo: '',
      comportamiento: '', dibujo_espontaneo: '', comento_mientras: '', tiempo_dibujo: ''
    });
    setAnalysisResult(null);
    setStep(1);
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
      <div className="bg-dots"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
      <div className="container">
        
        <header className="header">
          <div className="badge"><span className="badge-dot"></span> Psicología infantil · IA</div>
          <h1>De trazos<br/>a <em>emociones</em></h1>
          <p className="header-sub">Completa el contexto del niño y sube su dibujo para obtener un análisis emocional personalizado y profundo.</p>
        </header>

        <div className="steps">
          <div className={`step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`} onClick={() => step > 1 && setStep(1)}>
            <div className="step-num">1</div> Contexto
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`} onClick={() => (step > 2 || (step === 1 && formData.edad)) && setStep(2)}>
            <div className="step-num">2</div> Dibujo
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step === 3 ? 'active' : ''}`}>
            <div className="step-num">3</div> Análisis
          </div>
        </div>

        {/* PASO 1: CONTEXTO */}
        {step === 1 && (
          <AnalyzerContext 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleRadioChange={handleRadioChange} 
            setStep={setStep} 
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
          />
        )}

        {/* PASO 3: RESULTADO */}
        {step === 3 && analysisResult && (
          <AnalyzerResult 
            analysisResult={analysisResult} 
            STYLES={STYLES} 
            resetAll={resetAll} 
          />
        )}

        <div className="footer">De trazos a emociones · No reemplaza diagnóstico clínico</div>
      </div>
    </div>
  );
};

export default Analyzer;
