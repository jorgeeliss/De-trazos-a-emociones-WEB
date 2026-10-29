import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound } from 'lucide-react';
import AuthGraphics from '../components/auth/AuthGraphics';
import Logo from '../components/common/Logo';
import './AuthCommon.css';
import { api } from '../api';
import { useAnalisisSesion } from '../context/AnalisisSesionContext';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sesionExpirada = searchParams.get('expirado') === '1';
  const { nuevaSesion } = useAnalisisSesion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Paso de verificación (DEMO): tras la contraseña se pide un código de 6 dígitos.
  // Por ahora CUALQUIER código de 6 dígitos es válido; el envío real por correo
  // (2FA de verdad) queda como mejora futura.
  const [paso, setPaso] = useState(1);
  const [datosLogin, setDatosLogin] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.login({ email, password });
      setDatosLogin(data);
      setCodigo('');
      setErrorCodigo('');
      setPaso(2);
    } catch (error) {
      alert(error.message);
    }
  };

  const verificarCodigo = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(codigo)) {
      setErrorCodigo('Ingresa el código de 6 dígitos.');
      return;
    }
    // DEMO: no se valida contra un código real; cualquier código de 6 dígitos entra.
    localStorage.setItem('token', datosLogin.token);
    if (datosLogin.usuario) {
      localStorage.setItem('user', JSON.stringify(datosLogin.usuario));
    }
    nuevaSesion();
    navigate('/app');
  };

  return (
    <div className="auth-container">
      {/* Panel Izquierdo - Gráficos */}
      <AuthGraphics
        title="Cada dibujo guarda una emoción"
        highlight="emoción"
        subtitle="Una lectura orientativa de los dibujos infantiles, interpretada con el contexto de cada niño. Acompaña tu criterio, no lo reemplaza."
      />

      {/* Panel Derecho - Formulario */}
      <div className="right-panel">
        <div className="form-container">

          <div className="brand">
            <div className="brand-icon">
              <Logo size={36} />
            </div>
            <div className="brand-text">
              <h2>De trazos a emociones</h2>
              <p>PSICOLOGÍA INFANTIL</p>
            </div>
          </div>

          {paso === 1 ? (
            <>
              <div className="form-header">
                <h1>Iniciar sesión</h1>
                <p>Ingresa con tu correo y contraseña para continuar.</p>
              </div>

              {sesionExpirada && (
                <div className="auth-aviso" role="alert">
                  Tu sesión expiró por seguridad. Vuelve a iniciar sesión.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      placeholder="nombre@correo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <Lock size={20} />
                    </div>
                    <input
                      type="password"
                      id="password"
                      placeholder="••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-submit">
                  Continuar
                </button>
              </form>

              <div className="form-footer">
                ¿Aún no tienes cuenta? <Link to="/register">Crear cuenta</Link>
              </div>
            </>
          ) : (
            <>
              <div className="form-header">
                <h1>Verificación en dos pasos</h1>
                <p>Ingresa el código de 6 dígitos para continuar</p>
              </div>

              <div className="auth-aviso" role="status">
                Demo: por ahora cualquier código de 6 dígitos funciona. El envío real del código por correo queda como mejora futura.
              </div>

              <form onSubmit={verificarCodigo}>
                <div className="form-group">
                  <label htmlFor="codigo">Código de verificación</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <KeyRound size={20} />
                    </div>
                    <input
                      type="text"
                      id="codigo"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="— — — — — —"
                      required
                      value={codigo}
                      onChange={(e) => {
                        setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setErrorCodigo('');
                      }}
                    />
                  </div>
                  {errorCodigo && (
                    <p className="input-hint" style={{ color: '#fca5a5' }}>{errorCodigo}</p>
                  )}
                </div>

                <button type="submit" className="btn-submit">
                  Verificar y entrar
                </button>
              </form>

              <div className="form-footer">
                <button
                  type="button"
                  onClick={() => { setPaso(1); setDatosLogin(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                >
                  ← Volver
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
