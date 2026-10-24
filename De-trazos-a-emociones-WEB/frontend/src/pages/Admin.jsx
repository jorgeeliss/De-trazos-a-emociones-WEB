import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Check, X, ArrowLeft, Inbox, RefreshCw, Ban, Trash2 } from 'lucide-react';
import { api } from '../api';
import './Admin.css';

const FILTROS = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobado', label: 'Aprobados' },
  { key: 'rechazado', label: 'Rechazados' },
];

const ROL_LABEL = {
  padre: 'Padre / Madre',
  psicologo: 'Psicólogo(a)',
  profesor: 'Profesor(a)',
};

const Admin = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('pendiente');
  const [recargas, setRecargas] = useState(0);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    let activo = true;
    const t = setTimeout(async () => {
      setCargando(true);
      setError('');
      try {
        const data = await api.getSolicitudes(filtro);
        if (activo) setUsuarios(data);
      } catch (e) {
        if (activo) {
          setError(e.message);
          setUsuarios([]);
        }
      } finally {
        if (activo) setCargando(false);
      }
    }, 0);
    return () => {
      activo = false;
      clearTimeout(t);
    };
  }, [filtro, recargas]);

  const resolver = async (id, accion) => {
    setProcesando(id);
    try {
      await api.resolverSolicitud(id, accion);
      // Cambió de estado: se quita de la lista actual.
      setUsuarios((prev) => prev.filter((u) => u._id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setProcesando(null);
    }
  };

  const eliminar = async (u) => {
    const ok = window.confirm(
      `¿Eliminar la cuenta de ${u.nombre} ${u.apellido} (${u.email})? ` +
        'Se borrarán también todos sus análisis. Esta acción no se puede deshacer.'
    );
    if (!ok) return;
    setProcesando(u._id);
    try {
      await api.eliminarUsuario(u._id);
      setUsuarios((prev) => prev.filter((x) => x._id !== u._id));
    } catch (e) {
      alert(e.message);
    } finally {
      setProcesando(null);
    }
  };

  const formatFecha = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-title">
            <div className="admin-badge">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1>Administración de registros</h1>
              <p>Aprueba o rechaza las cuentas nuevas</p>
            </div>
          </div>
          <button className="admin-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Volver
          </button>
        </div>

        <div className="admin-tabs">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              className={`admin-tab ${filtro === f.key ? 'active' : ''}`}
              onClick={() => setFiltro(f.key)}
            >
              {f.label}
            </button>
          ))}
          <button
            className="admin-refresh"
            title="Actualizar"
            onClick={() => setRecargas((n) => n + 1)}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {cargando ? (
          <div className="admin-empty">Cargando…</div>
        ) : usuarios.length === 0 ? (
          <div className="admin-empty">
            <Inbox size={40} />
            <p>
              No hay cuentas{' '}
              {filtro === 'pendiente'
                ? 'pendientes'
                : filtro === 'aprobado'
                ? 'aprobadas'
                : 'rechazadas'}
              .
            </p>
          </div>
        ) : (
          <div className="admin-list">
            {usuarios.map((u) => (
              <div key={u._id} className="admin-card">
                <div className="admin-card-main">
                  <div className="admin-card-name">
                    {u.nombre} {u.apellido}
                  </div>
                  <div className="admin-card-email">{u.email}</div>
                  <div className="admin-card-meta">
                    <span className="admin-chip">{ROL_LABEL[u.rol] || u.rol}</span>
                    {u.institucion ? (
                      <span className="admin-chip inst">{u.institucion}</span>
                    ) : (
                      <span className="admin-chip vacio">Sin institución</span>
                    )}
                    <span className="admin-fecha">{formatFecha(u.createdAt)}</span>
                  </div>
                </div>

                <div className="admin-actions">
                  {filtro === 'pendiente' && (
                    <>
                      <button className="btn-aprobar" disabled={procesando === u._id} onClick={() => resolver(u._id, 'aprobar')}>
                        <Check size={16} /> Aprobar
                      </button>
                      <button className="btn-rechazar" disabled={procesando === u._id} onClick={() => resolver(u._id, 'rechazar')}>
                        <X size={16} /> Rechazar
                      </button>
                    </>
                  )}
                  {filtro === 'aprobado' && (
                    <button className="btn-rechazar" disabled={procesando === u._id} onClick={() => resolver(u._id, 'rechazar')}>
                      <Ban size={16} /> Deshabilitar
                    </button>
                  )}
                  {filtro === 'rechazado' && (
                    <button className="btn-aprobar" disabled={procesando === u._id} onClick={() => resolver(u._id, 'aprobar')}>
                      <Check size={16} /> Habilitar
                    </button>
                  )}
                  <button className="btn-eliminar-admin" disabled={procesando === u._id} onClick={() => eliminar(u)}>
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
