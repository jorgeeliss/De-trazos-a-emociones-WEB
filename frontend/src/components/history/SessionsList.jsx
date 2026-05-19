import React from 'react';
import { ChevronRight } from 'lucide-react';
import './SessionsList.css';

const SessionsList = () => {
  return (
    <div className="dashboard-card sessions-card">
      <div className="card-header">
        <div>
          <div className="card-label">Registro de sesiones</div>
          <div className="card-title">Todos los análisis de Sofía</div>
        </div>
        <button className="btn-outline-small">Exportar PDF</button>
      </div>
      <div className="sessions-body">
        {[
          {
            thumb: '🎨', date: 'Hoy · 22 de abril, 2026',
            emotions: [
              { name: 'Ansiedad', bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
              { name: 'Tristeza', bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
            ],
            sparkPoints: '0,25 13,20 26,15 39,10 52,8 65,5 80,3', stroke: '#f87171',
            intensity: 'Alta', intensityBg: 'rgba(248,113,113,0.15)', intensityColor: '#f87171'
          },
          {
            thumb: '🖍️', date: 'Hace 1 semana · 15 de abril, 2026',
            emotions: [
              { name: 'Ansiedad', bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
              { name: 'Calma', bg: 'rgba(168,158,224,0.15)', color: '#a89ee0' },
            ],
            sparkPoints: '0,22 13,18 26,20 39,15 52,12 65,10 80,8', stroke: '#a89ee0',
            intensity: 'Media', intensityBg: 'rgba(251,191,36,0.15)', intensityColor: '#fbbf24'
          },
          {
            thumb: '✏️', date: 'Hace 2 semanas · 8 de abril, 2026',
            emotions: [
              { name: 'Alegría', bg: 'rgba(45,212,191,0.15)', color: '#2dd4bf' },
              { name: 'Calma', bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
            ],
            sparkPoints: '0,20 13,22 26,18 39,14 52,16 65,12 80,10', stroke: '#2dd4bf',
            intensity: 'Baja', intensityBg: 'rgba(74,222,128,0.15)', intensityColor: '#4ade80'
          },
          {
            thumb: '🖊️', date: 'Hace 3 semanas · 1 de abril, 2026',
            emotions: [
              { name: 'Alegría', bg: 'rgba(45,212,191,0.15)', color: '#2dd4bf' },
              { name: 'Energía', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
            ],
            sparkPoints: '0,18 13,20 26,22 39,18 52,15 65,14 80,15', stroke: '#2dd4bf',
            intensity: 'Baja', intensityBg: 'rgba(74,222,128,0.15)', intensityColor: '#4ade80'
          }
        ].map((session, i) => (
          <div key={i} className="session-row">
            <div className="session-thumb">{session.thumb}</div>
            <div className="session-info">
              <div className="session-date">{session.date}</div>
              <div className="session-emotions">
                {session.emotions.map((e, j) => (
                  <span key={j} className="e-chip" style={{background: e.bg, color: e.color}}>{e.name}</span>
                ))}
              </div>
            </div>
            <svg className="sparkline" viewBox="0 0 80 30">
              <polyline points={session.sparkPoints} fill="none" stroke={session.stroke} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="session-intensity">
              <div className="intensity-label">Intensidad</div>
              <div className="intensity-badge" style={{background: session.intensityBg, color: session.intensityColor}}>{session.intensity}</div>
            </div>
            <ChevronRight className="session-arrow" size={20} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionsList;
