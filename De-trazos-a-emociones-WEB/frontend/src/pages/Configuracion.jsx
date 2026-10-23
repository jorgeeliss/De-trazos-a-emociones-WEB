import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Check } from 'lucide-react';
import BrandHeader from '../components/common/BrandHeader';
import { useTheme } from '../context/ThemeContext';
import './Configuracion.css';

const PALETAS = [
  { key: 'violeta', nombre: 'Violeta', color: '#8b79f2' },
  { key: 'teal', nombre: 'Verde azulado', color: '#14b8a6' },
  { key: 'durazno', nombre: 'Durazno', color: '#f98a6c' },
  { key: 'oceano', nombre: 'Océano', color: '#60a5fa' },
];

const Configuracion = () => {
  const navigate = useNavigate();
  const { tema, paleta, setTema, setPaleta } = useTheme();

  return (
    <div className="config-page">
      <div className="config-container">
        <BrandHeader />

        <button className="config-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Volver
        </button>

        <h1 className="config-title">Configuración</h1>
        <p className="config-sub">Personaliza la apariencia de la aplicación.</p>

        <section className="config-section">
          <h2>Tema</h2>
          <div className="tema-opciones">
            <button
              className={`tema-opt ${tema === 'light' ? 'active' : ''}`}
              onClick={() => setTema('light')}
            >
              <Sun size={20} /> Claro
            </button>
            <button
              className={`tema-opt ${tema === 'dark' ? 'active' : ''}`}
              onClick={() => setTema('dark')}
            >
              <Moon size={20} /> Oscuro
            </button>
          </div>
        </section>

        <section className="config-section">
          <h2>Paleta de color</h2>
          <div className="paleta-grid">
            {PALETAS.map((p) => (
              <button
                key={p.key}
                className={`paleta-opt ${paleta === p.key ? 'active' : ''}`}
                onClick={() => setPaleta(p.key)}
              >
                <span className="paleta-swatch" style={{ background: p.color }}>
                  {paleta === p.key && <Check size={16} />}
                </span>
                <span className="paleta-nombre">{p.nombre}</span>
              </button>
            ))}
          </div>
        </section>

        <p className="config-nota">
          Tus preferencias se guardan en este dispositivo.
        </p>
      </div>
    </div>
  );
};

export default Configuracion;
