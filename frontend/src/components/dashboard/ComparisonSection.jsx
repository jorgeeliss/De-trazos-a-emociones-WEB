import React from 'react';
import { ArrowRight } from 'lucide-react';
import { API_URL } from '../../api';
import './ComparisonSection.css';

const ComparisonSection = ({ activeChildName = '', sessions = [] }) => {
  const childNameStr = activeChildName || 'tu hijo/a';
  
  let latest = null;
  let previous = null;

  if (sessions.length >= 2) {
    latest = sessions[0];
    previous = sessions[1];
  } else if (sessions.length === 1) {
    latest = sessions[0];
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return (isToday ? 'Hoy' : date.toLocaleDateString('es-ES', options));
  };

  const getEmotionName = (session) => {
    if (!session || !session.resultado_ia) return 'Desconocida';
    return session.resultado_ia.emocion_predominante || 'Desconocida';
  };

  let comparisonText = `Aún no hay suficientes dibujos de ${childNameStr} para realizar una comparación. Sube más dibujos para ver su evolución.`;
  if (latest && previous) {
    const emotionPrev = getEmotionName(previous).toLowerCase();
    const emotionLatest = getEmotionName(latest).toLowerCase();
    
    if (emotionPrev === emotionLatest) {
       comparisonText = `${childNameStr} ha mantenido un estado constante de ${emotionLatest} en sus últimos dibujos. Sigue observando si hay algún cambio significativo en sus trazos.`;
    } else {
       comparisonText = `${childNameStr} pasó de expresar ${emotionPrev} a mostrar señales de ${emotionLatest}. Los cambios en los colores y formas de sus dibujos sugieren esta variación emocional.`;
    }
  } else if (latest) {
    comparisonText = `Hemos analizado un dibujo de ${childNameStr} que indica ${getEmotionName(latest).toLowerCase()}. Sube otro dibujo más adelante para realizar una comparación temporal.`;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      <div className="dashboard-card compare-card">
        <div className="ts-header">
          <div>
            <div className="ts-title">Antes y ahora</div>
            <div style={{fontSize: '13px', color: 'var(--muted2)', marginTop: '4px'}}>Comparación de dibujos</div>
          </div>
        </div>
        <div className="compare-body">
          <div className="compare-pair">
            <div style={{flex: 1, textAlign: 'center'}}>
              <div className="compare-thumb">
                {previous ? <img src={`${API_URL}${previous.ruta_imagen}`} alt="Dibujo anterior" /> : '🖍️'}
              </div>
              <div className="compare-date">{previous ? formatDate(previous.fecha) : 'Sin registro anterior'}</div>
            </div>
            <div className="compare-arrow">
              <ArrowRight size={24} />
            </div>
            <div style={{flex: 1, textAlign: 'center'}}>
              <div className="compare-thumb">
                 {latest ? <img src={`${API_URL}${latest.ruta_imagen}`} alt="Dibujo actual" /> : '🎨'}
              </div>
              <div className="compare-date">{latest ? formatDate(latest.fecha) : 'Sin registros'}</div>
            </div>
          </div>
          <div className="compare-result">
            <strong>Análisis:</strong> {comparisonText}
          </div>
        </div>
      </div>

      <div className="dashboard-card tips-card">
        <div className="ts-header">
          <div className="ts-title">Consejos para esta semana</div>
        </div>
        <div className="tips-body">
          <div className="tip-item">
            <div className="tip-num">1</div>
            <div className="tip-text"><strong>Normaliza sus emociones.</strong> Dile que está bien sentirse ansioso a veces y que tú también lo sientes.</div>
          </div>
          <div className="tip-item">
            <div className="tip-num">2</div>
            <div className="tip-text"><strong>Evita forzar conversaciones.</strong> A veces un abrazo silencioso dice más que mil preguntas.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSection;
