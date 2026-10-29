import { useState, useEffect } from 'react';
import { X, ZoomIn, RefreshCw, FileDown, Undo2, ImageOff } from 'lucide-react';
import './AnalysisDetailModal.css';
import { emotionVisual, intensityInfo, formatFechaHora } from '../../utils/emociones';
import { api } from '../../api';
import AnalyzingProgress from '../analyzer/AnalyzingProgress';
import ExportPdfModal from './ExportPdfModal';
import { useBloquearScroll } from '../../hooks/useBloquearScroll';
import { puedePdf } from '../../utils/permisos';
import { API_URL } from '../../config';

const AnalysisDetailModal = ({ analisis, onClose, onActualizado, onDesasignado }) => {
  const [zoom, setZoom] = useState(false);
  const [exportar, setExportar] = useState(false);
  const [imgUrl, setImgUrl] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [resultadoLocal, setResultadoLocal] = useState(null);
  const [yaReanalizado, setYaReanalizado] = useState(false);
  const [reanalizando, setReanalizando] = useState(false);
  const [desasignando, setDesasignando] = useState(false);

  const tieneImagen = !!analisis?.ruta_imagen;
  const analisisId = analisis?._id;

  // Carga la imagen protegida con el token (un solo fetch, reusado en el detalle y el zoom).
  useEffect(() => {
    let cancelado = false;
    let objectUrl;
    const cargar = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/analisis/${analisisId}/imagen`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelado) return;
        if (!res.ok) { setImgError(true); return; }
        const blob = await res.blob();
        if (cancelado) return;
        objectUrl = URL.createObjectURL(blob);
        setImgUrl(objectUrl);
      } catch {
        if (!cancelado) setImgError(true);
      }
    };
    if (analisisId && tieneImagen) cargar();
    return () => { cancelado = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [analisisId, tieneImagen]);

  useBloquearScroll(!!analisis);

  if (!analisis) return null;

  const r = resultadoLocal || analisis.resultado_ia || {};
  const visual = emotionVisual(r.emocion_predominante || '');
  const inten = intensityInfo(r.intensidad || '');
  const rasgos = Array.isArray(r.rasgos_observados) ? r.rasgos_observados.filter(Boolean) : [];
  const lectura = r.lectura_orientativa || r.analisis_completo || 'Sin lectura disponible para este análisis.';

  const sinContexto = !yaReanalizado && analisis.analizado_sin_contexto;
  const puedeReanalizar = sinContexto && !analisis.independiente;

  const reanalizar = async () => {
    setReanalizando(true);
    try {
      const data = await api.reanalizar(analisis._id);
      setResultadoLocal(data.analisis);
      setYaReanalizado(true);
      if (onActualizado) onActualizado(analisis._id, data.analisis);
    } catch (err) {
      alert(err.message);
    } finally {
      setReanalizando(false);
    }
  };

  const desasignar = async () => {
    setDesasignando(true);
    try {
      await api.desasignarAnalisis(analisis._id);
      if (onDesasignado) onDesasignado(analisis._id);
      onClose();
    } catch (err) {
      alert(err.message);
      setDesasignando(false);
    }
  };

  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-card" onClick={(e) => e.stopPropagation()}>
        <button className="adm-close" onClick={onClose} title="Cerrar"><X size={20} /></button>

        <div className="adm-head">
          <div className="adm-date">{formatFechaHora(analisis.fecha)}</div>
          <div className="adm-emotion-row">
            <span className="adm-chip" style={{ background: visual.bg, color: visual.color }}><visual.Icono size={15} /> {r.emocion_predominante || 'Sin emoción'}</span>
            <span className="adm-intensity" style={{ color: inten.color }}>Intensidad {inten.label}</span>
          </div>
          {puedePdf() && (
            <button className="adm-export" onClick={() => setExportar(true)}>
              <FileDown size={15} /> Exportar PDF
            </button>
          )}
        </div>

        {sinContexto && (
          <div className="adm-sincontexto">
            <span className="adm-badge-sc">Analizado sin contexto</span>
            {puedeReanalizar ? (
              <button className="adm-reanalizar" onClick={reanalizar} disabled={reanalizando}>
                <RefreshCw size={14} /> Reanalizar con contexto
              </button>
            ) : (
              <span className="adm-sc-hint">Asígnalo a un niño para reanalizar con su contexto.</span>
            )}
            {!analisis.independiente && (
              <button className="adm-desasignar" onClick={desasignar} disabled={desasignando}>
                <Undo2 size={14} /> {desasignando ? 'Desasignando…' : 'Desasignar'}
              </button>
            )}
          </div>
        )}

        {reanalizando && <AnalyzingProgress />}

        {imgUrl && (
          <div className="adm-image-wrap" onClick={() => setZoom(true)} title="Ampliar dibujo">
            <img src={imgUrl} alt="Dibujo analizado" className="adm-image" />
            <div className="adm-zoom-hint"><ZoomIn size={14} /> Ampliar</div>
          </div>
        )}
        {!imgUrl && tieneImagen && imgError && (
          <div className="adm-image-missing">
            <ImageOff size={22} />
            <span>La imagen de este dibujo no está disponible en este servidor.</span>
          </div>
        )}

        <div className="adm-body">
          {rasgos.length > 0 && (
            <section className="adm-section">
              <h4 className="adm-title">Rasgos observados</h4>
              <ul className="adm-list">
                {rasgos.map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </section>
          )}
          {r.interpretacion && (
            <section className="adm-section">
              <h4 className="adm-title">Interpretación</h4>
              <p className="adm-text">{r.interpretacion}</p>
            </section>
          )}
          <section className="adm-section">
            <h4 className="adm-title">Lectura orientativa</h4>
            <p className="adm-text">{lectura}</p>
          </section>
        </div>
      </div>

      {zoom && imgUrl && (
        <div className="adm-lightbox" onClick={(e) => { e.stopPropagation(); setZoom(false); }} title="Cerrar">
          <img src={imgUrl} alt="Dibujo ampliado" />
        </div>
      )}

      {exportar && (
        <ExportPdfModal analisis={analisis} imgUrl={imgUrl} onClose={() => setExportar(false)} />
      )}
    </div>
  );
};

export default AnalysisDetailModal;
