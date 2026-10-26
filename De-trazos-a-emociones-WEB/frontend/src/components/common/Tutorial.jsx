import { useState } from 'react';
import { X, Sparkles, Image, LayoutDashboard, History, Users, Settings, ArrowLeft, ArrowRight } from 'lucide-react';
import './Tutorial.css';

const PASOS = [
  {
    icon: Sparkles,
    titulo: 'Bienvenido/a',
    texto: 'Esta herramienta te ayuda a interpretar los dibujos de un niño junto con su contexto. Es un apoyo orientativo: no diagnostica ni reemplaza el criterio de un profesional.',
  },
  {
    icon: Image,
    titulo: 'Analiza un dibujo',
    texto: 'En la página principal eliges "Con contexto del niño" (llenas sus datos y subes el dibujo) o "Solo dibujo" (análisis rápido que luego puedes guardar o asignar a un niño).',
  },
  {
    icon: LayoutDashboard,
    titulo: 'Panel del niño',
    texto: 'Verás su emoción predominante, su evolución reciente y actividades sugeridas con su fundamento. Toca una actividad para ver por qué ayuda.',
  },
  {
    icon: History,
    titulo: 'Historial y comparación',
    texto: 'Revisa todos los análisis de cada niño, compara "antes y ahora" (incluso entre dibujos del mismo día por hora) y maneja los dibujos independientes.',
  },
  {
    icon: Users,
    titulo: 'Tus niños y reportes',
    texto: 'En "Mis niños" ves la información y la situación de cada uno. Puedes exportar a PDF el detalle o el historial, y generar un reporte consolidado en "Reportes".',
  },
  {
    icon: Settings,
    titulo: 'Tu cuenta',
    texto: 'Desde tu perfil (arriba a la derecha) cambias tu foto, cierras sesión o eliminas la cuenta. En Configuración eliges tema claro/oscuro, paletas y cambias tu contraseña.',
  },
];

const Tutorial = ({ open, onClose }) => {
  const [i, setI] = useState(0);
  if (!open) return null;

  const paso = PASOS[i];
  const Icono = paso.icon;
  const esUltimo = i === PASOS.length - 1;

  const cerrar = () => {
    setI(0);
    onClose();
  };

  return (
    <div className="tut-overlay" onClick={cerrar}>
      <div className="tut-card" onClick={(e) => e.stopPropagation()}>
        <button className="tut-close" onClick={cerrar} title="Cerrar"><X size={18} /></button>

        <div className="tut-icon"><Icono size={30} /></div>
        <div className="tut-paso">Paso {i + 1} de {PASOS.length}</div>
        <h2 className="tut-title">{paso.titulo}</h2>
        <p className="tut-text">{paso.texto}</p>

        <div className="tut-dots">
          {PASOS.map((_, idx) => (
            <span key={idx} className={`tut-dot ${idx === i ? 'active' : ''}`} />
          ))}
        </div>

        <div className="tut-actions">
          {i > 0 ? (
            <button className="tut-btn ghost" onClick={() => setI((n) => n - 1)}>
              <ArrowLeft size={16} /> Anterior
            </button>
          ) : (
            <button className="tut-btn ghost" onClick={cerrar}>Saltar</button>
          )}

          {esUltimo ? (
            <button className="tut-btn" onClick={cerrar}>Entendido</button>
          ) : (
            <button className="tut-btn" onClick={() => setI((n) => n + 1)}>
              Siguiente <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
