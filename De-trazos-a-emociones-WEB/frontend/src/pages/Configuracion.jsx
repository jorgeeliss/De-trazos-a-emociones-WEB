import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Check, KeyRound, Eye, EyeOff, HelpCircle } from 'lucide-react';
import BrandHeader from '../components/common/BrandHeader';
import { useTheme } from '../context/ThemeContext';
import { useTour } from '../context/TourContext';
import { api } from '../api';
import PasswordChecklist from '../components/common/PasswordChecklist';
import { passwordValida } from '../utils/password';
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

  const [pwd, setPwd] = useState({ actual: '', nueva: '', confirmar: '' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [guardandoPwd, setGuardandoPwd] = useState(false);
  const [verPwd, setVerPwd] = useState(false);
  const tipoPwd = verPwd ? 'text' : 'password';

  const { start: iniciarRecorrido } = useTour();

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

  return (
    <div className="config-page">
      <div className="config-container">
        <BrandHeader />

        <button className="config-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Volver
        </button>

        <h1 className="config-title" data-tour="config">Configuración</h1>
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

        <section className="config-section">
          <h2>Cambiar contraseña</h2>
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
        </section>

        <section className="config-section">
          <h2>Ayuda</h2>
          <button type="button" className="pwd-btn" onClick={iniciarRecorrido}>
            <HelpCircle size={16} /> Ver recorrido guiado
          </button>
        </section>

        <p className="config-nota">
          Tu tema y paleta se guardan en este dispositivo.
        </p>
      </div>
    </div>
  );
};

export default Configuracion;
