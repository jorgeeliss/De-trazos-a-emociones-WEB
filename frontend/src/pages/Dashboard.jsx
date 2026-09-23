import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, FileText, Share2, ArrowRight } from 'lucide-react';
import './Dashboard.css';
import { api } from '../api';

import Sidebar from '../components/layout/Sidebar';
import ChildSwitcher from '../components/dashboard/ChildSwitcher';
import WeeklySummary from '../components/dashboard/WeeklySummary';
import TimelineSection from '../components/dashboard/TimelineSection';
import ActivitiesSection from '../components/dashboard/ActivitiesSection';
import ComparisonSection from '../components/dashboard/ComparisonSection';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeChild, setActiveChild] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actDones, setActDones] = useState([true, false, false]);

  const toggleActDone = (index) => {
    const newActDones = [...actDones];
    newActDones[index] = !newActDones[index];
    setActDones(newActDones);
  };

  const [barsHeight, setBarsHeight] = useState(['0px', '0px', '0px', '0px', '0px', '0px', '0px']);
  useEffect(() => {
    const timer = setTimeout(() => {
      setBarsHeight(['32px', '24px', '40px', '48px', '52px', '56px', '8px']);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
  const loadDashboard = async () => {
    try {
      const data = await api.getAnalisis();
      setHistoryData(data);
      
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
      setChildrenList(childrenArray);
      
      if (childrenArray.length > 0) {
        setActiveChild(childrenArray[0].nombre);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);

  const activeSessions = historyData.filter(item => 
    item.contexto_nino && item.contexto_nino.nombre === activeChild
  );

  const getEmojiForEmotion = (emotion = '') => {
    const lower = emotion.toLowerCase();
    if (lower.includes('ansiedad') || lower.includes('miedo') || lower.includes('tristeza')) return '😟';
    if (lower.includes('alegría') || lower.includes('felicidad')) return '😊';
    if (lower.includes('calma') || lower.includes('tranquilidad')) return '😌';
    if (lower.includes('enojo') || lower.includes('ira')) return '😠';
    return '😐';
  };

  const latestSession = activeSessions[0];
  const welcomeEmoji = latestSession ? getEmojiForEmotion(latestSession.resultado_ia?.emocion_predominante) : '👋';

  return (
    <div className="dashboard-container">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <Sidebar active="dashboard" />

      <main className="main">
        {/* WELCOME */}
        <div className="welcome">
          <div className="welcome-left">
            <div className="welcome-greeting">
              👋 Hola, {JSON.parse(localStorage.getItem('user') || '{}').firstname || 'Usuario'}
              </div>
                <div className="welcome-title">
              ¿Cómo está <span>{activeChild || 'tu hijo/a'}</span> hoy?
            </div>
              <div className="welcome-sub">
                {activeSessions.length > 0
                  ? `Tenemos ${activeSessions.length} análisis registrados para ${activeChild}.`
                  : 'Aún no tienes análisis registrados. Realiza tu primer análisis para comenzar el seguimiento.'}
              </div>          </div>
          <div className="welcome-emoji">{welcomeEmoji}</div>
        </div>

        <ChildSwitcher activeChild={activeChild} setActiveChild={setActiveChild} childrenList={childrenList} historyData={historyData} />

        <WeeklySummary sessions={activeSessions} activeChildName={activeChild} />

        <TimelineSection sessions={activeSessions} activeChildName={activeChild} />

        <div className="grid-bottom">
          <ActivitiesSection actDones={actDones} toggleActDone={toggleActDone} activeChildName={activeChild} />
          <ComparisonSection activeChildName={activeChild} sessions={activeSessions} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
