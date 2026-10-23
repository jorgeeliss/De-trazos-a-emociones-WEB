import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ChildSwitcher.css';
import { emotionVisual, emocionPredominante, textoEdad } from '../../utils/emociones';
import { api } from '../../api';
import { useAnalisisSesion } from '../../context/AnalisisSesionContext';

const ChildSwitcher = ({ ninos = [], activeChild, setActiveChild, onDeleted }) => {
  const navigate = useNavigate();
  const { nuevaSesion } = useAnalisisSesion();

  const handleDelete = async (e, nino) => {
    e.stopPropagation();
    const n = nino.analisis.length;
    if (!window.confirm(`¿Eliminar a "${nino.nombre}" y sus ${n} análisis? Se borrarán también sus dibujos. Esta acción no se puede deshacer.`)) return;
    try {
      await api.eliminarNino(nino.analisis.map((a) => a._id));
      if (onDeleted) onDeleted(nino.analisis.map((a) => a._id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="child-switcher">
      {ninos.map((nino) => {
        const emocion = emocionPredominante(nino.analisis);
        const visual = emotionVisual(emocion || '');
        const inicial = (nino.nombre || '?').charAt(0).toUpperCase();
        return (
          <div
            key={nino.nombre}
            className={`child-card ${activeChild === nino.nombre ? 'active' : ''}`}
            onClick={() => setActiveChild(nino.nombre)}
          >
            <div className="child-avatar-lg" style={{ background: visual.bg, color: visual.color }}>{inicial}</div>
            <div className="child-info">
              <div className="child-cname">{nino.nombre}</div>
              <div className="child-cage">{textoEdad(nino) || `${nino.analisis.length} análisis`}</div>
            </div>
            <span className="child-mood">{visual.emoji}</span>
            <button className="child-delete" title="Eliminar niño" onClick={(e) => handleDelete(e, nino)}>
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
      <div className="add-child" title="Registrar un niño nuevo con su contexto" onClick={() => { nuevaSesion(); navigate('/app'); }}>
        <Plus size={18} />
        Agregar niño
      </div>
    </div>
  );
};

export default ChildSwitcher;
