import React from 'react';
import { Plus } from 'lucide-react';
import './ChildSwitcher.css';

const ChildSwitcher = ({ activeChild, setActiveChild }) => {
  return (
    <div className="child-switcher">
      <div className={`child-card ${activeChild === 'sofia' ? 'active' : ''}`} onClick={() => setActiveChild('sofia')}>
        <div className="child-avatar-lg" style={{background: 'rgba(139, 121, 242, 0.2)', color: 'var(--purple-light)'}}>S</div>
        <div className="child-info">
          <div className="child-cname">Sofía</div>
          <div className="child-cage">8 años</div>
        </div>
        <span className="child-mood">😟</span>
      </div>
      <div className={`child-card ${activeChild === 'lucas' ? 'active' : ''}`} onClick={() => setActiveChild('lucas')}>
        <div className="child-avatar-lg" style={{background: 'rgba(45,212,191,0.15)', color: 'var(--teal)'}}>L</div>
        <div className="child-info">
          <div className="child-cname">Lucas</div>
          <div className="child-cage">5 años</div>
        </div>
        <span className="child-mood">😊</span>
      </div>
      <div className="add-child">
        <Plus size={18} />
        Agregar hijo
      </div>
    </div>
  );
};

export default ChildSwitcher;
