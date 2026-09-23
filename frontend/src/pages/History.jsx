import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import './History.css';
import { api } from '../api';

import Sidebar from '../components/layout/Sidebar';
import HistoryChildBar from '../components/history/HistoryChildBar';
import ChartCard from '../components/history/ChartCard';
import SummaryCard from '../components/history/SummaryCard';
import StatCards from '../components/history/StatCards';
import SessionsList from '../components/history/SessionsList';

const History = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [barsWidth, setBarsWidth] = useState(['0%', '0%', '0%', '0%']);

  useEffect(() => {
    // Para las animaciones de las gráficas
    const timer = setTimeout(() => {
      setBarsWidth(['62%', '38%', '24%', '15%']);
    }, 300);
    
    // Obtener el historial real del backend
    const fetchHistory = async () => {
      try {
        const data = await api.getAnalisis();
        setHistoryData(data);;
        
        // Extraer niños únicos
        const uniqueChildrenMap = new Map();
        data.forEach(item => {
          if (item.contexto_nino && item.contexto_nino.nombre) {
            const name = item.contexto_nino.nombre;
            if (!uniqueChildrenMap.has(name)) {
              uniqueChildrenMap.set(name, item.contexto_nino);
            }
          }
        });
        
        const childrenArray = Array.from(uniqueChildrenMap.values());
        setChildren(childrenArray);
        
        if (childrenArray.length > 0) {
          setActiveChild(childrenArray[0].nombre);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching history:", err);
        setLoading(false);
      }
    };
    
    fetchHistory();
    return () => clearTimeout(timer);
  }, []);

  const activeSessions = historyData.filter(item => 
    item.contexto_nino && item.contexto_nino.nombre === activeChild
  );

  let hasRecentNegatives = false;
  if (activeSessions.length >= 3) {
    const recentEmotions = activeSessions.slice(0, 3).map(s => (s.resultado_ia?.emocion_predominante || '').toLowerCase());
    const negativeCount = recentEmotions.filter(e => e.includes('ansiedad') || e.includes('tristeza') || e.includes('enojo') || e.includes('miedo')).length;
    if (negativeCount >= 2) {
      hasRecentNegatives = true;
    }
  }

  return (
    <div className="history-wrapper">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <Sidebar active="history" />

      <main className="main">
        {/* BARRA SUPERIOR */}
        <div className="topbar">
          <div>
            <div className="page-title">Historial <span>emocional</span></div>
            <div style={{fontSize: '14px', color: 'var(--muted)', marginTop: '6px', fontWeight: 400}}>Seguimiento longitudinal por niño · Últimas 8 semanas</div>
          </div>
          <div className="topbar-right">
            <button className="btn-new" onClick={() => navigate('/app')}>
              <Plus size={16} />
              Nuevo análisis
            </button>
          </div>
        </div>

        {/* ALERT */}
        {hasRecentNegatives && (
          <div className="alert-banner">
            <div className="alert-icon">
              <AlertTriangle color="#f87171" size={20} />
            </div>
            <div className="alert-text">
              <div className="alert-title">Alerta emocional — {activeChild}</div>
              <div className="alert-sub">Múltiples emociones negativas detectadas recientemente. Se recomienda atención.</div>
            </div>
            <button className="alert-btn">Ver detalle</button>
          </div>
        )}

        {loading ? (
          <div style={{padding: '20px', color: 'var(--muted)'}}>Cargando historial...</div>
        ) : (
          <>
            <HistoryChildBar childrenList={children} activeChild={activeChild} setActiveChild={setActiveChild} />

            {/* CUADRÍCULA SUPERIOR */}
            <div className="grid-top">
              <ChartCard activeChildName={activeChild} sessions={activeSessions} />
              <SummaryCard sessions={activeSessions} />
            </div>

            {/* TARJETAS DE ESTADÍSTICAS */}
            <StatCards sessions={activeSessions} />

            {/* LISTA DE SESIONES */}
            <SessionsList sessions={activeSessions} activeChildName={activeChild} />
          </>
        )}
      </main>
    </div>
  );
};

export default History;
