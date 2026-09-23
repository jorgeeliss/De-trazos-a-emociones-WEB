import React from 'react';
import { ArrowRight } from 'lucide-react';
import './ComparisonSection.css';

const ComparisonSection = () => {
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
              <div className="compare-thumb">🖍️</div>
              <div className="compare-date">Hace 2 semanas</div>
            </div>
            <div className="compare-arrow">
              <ArrowRight size={24} />
            </div>
            <div style={{flex: 1, textAlign: 'center'}}>
              <div className="compare-thumb">🎨</div>
              <div className="compare-date">Hoy</div>
            </div>
          </div>
          <div className="compare-result">
            <strong>Cambio detectado:</strong> Sofía pasó de usar colores brillantes a colores más apagados. Sus figuras también se volvieron más pequeñas, lo que puede indicar un bajón emocional.
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
