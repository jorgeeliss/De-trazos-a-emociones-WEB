import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle } from 'lucide-react';
import './History.css';
import { api } from '../api';
import { esEmocionNegativa } from '../utils/emociones';

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

  const [dotsHeight, setDotsHeight] = useState(['0px', '0px', '0px', '0px', '0px', '0px', '0px']);

  useEffect(() => {
    // Animación decorativa de los puntos de actividad semanal del resumen.
    const timer = setTimeout(() => {
      setDotsHeight(['8px', '14px', '10px', '18px', '12px', '24px', '6px']);
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

  // Alerta orientativa (no diagnóstica): los 3 análisis más recientes del niño
  // muestran emociones negativas. Es una señal para conversar, no un diagnóstico.
  const ultimos3 = activeSessions.slice(0, 3);
  const mostrarAlerta = ultimos3.length >= 3 && ultimos3.every(s => esEmocionNegativa(s.resultado_ia?.emocion_predominante || ''));

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

        {/* ALERTA ORIENTATIVA (por regla documentada, no por nombre) */}
        {mostrarAlerta && (
          <div className="alert-banner">
            <div className="alert-icon">
              <AlertTriangle color="#f87171" size={20} />
            </div>
            <div className="alert-text">
              <div className="alert-title">Señal para acompañar — {activeChild}</div>
              <div className="alert-sub">Los 3 análisis más recientes muestran emociones que suelen asociarse a malestar. Podría ser útil conversar con calma o, si lo consideras, con un profesional. Esto es orientativo, no un diagnóstico.</div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{padding: '20px', color: 'var(--muted)'}}>Cargando historial...</div>
        ) : (
          <>
            <HistoryChildBar childrenList={children} activeChild={activeChild} setActiveChild={setActiveChild} />

            {/* CUADRÍCULA SUPERIOR */}
            <div className="grid-top">
              <ChartCard sessions={activeSessions} activeChildName={activeChild} />
              <SummaryCard sessions={activeSessions} dotsHeight={dotsHeight} />
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
