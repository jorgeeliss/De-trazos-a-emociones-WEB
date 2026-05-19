import React from 'react';
import './HistoryChildBar.css';

const HistoryChildBar = ({ activeChild, setActiveChild }) => {
  return (
    <div className="child-bar">
      <div className={`child-pill ${activeChild === 'sofia' ? 'active' : ''}`} onClick={() => setActiveChild('sofia')}>
        <div className="child-avatar" style={{background: 'rgba(139, 121, 242, 0.25)', color: 'var(--purple-light)'}}>SM</div>
        <span className="child-name">Sofía</span><span className="child-age">· 8 años</span>
      </div>
      <div className={`child-pill ${activeChild === 'juan' ? 'active' : ''}`} onClick={() => setActiveChild('juan')}>
        <div className="child-avatar" style={{background: 'rgba(45,212,191,0.2)', color: '#2dd4bf'}}>JR</div>
        <span className="child-name">Juan</span><span className="child-age">· 6 años</span>
      </div>
      <div className={`child-pill ${activeChild === 'laura' ? 'active' : ''}`} onClick={() => setActiveChild('laura')}>
        <div className="child-avatar" style={{background: 'rgba(251,191,36,0.2)', color: '#fbbf24'}}>LG</div>
        <span className="child-name">Laura</span><span className="child-age">· 9 años</span>
      </div>
      <div className={`child-pill ${activeChild === 'mateo' ? 'active' : ''}`} onClick={() => setActiveChild('mateo')}>
        <div className="child-avatar" style={{background: 'rgba(244,114,182,0.2)', color: '#f472b6'}}>MC</div>
        <span className="child-name">Mateo</span><span className="child-age">· 7 años</span>
      </div>
      <div className="child-pill" style={{borderStyle: 'dashed'}}>
        <div className="child-avatar" style={{background: 'rgba(255,255,255,0.05)', color: 'var(--muted)'}}>+</div>
        <span className="child-name" style={{color: 'var(--muted)'}}>Agregar niño</span>
      </div>
    </div>
  );
};

export default HistoryChildBar;
