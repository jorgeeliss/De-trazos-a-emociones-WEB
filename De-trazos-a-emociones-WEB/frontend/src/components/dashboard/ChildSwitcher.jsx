import { Plus } from 'lucide-react';
import './ChildSwitcher.css';
import { emotionVisual, emocionPredominante } from '../../utils/emociones';

const ChildSwitcher = ({ ninos = [], activeChild, setActiveChild }) => {
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
              <div className="child-cage">{nino.edad ? `${nino.edad} años` : `${nino.analisis.length} análisis`}</div>
            </div>
            <span className="child-mood">{visual.emoji}</span>
          </div>
        );
      })}
      <div className="add-child" title="Próximamente" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
        <Plus size={18} />
        Agregar niño
      </div>
    </div>
  );
};

export default ChildSwitcher;
