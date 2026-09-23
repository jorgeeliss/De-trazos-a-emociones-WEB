import React from 'react';
import { Plus } from 'lucide-react';
import './ChildSwitcher.css';

const ChildSwitcher = ({ activeChild, setActiveChild, childrenList = [], historyData = [] }) => {
  const getEmoji = (childName) => {
    const session = historyData.find(s => s.contexto_nino?.nombre === childName);
    if (!session) return '😐';
    const emotion = session.resultado_ia?.emocion_predominante?.toLowerCase() || '';
    if (emotion.includes('ansiedad') || emotion.includes('miedo') || emotion.includes('tristeza')) return '😟';
    if (emotion.includes('alegría') || emotion.includes('felicidad')) return '😊';
    if (emotion.includes('calma') || emotion.includes('tranquilidad')) return '😌';
    if (emotion.includes('enojo') || emotion.includes('ira')) return '😠';
    return '😐';
  };

  const getStyle = (index) => {
    const styles = [
      { bg: 'rgba(139, 121, 242, 0.2)', color: 'var(--purple-light)' },
      { bg: 'rgba(45,212,191,0.15)', color: 'var(--teal)' },
      { bg: 'rgba(251,191,36,0.15)', color: 'var(--amber)' },
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="child-switcher">
      {childrenList.map((child, index) => {
        const style = getStyle(index);
        return (
          <div key={index} className={`child-card ${activeChild === child.nombre ? 'active' : ''}`} onClick={() => setActiveChild(child.nombre)}>
            <div className="child-avatar-lg" style={{background: style.bg, color: style.color}}>{child.nombre.charAt(0).toUpperCase()}</div>
            <div className="child-info">
              <div className="child-cname">{child.nombre}</div>
              <div className="child-cage">{child.edad ? `${child.edad} años` : ''}</div>
            </div>
            <span className="child-mood">{getEmoji(child.nombre)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ChildSwitcher;
