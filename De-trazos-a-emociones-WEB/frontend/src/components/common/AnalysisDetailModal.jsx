import { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
import './AnalysisDetailModal.css';
import { emotionVisual, intensityInfo, formatFecha } from '../../utils/emociones';

const API_URL = 'http://localhost:3000';

const AnalysisDetailModal = ({ analisis, onClose }) => {
  const [zoom, setZoom] = useState(false);
  const [imgUrl, setImgUrl] = useState(null);

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
        if (!res.ok || cancelado) return;
        const blob = await res.blob();
        if (cancelado) return;
        objectUrl = URL.createObjectURL(blob);
        setImgUrl(objectUrl);
      } catch {
        /* sin imagen */
      }
    };
    if (analisisId && tieneImagen) cargar();
    return () => { cancelado = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [analisisId, tieneImagen]);

  if (!analisis) return null;

  const r = analisis.resultado_ia || {};
  const visual = emotionVisual(r.emocion_predominante || '');
  const inten = intensityInfo(r.intensidad || '');
  const rasgos = Array.isArray(r.rasgos_observados) ? r.rasgos_observados.filter(Boolean) : [];
  const lectura = r.lectura_orientativa || r.analisis_completo || 'Sin lectura disponible para este análisis.';

  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-card" onClick={(e) => e.stopPropagation()}>
        <button className="adm-close" onClick={onClose} title="Cerrar"><X size={20} /></button>

        <div className="adm-head">
          <div className="adm-date">{formatFecha(analisis.fecha)}</div>
          <div className="adm-emotion-row">
            <span className="adm-chip" style={{ background: visual.bg, color: visual.color }}>{visual.emoji} {r.emocion_predominante || 'Sin emoción'}</span>
            <span className="adm-intensity" style={{ color: inten.color }}>Intensidad {inten.label}</span>
          </div>
        </div>

        {imgUrl && (
          <div className="adm-image-wrap" onClick={() => setZoom(true)} title="Ampliar dibujo">
            <img src={imgUrl} alt="Dibujo analizado" className="adm-image" />
            <div className="adm-zoom-hint"><ZoomIn size={14} /> Ampliar</div>
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
    </div>
  );
};

export default AnalysisDetailModal;
