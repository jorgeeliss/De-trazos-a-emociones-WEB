import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import './History.css';

import Sidebar from '../components/layout/Sidebar';
import HistoryChildBar from '../components/history/HistoryChildBar';
import ChartCard from '../components/history/ChartCard';
import SummaryCard from '../components/history/SummaryCard';
import StatCards from '../components/history/StatCards';
import SessionsList from '../components/history/SessionsList';

const History = () => {
  const navigate = useNavigate();
  const [activeChild, setActiveChild] = useState('sofia');
  
  const [barsWidth, setBarsWidth] = useState(['0%', '0%', '0%', '0%']);
  const [dotsHeight, setDotsHeight] = useState(['0px', '0px', '0px', '0px', '0px', '0px', '0px']);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBarsWidth(['62%', '38%', '24%', '15%']);
      setDotsHeight(['8px', '14px', '10px', '18px', '12px', '24px', '6px']);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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
        <div className="alert-banner">
          <div className="alert-icon">
            <AlertTriangle color="#f87171" size={20} />
          </div>
          <div className="alert-text">
            <div className="alert-title">Alerta emocional — Sofía M.</div>
            <div className="alert-sub">Ansiedad detectada en 3 análisis consecutivos. Se recomienda atención prioritaria.</div>
          </div>
          <button className="alert-btn">Ver detalle</button>
        </div>

        <HistoryChildBar activeChild={activeChild} setActiveChild={setActiveChild} />

        {/* CUADRÍCULA SUPERIOR */}
        <div className="grid-top">
          <ChartCard />
          <SummaryCard barsWidth={barsWidth} dotsHeight={dotsHeight} />
        </div>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <StatCards />

        {/* LISTA DE SESIONES */}
        <SessionsList />
      </main>
    </div>
  );
};

export default History;
