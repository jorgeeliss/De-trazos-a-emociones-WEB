import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, FileText, Share2, ArrowRight } from 'lucide-react';
import './Dashboard.css';

import Sidebar from '../components/layout/Sidebar';
import ChildSwitcher from '../components/dashboard/ChildSwitcher';
import WeeklySummary from '../components/dashboard/WeeklySummary';
import TimelineSection from '../components/dashboard/TimelineSection';
import ActivitiesSection from '../components/dashboard/ActivitiesSection';
import ComparisonSection from '../components/dashboard/ComparisonSection';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeChild, setActiveChild] = useState('sofia');
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
            <div className="welcome-greeting">👋 Hola, María</div>
            <div className="welcome-title">¿Cómo está <span>Sofía</span> hoy?</div>
            <div className="welcome-sub">Esta semana hemos detectado que Sofía podría estar pasando por un momento de ansiedad. Te tenemos algunas sugerencias para ayudarla.</div>
          </div>
          <div className="welcome-emoji">😟</div>
        </div>

        <ChildSwitcher activeChild={activeChild} setActiveChild={setActiveChild} />

        <WeeklySummary barsHeight={barsHeight} />

        <TimelineSection />

        <div className="grid-bottom">
          <ActivitiesSection actDones={actDones} toggleActDone={toggleActDone} />
          <ComparisonSection />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
