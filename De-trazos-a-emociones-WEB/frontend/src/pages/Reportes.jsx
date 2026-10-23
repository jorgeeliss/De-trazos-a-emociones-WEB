import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import { exportarReporte } from '../utils/exportarPdf';
import { emocionPredominante, emotionVisual } from '../utils/emociones';
import BrandHeader from '../components/common/BrandHeader';
import './Reportes.css';

const Reportes = () => {
  const navigate = useNavigate();
  const [ninos, setNinos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    let activo = true;
    const t = setTimeout(async () => {
      try {
        const data = await api.getAnalisis();
        const map = new Map();
        data
          .filter((a) => !a.independiente)
          .forEach((a) => {
            const nombre = (a.contexto_nino?.nombre || '').trim() || 'Sin nombre';
            if (!map.has(nombre)) {
              map.set(nombre, { nombre, contexto: a.contexto_nino || {}, analisis: [] });
            }
            map.get(nombre).analisis.push(a);
          });
        if (activo) setNinos([...map.values()]);
      } catch {
        /* ignore */
      } finally {
        if (activo) setCargando(false);
      }
    }, 0);
    return () => {
      activo = false;
      clearTimeout(t);
    };
  }, []);

  const descargar = async () => {
    if (!ninos.length || generando) return;
    setGenerando(true);
    try {
      await exportarReporte(ninos);
    } catch (e) {
      alert(e.message);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="rep-page">
      <div className="rep-container">
        <BrandHeader />

        <button className="rep-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Volver
        </button>

        <h1 className="rep-title">Reportes</h1>
        <p className="rep-sub">
          Genera un informe consolidado en PDF con todos tus niños: su emoción
          predominante, la situación actual y la distribución de sus análisis.
        </p>

        {cargando ? (
          <div className="rep-empty">Cargando…</div>
        ) : ninos.length === 0 ? (
          <div className="rep-empty">
            Aún no tienes niños con análisis. Realiza un análisis con contexto para poder generar un reporte.
          </div>
        ) : (
          <>
            <div className="rep-list">
              {ninos.map((n) => {
                const emo = emocionPredominante(n.analisis);
                const v = emotionVisual(emo || '');
                return (
                  <div className="rep-card" key={n.nombre}>
                    <div className="rep-card-emoji" style={{ background: v.bg }}>
                      {v.emoji}
                    </div>
                    <div className="rep-card-info">
                      <div className="rep-card-name">{n.nombre}</div>
                      <div className="rep-card-meta">
                        {n.analisis.length} análisis · {emo || 'sin datos'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="rep-download" onClick={descargar} disabled={generando}>
              <FileDown size={18} /> {generando ? 'Generando PDF…' : 'Descargar reporte PDF'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Reportes;
