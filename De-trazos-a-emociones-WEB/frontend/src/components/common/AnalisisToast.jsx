import { useNavigate, useLocation } from 'react-router-dom';
import { useAnalisisSesion } from '../../context/AnalisisSesionContext';
import './AnalisisToast.css';

const AnalisisToast = () => {
  const { notificacion, setNotificacion } = useAnalisisSesion();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Solo se muestra si hay un análisis terminado y NO estás ya en el Analyzer.
  if (!notificacion || pathname === '/app') return null;

  return (
    <button
      className="toast-analisis"
      onClick={() => { setNotificacion(null); navigate('/app'); }}
    >
      <span className="toast-dot"></span>
      <span>Análisis de <strong>{notificacion.nombre}</strong> listo · Ver resultado</span>
    </button>
  );
};

export default AnalisisToast;
