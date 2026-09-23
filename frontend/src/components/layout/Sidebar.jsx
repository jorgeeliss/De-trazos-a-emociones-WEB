import React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ active }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="logo-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>
      <div className={`nav-item ${active === 'dashboard' ? 'active' : ''}`} title="Dashboard" onClick={() => navigate('/dashboard')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </div>
      <div className={`nav-item ${active === 'history' ? 'active' : ''}`} title="Historial" onClick={() => navigate('/historial')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>

      <div style={{ flex: 1 }}></div>
      <div className="nav-item" title="Configuración">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
      </div>
      <div className="nav-item" title="Cerrar sesión" onClick={handleLogout} style={{ marginTop: '10px', color: '#fca5a5' }}>
        <LogOut size={22} strokeWidth={1.8} />
      </div>
    </aside>
  );
};

export default Sidebar;
