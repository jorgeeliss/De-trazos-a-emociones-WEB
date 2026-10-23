import { useState, useEffect, useMemo } from 'react';
import './Dashboard.css';
import { api } from '../api';
import { emotionVisual, emocionPredominante } from '../utils/emociones';

import Sidebar from '../components/layout/Sidebar';
import ChildSwitcher from '../components/dashboard/ChildSwitcher';
import WeeklySummary from '../components/dashboard/WeeklySummary';
import TimelineSection from '../components/dashboard/TimelineSection';
import ActivitiesSection from '../components/dashboard/ActivitiesSection';
import ComparisonSection from '../components/dashboard/ComparisonSection';
import AnalysisDetailModal from '../components/common/AnalysisDetailModal';
import BrandHeader from '../components/common/BrandHeader';

const Dashboard = () => {
  const [activeChild, setActiveChild] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await api.getAnalisis();
        setHistoryData(data);
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      }
    };
    loadDashboard();
  }, []);

  // Agrupar los análisis reales por niño (hoy identificado por el nombre del
  // contexto; en el Paso 4 se reemplazará por un modelo de Niño con ninoId).
  const children = useMemo(() => {
    const map = new Map();
    for (const a of historyData) {
      if (a.independiente) continue; // los dibujos independientes no son niños
      const nombre = (a.contexto_nino?.nombre || '').trim() || 'Sin nombre';
      if (!map.has(nombre)) {
        map.set(nombre, {
          nombre,
          edad: a.contexto_nino?.edad || '',
          fecha_nacimiento: a.contexto_nino?.fecha_nacimiento || '',
          analisis: []
        });
      }
      map.get(nombre).analisis.push(a);
    }
    return [...map.values()];
  }, [historyData]);

  const handleNinoEliminado = (ids) => {
    const borrados = new Set(ids);
    setHistoryData((prev) => prev.filter((a) => !borrados.has(a._id)));
  };

  // El niño seleccionado por defecto es el primero; al hacer clic se actualiza activeChild.
  const selected = children.find((c) => c.nombre === activeChild) || children[0] || null;
  const nombreUsuario = JSON.parse(localStorage.getItem('user') || '{}').nombre || 'Usuario';
  const emocionSel = selected ? emocionPredominante(selected.analisis) : null;
  const emojiSel = emotionVisual(emocionSel || '').emoji;

  return (
    <div className="dashboard-container">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <Sidebar active="dashboard" />

      <main className="main">
        <BrandHeader />

        {/* WELCOME */}
        <div className="welcome">
          <div className="welcome-left">
            <div className="welcome-greeting">
              👋 Hola, {nombreUsuario}
            </div>
            <div className="welcome-title">
              ¿Cómo está <span>{selected?.nombre && selected.nombre !== 'Sin nombre' ? selected.nombre : 'tu niño/a'}</span> hoy?
            </div>
            <div className="welcome-sub">
              {children.length > 0
                ? `Tienes ${children.length} niño(s) registrados.`
                : 'Aún no tienes niños registrados. Realiza un análisis con contexto para comenzar el seguimiento.'}
            </div>
          </div>
          <div className="welcome-emoji">{children.length > 0 ? emojiSel : '🙂'}</div>
        </div>

        {children.length === 0 ? (
          <div className="dashboard-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
            Todavía no hay niños registrados. Usa <strong>Agregar niño</strong> o <strong>Nuevo análisis</strong> para comenzar. Los dibujos analizados de forma independiente se ven en el Historial.
          </div>
        ) : (
          <>
            <ChildSwitcher ninos={children} activeChild={selected?.nombre} setActiveChild={setActiveChild} onDeleted={handleNinoEliminado} />

            <WeeklySummary child={selected} />

            <TimelineSection child={selected} onSelect={setDetalle} />

            <div className="grid-bottom">
              <ActivitiesSection key={`act-${selected?.nombre}`} child={selected} />
              <ComparisonSection key={`cmp-${selected?.nombre}`} child={selected} onSelect={setDetalle} />
            </div>
          </>
        )}
      </main>

      {detalle && <AnalysisDetailModal analisis={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
};

export default Dashboard;
