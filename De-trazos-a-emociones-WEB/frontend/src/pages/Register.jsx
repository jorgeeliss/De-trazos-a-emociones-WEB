import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, Clock } from 'lucide-react';
import AuthGraphics from '../components/auth/AuthGraphics';
import Logo from '../components/common/Logo';
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
    rol: ''
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
        title="Acompaña el mundo emocional de cada niño"
        highlight="emocional"
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
            <p>Completa tus datos para empezar.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstname">Nombre</label>
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
                <label htmlFor="lastname">Apellido</label>
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
                  value={formData.email}
                  onChange={handleChange}
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
              <label htmlFor="role">Rol</label>
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
