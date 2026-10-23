import { useNavigate } from 'react-router-dom';
import './HistoryChildBar.css';

const HistoryChildBar = ({ childrenList, activeChild, setActiveChild, hayIndependientes, independientesKey }) => {
  const navigate = useNavigate();
  return (
    <div className="child-bar">
      {childrenList && childrenList.map((child, i) => {
        // Generar un color semi-aleatorio basado en el nombre para mantener consistencia
        const colors = [
          { bg: 'rgba(139, 121, 242, 0.25)', color: 'var(--purple-light)' },
          { bg: 'rgba(45,212,191,0.2)', color: '#2dd4bf' },
          { bg: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
          { bg: 'rgba(244,114,182,0.2)', color: '#f472b6' }
        ];
        const style = colors[i % colors.length];
        const initials = child.nombre ? child.nombre.substring(0, 2).toUpperCase() : '?';

        return (
          <div key={i} className={`child-pill ${activeChild === child.nombre ? 'active' : ''}`} onClick={() => setActiveChild(child.nombre)}>
            <div className="child-avatar" style={{background: style.bg, color: style.color}}>{initials}</div>
            <span className="child-name">{child.nombre}</span>
            {child.edad && <span className="child-age">· {child.edad} años</span>}
          </div>
        );
      })}
      
      {(!childrenList || childrenList.length === 0) && (
        <div className="child-pill">
          <span className="child-name" style={{color: 'var(--muted)'}}>No hay niños analizados aún</span>
        </div>
      )}

      {hayIndependientes && (
        <div
          className={`child-pill ${activeChild === independientesKey ? 'active' : ''}`}
          onClick={() => setActiveChild(independientesKey)}
          title="Dibujos analizados sin asociar a un niño"
        >
          <div className="child-avatar" style={{background: 'rgba(168,158,224,0.2)', color: '#a89ee0'}}>🖼️</div>
          <span className="child-name">Dibujos independientes</span>
        </div>
      )}

      <div className="child-pill" style={{borderStyle: 'dashed', cursor: 'pointer'}} title="Registrar un niño nuevo con su contexto" onClick={() => navigate('/app')}>
        <div className="child-avatar" style={{background: 'rgba(255,255,255,0.05)', color: 'var(--muted)'}}>+</div>
        <span className="child-name" style={{color: 'var(--muted)'}}>Agregar niño</span>
      </div>
    </div>
  );
};

export default HistoryChildBar;
