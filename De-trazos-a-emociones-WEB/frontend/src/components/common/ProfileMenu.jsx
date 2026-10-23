import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Repeat, Trash2, Camera, ChevronDown, AlertTriangle, Settings } from 'lucide-react';
import { api } from '../../api';
import './ProfileMenu.css';

const ROL_LABEL = {
  padre: 'Padre / Madre',
  psicologo: 'Psicólogo(a)',
  profesor: 'Profesor(a)',
};

const leerUsuarioLocal = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const ProfileMenu = () => {
  const navigate = useNavigate();
  const contRef = useRef(null);
  const fileRef = useRef(null);

  const [abierto, setAbierto] = useState(false);
  const [perfil, setPerfil] = useState(leerUsuarioLocal());
  const [fotoUrl, setFotoUrl] = useState(null);
  const [recargaFoto, setRecargaFoto] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [textoConfirm, setTextoConfirm] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Datos autoritativos del perfil.
  useEffect(() => {
    let activo = true;
    api
      .getPerfil()
      .then((p) => {
        if (activo) setPerfil((prev) => ({ ...prev, ...p }));
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  // Foto de perfil (blob con token).
  useEffect(() => {
    let activo = true;
    let objetoUrl;
    api
      .fetchFotoPerfil()
      .then((blob) => {
        if (!activo || !blob) return;
        objetoUrl = URL.createObjectURL(blob);
        setFotoUrl(objetoUrl);
      })
      .catch(() => {});
    return () => {
      activo = false;
      if (objetoUrl) URL.revokeObjectURL(objetoUrl);
    };
  }, [recargaFoto]);

  // Cerrar el menú al hacer clic fuera.
  useEffect(() => {
    const onClick = (e) => {
      if (contRef.current && !contRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const iniciales =
    ((perfil.nombre?.[0] || '') + (perfil.apellido?.[0] || '')).toUpperCase() || 'U';

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      await api.subirFotoPerfil(file);
      setPerfil((p) => ({ ...p, tieneFoto: true }));
      setRecargaFoto((n) => n + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubiendo(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const cerrarSesion = () => {
    api.logout();
    navigate('/login');
  };

  const eliminar = async () => {
    setProcesando(true);
    try {
      await api.eliminarCuenta();
      api.logout();
      navigate('/login');
    } catch (err) {
      alert(err.message);
      setProcesando(false);
    }
  };

  return (
    <div className="profile-menu" ref={contRef}>
      <button
        className="profile-trigger"
        onClick={() => setAbierto((v) => !v)}
        title="Mi cuenta"
      >
        <span className="profile-avatar">
          {fotoUrl ? <img src={fotoUrl} alt="Foto de perfil" /> : iniciales}
        </span>
        <ChevronDown size={16} className={`profile-chevron ${abierto ? 'open' : ''}`} />
      </button>

      {abierto && (
        <div className="profile-dropdown">
          <div className="profile-head">
            <span className="profile-avatar big">
              {fotoUrl ? <img src={fotoUrl} alt="Foto de perfil" /> : iniciales}
            </span>
            <div className="profile-head-info">
              <div className="profile-name">
                {perfil.nombre} {perfil.apellido || ''}
              </div>
              <div className="profile-email">{perfil.email}</div>
              {perfil.rol && (
                <div className="profile-rol">
                  {ROL_LABEL[perfil.rol] || perfil.rol}
                  {perfil.esAdmin ? ' · Administrador' : ''}
                </div>
              )}
            </div>
          </div>

          <input
            type="file"
            ref={fileRef}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />

          <button
            className="profile-item"
            onClick={() => fileRef.current?.click()}
            disabled={subiendo}
          >
            <Camera size={17} />
            {subiendo ? 'Subiendo…' : fotoUrl ? 'Cambiar foto' : 'Agregar foto'}
          </button>

          <button
            className="profile-item"
            onClick={() => {
              setAbierto(false);
              navigate('/configuracion');
            }}
          >
            <Settings size={17} />
            Configuración
          </button>

          <button className="profile-item" onClick={cerrarSesion}>
            <LogOut size={17} />
            Cerrar sesión
          </button>

          <button className="profile-item" onClick={cerrarSesion}>
            <Repeat size={17} />
            Cambiar de cuenta
          </button>

          <div className="profile-sep" />

          <button
            className="profile-item danger"
            onClick={() => {
              setAbierto(false);
              setTextoConfirm('');
              setConfirmarBorrado(true);
            }}
          >
            <Trash2 size={17} />
            Eliminar cuenta
          </button>
        </div>
      )}

      {confirmarBorrado && (
        <div className="profile-modal-overlay" onClick={() => !procesando && setConfirmarBorrado(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-icon">
              <AlertTriangle size={26} />
            </div>
            <h3>Eliminar cuenta</h3>
            <p>
              Esta acción es <strong>permanente</strong>. Se borrarán tu cuenta y
              todos tus análisis e imágenes. No se puede deshacer.
            </p>
            <p className="profile-modal-hint">
              Escribe <strong>ELIMINAR</strong> para confirmar:
            </p>
            <input
              type="text"
              className="profile-modal-input"
              value={textoConfirm}
              onChange={(e) => setTextoConfirm(e.target.value)}
              placeholder="ELIMINAR"
              autoFocus
            />
            <div className="profile-modal-actions">
              <button
                className="btn-cancelar"
                onClick={() => setConfirmarBorrado(false)}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                className="btn-eliminar"
                onClick={eliminar}
                disabled={textoConfirm !== 'ELIMINAR' || procesando}
              >
                {procesando ? 'Eliminando…' : 'Eliminar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
