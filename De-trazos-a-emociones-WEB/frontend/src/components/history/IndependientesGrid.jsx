import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import './IndependientesGrid.css';
import { api } from '../../api';
import AuthImage from '../common/AuthImage';
import { emotionVisual, intensityInfo, formatFecha } from '../../utils/emociones';

const Tarjeta = ({ analisis, ninos, onSelect, onDeleted, onAsignado }) => {
  const [ninoSel, setNinoSel] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const r = analisis.resultado_ia || {};
  const visual = emotionVisual(r.emocion_predominante || '');
  const inten = intensityInfo(r.intensidad || '');

  const asignar = async (e) => {
    e.stopPropagation();
    if (!ninoSel) return;
    const nino = ninos.find((n) => n.nombre === ninoSel);
    setOcupado(true);
    try {
      await api.asignarAnalisis(analisis._id, {
        nombre: nino.nombre,
        edad: nino.edad,
        fecha_nacimiento: nino.fecha_nacimiento,
        genero: nino.genero,
      });
      if (onAsignado) onAsignado(analisis._id);
    } catch (err) {
      alert(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const borrar = async (e) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar este dibujo y su análisis? No se puede deshacer.')) return;
    try {
      await api.eliminarAnalisis(analisis._id);
      if (onDeleted) onDeleted(analisis._id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="ind-card" onClick={() => onSelect(analisis)} title="Ver el dibujo y el análisis">
      <div className="ind-thumb">
        {analisis.ruta_imagen ? <AuthImage analisisId={analisis._id} alt="Dibujo" /> : <span>🖼️</span>}
        <button className="ind-delete" title="Eliminar" onClick={borrar}><Trash2 size={16} /></button>
      </div>
      <div className="ind-body">
        <div className="ind-meta">
          <span className="ind-chip" style={{ background: visual.bg, color: visual.color }}>
            {visual.emoji} {r.emocion_predominante || 'Sin emoción'}
          </span>
          <span className="ind-inten" style={{ color: inten.color }}>Int. {inten.label}</span>
        </div>
        <div className="ind-date">{formatFecha(analisis.fecha)}</div>
        <div className="ind-assign" onClick={(e) => e.stopPropagation()}>
          <select value={ninoSel} onChange={(e) => setNinoSel(e.target.value)} disabled={ocupado || ninos.length === 0}>
            <option value="">{ninos.length === 0 ? 'No hay niños' : 'Asignar a…'}</option>
            {ninos.map((n) => <option key={n.nombre} value={n.nombre}>{n.nombre}</option>)}
          </select>
          <button className="ind-assign-btn" disabled={ocupado || !ninoSel} onClick={asignar}>Asignar</button>
        </div>
      </div>
    </div>
  );
};

const IndependientesGrid = ({ sessions = [], ninos = [], onSelect, onDeleted, onAsignado }) => {
  if (sessions.length === 0) {
    return <div className="ind-empty">No hay dibujos independientes.</div>;
  }
  return (
    <div className="ind-grid">
      {sessions.map((a) => (
        <Tarjeta key={a._id} analisis={a} ninos={ninos} onSelect={onSelect} onDeleted={onDeleted} onAsignado={onAsignado} />
      ))}
    </div>
  );
};

export default IndependientesGrid;
