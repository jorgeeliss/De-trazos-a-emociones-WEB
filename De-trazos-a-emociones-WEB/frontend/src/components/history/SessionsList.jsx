import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import './SessionsList.css';
import { api } from '../../api';
import AuthImage from '../common/AuthImage';
import ConfirmDialog from '../common/ConfirmDialog';
import { exportarAnalisis } from '../../utils/exportarPdf';
import { puedePdf } from '../../utils/permisos';

const slug = (s) =>
  String(s || 'nino').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

const SessionsList = ({ sessions = [], activeChildName = '', onDeleted, onSelect }) => {
  const [generando, setGenerando] = useState(false);
  const [porBorrar, setPorBorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);

  const exportar = async () => {
    if (!sessions.length || generando) return;
    setGenerando(true);
    try {
      await exportarAnalisis({
        detalle: null,
        historial: { nombre: activeChildName || 'el niño', lista: sessions },
        nombreArchivo: `de-trazos-${slug(activeChildName)}.pdf`,
      });
    } catch (e) {
      alert(e.message);
    } finally {
      setGenerando(false);
    }
  };


  const getEmotionColor = (emotionStr = '') => {
    const lower = emotionStr.toLowerCase();
    // Variables CSS (index.css) para que los colores sigan el tema claro/oscuro.
    const emo = (n) => ({ bg: `var(--emo-${n}-bg)`, color: `var(--emo-${n})`, stroke: `var(--emo-${n})` });
    if (lower.includes('ansiedad') || lower.includes('enojo') || lower.includes('ira')) return emo('enojo');
    if (lower.includes('tristeza') || lower.includes('melancolía') || lower.includes('miedo')) return emo('tristeza');
    if (lower.includes('alegr') || lower.includes('felicidad')) return emo('alegria');
    if (lower.includes('calma') || lower.includes('tranquilidad')) return emo('calma');
    return emo('neutra');
  };

  const getIntensityProps = (intStr = '') => {
    const lower = String(intStr).toLowerCase();
    const int = (label, n) => ({ label, bg: `color-mix(in srgb, var(--int-${n}) 15%, transparent)`, color: `var(--int-${n})` });
    if (lower.includes('alta') || lower.includes('alto')) return int('Alta', 'alta');
    if (lower.includes('baja') || lower.includes('bajo')) return int('Baja', 'baja');
    return int('Media', 'media');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const fecha = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${fecha}, ${hora}`;
  };

  const pedirBorrar = (e, id) => {
    e.stopPropagation();
    setPorBorrar(id);
  };

  const confirmarBorrado = async () => {
    if (!porBorrar) return;
    setBorrando(true);
    try {
      await api.eliminarAnalisis(porBorrar);
      if (onDeleted) onDeleted(porBorrar);
      setPorBorrar(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setBorrando(false);
    }
  };

  return (
    <>
    <div className="dashboard-card sessions-card">
      <div className="card-header">
        <div>
          <div className="card-label">Registro de sesiones</div>
          <div className="card-title">Todos los análisis de {activeChildName || 'este niño'}</div>
        </div>
        {puedePdf() && (
          <button
            className="btn-outline-small"
            onClick={exportar}
            disabled={generando || sessions.length === 0}
            title={sessions.length === 0 ? 'Sin análisis para exportar' : 'Exportar estos análisis en PDF'}
            style={generando || sessions.length === 0 ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
          >
            {generando ? 'Generando…' : 'Exportar PDF'}
          </button>
        )}
      </div>
      <div className="sessions-body">
        {sessions.length === 0 ? (
          <div style={{padding: '30px', textAlign: 'center', color: 'var(--muted)'}}>
            No hay sesiones registradas para {activeChildName}.
          </div>
        ) : (
          sessions.map((session, i) => {
            const emocionPrincipal = session.resultado_ia?.emocion_predominante || 'Desconocida';
            const colors = getEmotionColor(emocionPrincipal);
            const intensity = getIntensityProps(session.resultado_ia?.intensidad);
            const dateObj = new Date(session.fecha);
            const isToday = new Date().toDateString() === dateObj.toDateString();
            const datePrefix = isToday ? 'Hoy · ' : '';

            return (
              <div
                key={session._id || i}
                className="session-row session-row-click"
                onClick={() => onSelect && onSelect(session)}
                title="Ver el dibujo y el análisis completo"
              >
                <div className="session-thumb" style={{padding: 0, overflow: 'hidden', background: '#f0f0f0'}}>
                  {session.ruta_imagen ? (
                    <AuthImage analisisId={session._id} alt="Dibujo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : '🖼️'}
                </div>
                <div className="session-info">
                  <div className="session-date">{datePrefix}{formatDate(session.fecha)}</div>
                  <div className="session-emotions">
                    <span className="e-chip" style={{background: colors.bg, color: colors.color}}>
                      {emocionPrincipal.charAt(0).toUpperCase() + emocionPrincipal.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="session-intensity">
                  <div className="intensity-label">Intensidad</div>
                  <div className="intensity-badge" style={{background: intensity.bg, color: intensity.color}}>
                    {intensity.label}
                  </div>
                </div>
                <button
                  className="session-delete"
                  title="Eliminar análisis"
                  onClick={(e) => pedirBorrar(e, session._id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
      <ConfirmDialog
        abierto={!!porBorrar}
        peligro
        titulo="Eliminar análisis"
        mensaje="¿Eliminar este análisis?"
        detalle="Esta acción no se puede deshacer."
        textoConfirmar="Eliminar"
        cargando={borrando}
        onConfirmar={confirmarBorrado}
        onCancelar={() => setPorBorrar(null)}
      />
    </>
  );
};

export default SessionsList;
