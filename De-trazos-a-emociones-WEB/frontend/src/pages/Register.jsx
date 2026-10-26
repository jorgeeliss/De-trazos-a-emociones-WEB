import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Building2, CheckCircle, Clock } from 'lucide-react';
import AuthGraphics from '../components/auth/AuthGraphics';
import './AuthCommon.css';
import './Register.css';
import { api } from '../api';
import PasswordChecklist from '../components/common/PasswordChecklist';
import { passwordValida } from '../utils/password';

const Register = () => {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);
  const [verPassword, setVerPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: '',
    institucion: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        if (!passwordValida(formData.password)) {
          alert('La contraseña no cumple los requisitos de seguridad.');
          return;
        }

        const data = await api.register(formData);
        setResultado({
          estado: data.estado || 'pendiente',
          message: data.message || 'Registro recibido.'
        });
      } catch (error) {
        alert(error.message);
      }
    };

  return (
    <div className="auth-container">
      {/* Panel Izquierdo - Gráficos */}
      <AuthGraphics 
        title="Comienza tu viaje hacia las emociones" 
        highlight="emociones" 
        subtitle="Psicología infantil · Análisis profundo" 
      />

      {/* Panel Derecho - Formulario */}
      <div className="right-panel">
        <div className="form-container">
          
          <div className="brand">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div className="brand-text">
              <h2>De trazos a emociones</h2>
              <p>PSICOLOGÍA INFANTIL</p>
            </div>
          </div>

          {resultado ? (
            <div className="register-success">
              <div className={`success-icon ${resultado.estado === 'aprobado' ? 'ok' : 'wait'}`}>
                {resultado.estado === 'aprobado' ? <CheckCircle size={44} /> : <Clock size={44} />}
              </div>
              <h1>{resultado.estado === 'aprobado' ? 'Cuenta creada' : 'Registro recibido'}</h1>
              <p className="success-msg">{resultado.message}</p>
              <p className="success-hint">
                {resultado.estado === 'aprobado'
                  ? 'Ya puedes iniciar sesión con tu correo y contraseña.'
                  : 'Cuando el administrador apruebe tu cuenta podrás iniciar sesión. La verificación de la autorización del representante legal la realiza la institución o entidad profesional.'}
              </p>
              <button type="button" className="btn-submit" onClick={() => navigate('/login')}>
                Ir a iniciar sesión
              </button>
            </div>
          ) : (
          <>
          <div className="form-header">
            <h1>Crear cuenta</h1>
            <p>Crea tu cuenta y empieza el análisis</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstname">NOMBRE</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <User size={20} />
                  </div>
                    <input 
                      type="text" 
                      id="nombre"
                      placeholder="Ej: Laura" 
                      required 
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lastname">APELLIDO</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    id="apellido"
                    placeholder="Ej: Gómez" 
                    required 
                    value={formData.apellido}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">CORREO ELECTRÓNICO</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="nombre@correo.com" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">CONTRASEÑA</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Lock size={20} />
                </div>
                <input
                  type={verPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Contraseña segura"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="eye-icon"
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="input-hint">Mínimo 8 caracteres, con mayúscula, minúscula, número y un símbolo.</p>
              <PasswordChecklist password={formData.password} />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">ROL</label>
              <div className="input-wrapper">
              <select 
                id="rol"
                className="role-select" 
                required
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Selecciona tu rol
                </option>

                <option value="padre">
                  Padre / Madre
                </option>

                <option value="psicologo">
                  Psicólogo(a)
                </option>

                <option value="profesor">
                  Profesor(a)
                </option>
              </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="institucion">INSTITUCIÓN O ENTIDAD</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Building2 size={20} />
                </div>
                <input
                  type="text"
                  id="institucion"
                  placeholder="Colegio, consultorio o entidad (si aplica)"
                  value={formData.institucion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className="checkbox-group">
              <input type="checkbox" required />
              <span>Acepto los <a href="/terminos" target="_blank" rel="noreferrer">Términos y Condiciones</a> y la <a href="/privacidad" target="_blank" rel="noreferrer">Política de Privacidad</a> de De trazos a emociones.</span>
            </label>

            <button type="submit" className="btn-submit">
              Crear cuenta
            </button>
          </form>

          <div className="form-footer">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </div>
          </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
