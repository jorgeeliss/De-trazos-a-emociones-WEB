import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, KeyRound, Eye, EyeOff, HelpCircle, Camera, Repeat, Trash2 } from 'lucide-react';
import BrandHeader from '../components/common/BrandHeader';
import Sidebar from '../components/layout/Sidebar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useTheme } from '../context/ThemeContext';
import { useTour } from '../context/TourContext';
import { api } from '../api';
import PasswordChecklist from '../components/common/PasswordChecklist';
import { passwordValida } from '../utils/password';
import './Configuracion.css';

const leerUsuarioLocal = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const ROL_LABEL = {
  padre: 'Padre / Madre',
  psicologo: 'Psicólogo(a)',
  profesor: 'Profesor(a)',
};

const Configuracion = () => {
  const { tema, setTema } = useTheme();
  const navigate = useNavigate();
  const { start: iniciarRecorrido } = useTour();

  const [pwd, setPwd] = useState({ actual: '', nueva: '', confirmar: '' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [guardandoPwd, setGuardandoPwd] = useState(false);
  const [verPwd, setVerPwd] = useState(false);
  const tipoPwd = verPwd ? 'text' : 'password';

  // Cuenta: foto de perfil, cambiar de cuenta y eliminar cuenta.
  const fileRef = useRef(null);
  const [perfil, setPerfil] = useState(leerUsuarioLocal);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [recargaFoto, setRecargaFoto] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [confirmarPaso, setConfirmarPaso] = useState(0); // 0 nada · 1 aviso · 2 confirmación final
  const [eliminando, setEliminando] = useState(false);

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

  // Datos frescos del perfil (rol y permisos) para mostrarlos en la cuenta.
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

  const iniciales =
    ((perfil.nombre?.[0] || '') + (perfil.apellido?.[0] || '')).toUpperCase() || 'U';

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      await api.subirFotoPerfil(file);
      setRecargaFoto((n) => n + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubiendo(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const cambiarDeCuenta = () => {
    api.logout();
    navigate('/login');
  };

  const eliminarCuenta = async () => {
    setEliminando(true);
    try {
      await api.eliminarCuenta();
      api.logout();
      navigate('/login');
    } catch (err) {
      alert(err.message);
      setEliminando(false);
      setConfirmarPaso(0);
    }
  };

  const onPwd = (e) => setPwd((p) => ({ ...p, [e.target.name]: e.target.value }));

  const cambiarPassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (!passwordValida(pwd.nueva)) {
      setPwdMsg({ tipo: 'error', texto: 'La nueva contraseña no cumple los requisitos de seguridad.' });
      return;
    }
    if (pwd.nueva !== pwd.confirmar) {
      setPwdMsg({ tipo: 'error', texto: 'La confirmación no coincide con la nueva contraseña.' });
      return;
    }
    setGuardandoPwd(true);
    try {
      await api.cambiarPassword(pwd.actual, pwd.nueva);
      setPwdMsg({ tipo: 'ok', texto: 'Contraseña actualizada correctamente.' });
      setPwd({ actual: '', nueva: '', confirmar: '' });
    } catch (err) {
      setPwdMsg({ tipo: 'error', texto: err.message });
    } finally {
      setGuardandoPwd(false);
    }
  };

  const esOscuro = tema === 'dark';

  return (
    <div className="config-page">
      <Sidebar />
      <div className="config-container">
        <BrandHeader />

        <h1 className="config-title" data-tour="config">Configuración</h1>

        <section className="config-section">
          <div className="cuenta-top">
            <h2>Cuenta</h2>
            <label className="tema-switch" title="Cambiar entre tema claro y oscuro">
              <span className="tema-switch-label">
                {esOscuro ? <Moon size={16} /> : <Sun size={16} />}
                {esOscuro ? 'Oscuro' : 'Claro'}
              </span>
              <span className="switch">
                <input
                  type="checkbox"
                  checked={esOscuro}
                  onChange={(e) => setTema(e.target.checked ? 'dark' : 'light')}
                  aria-label="Tema oscuro"
                />
                <span className="switch-slider"></span>
              </span>
            </label>
          </div>

          <div className="cuenta-foto">
            <span className="cuenta-avatar">
              {fotoUrl ? <img src={fotoUrl} alt="Foto de perfil" /> : iniciales}
            </span>
            <div className="cuenta-foto-info">
              <div className="cuenta-nombre">{perfil.nombre} {perfil.apellido || ''}</div>
              <div className="cuenta-email">{perfil.email}</div>
              <div className="cuenta-chips">
                <span className="cuenta-chip">{ROL_LABEL[perfil.rol] || perfil.rol || 'Sin rol'}</span>
                {perfil.esAdmin ? (
                  <span className="cuenta-chip admin">Administrador</span>
                ) : (
                  <>
                    {perfil.permisos?.conContexto && <span className="cuenta-chip">Análisis con contexto</span>}
                    {perfil.permisos?.descargarPdf && <span className="cuenta-chip">Descargar PDF</span>}
                    {!perfil.permisos?.conContexto && <span className="cuenta-chip">Solo dibujos sueltos</span>}
                  </>
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
            <button type="button" className="pwd-btn" onClick={() => fileRef.current?.click()} disabled={subiendo}>
              <Camera size={16} /> {subiendo ? 'Subiendo…' : fotoUrl ? 'Cambiar foto' : 'Agregar foto'}
            </button>
          </div>

          <div className="cuenta-acciones">
            <button type="button" className="pwd-btn" onClick={cambiarDeCuenta}>
              <Repeat size={16} /> Cambiar de cuenta
            </button>
            <button type="button" className="cuenta-eliminar" onClick={() => setConfirmarPaso(1)}>
              <Trash2 size={16} /> Eliminar cuenta
            </button>
          </div>

          <div className="cuenta-seguridad">
            <h3>Seguridad · cambiar contraseña</h3>
            <form className="pwd-form" onSubmit={cambiarPassword}>
              <div className="pwd-field">
                <input
                  type={tipoPwd}
                  name="actual"
                  className="pwd-input"
                  placeholder="Contraseña actual"
                  value={pwd.actual}
                  onChange={onPwd}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pwd-eye" onClick={() => setVerPwd((v) => !v)} aria-label={verPwd ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}>
                  {verPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="pwd-field">
                <input
                  type={tipoPwd}
                  name="nueva"
                  className="pwd-input"
                  placeholder="Nueva contraseña"
                  value={pwd.nueva}
                  onChange={onPwd}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="pwd-eye" onClick={() => setVerPwd((v) => !v)} aria-label={verPwd ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}>
                  {verPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <p className="pwd-hint">Debe tener mínimo 8 caracteres, con mayúscula, minúscula, número y un símbolo.</p>
              <PasswordChecklist password={pwd.nueva} />

              <div className="pwd-field">
                <input
                  type={tipoPwd}
                  name="confirmar"
                  className="pwd-input"
                  placeholder="Confirmar nueva contraseña"
                  value={pwd.confirmar}
                  onChange={onPwd}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="pwd-eye" onClick={() => setVerPwd((v) => !v)} aria-label={verPwd ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}>
                  {verPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {pwdMsg && <div className={`pwd-msg ${pwdMsg.tipo}`}>{pwdMsg.texto}</div>}
              <button type="submit" className="pwd-btn" disabled={guardandoPwd}>
                <KeyRound size={16} /> {guardandoPwd ? 'Guardando…' : 'Actualizar contraseña'}
              </button>
            </form>
          </div>
        </section>

        <section className="config-section">
          <h2>Ayuda</h2>
          <button type="button" className="pwd-btn" onClick={iniciarRecorrido}>
            <HelpCircle size={16} /> Ver recorrido guiado
          </button>
        </section>

        <p className="config-nota">
          El tema se guarda en este dispositivo y se conserva al cerrar sesión.
        </p>
      </div>

      <ConfirmDialog
        abierto={confirmarPaso === 1}
        peligro
        titulo="Eliminar cuenta"
        mensaje="Se borrarán tu cuenta y todos tus análisis e imágenes."
        detalle="Es permanente y no se puede deshacer."
        textoConfirmar="Continuar"
        onConfirmar={() => setConfirmarPaso(2)}
        onCancelar={() => setConfirmarPaso(0)}
      />
      <ConfirmDialog
        abierto={confirmarPaso === 2}
        peligro
        titulo="Confirmar eliminación"
        mensaje="¿Seguro que quieres eliminar tu cuenta definitivamente?"
        detalle="Esta acción no se puede deshacer."
        textoConfirmar="Eliminar definitivamente"
        cargando={eliminando}
        onConfirmar={eliminarCuenta}
        onCancelar={() => setConfirmarPaso(0)}
      />
    </div>
  );
};

export default Configuracion;
