import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye } from 'lucide-react';
import AuthGraphics from '../components/auth/AuthGraphics';
import './AuthCommon.css';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos al backend y crear la cuenta
    navigate('/login');
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

          <div className="form-header">
            <h1>SIGN UP</h1>
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
                    id="firstname" 
                    placeholder="Ej: Laura" 
                    required 
                    value={formData.firstname}
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
                    id="lastname" 
                    placeholder="Ej: Gómez" 
                    required 
                    value={formData.lastname}
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
                  type="password" 
                  id="password" 
                  placeholder="Mínimo 8 caracteres" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="eye-icon">
                  <Eye size={20} />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="role">ROL</label>
              <div className="input-wrapper">
                <select 
                  id="role" 
                  className="role-select" 
                  required
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="" disabled>Selecciona tu rol</option>
                  <option value="padre">Padre / Madre</option>
                  <option value="psicologo">Psicólogo(a)</option>
                  <option value="profesor">Profesor(a)</option>
                </select>
              </div>
            </div>

            <label className="checkbox-group">
              <input type="checkbox" required />
              <span>Acepto los <a href="#">Términos y Condiciones</a> y la <a href="#">Política de Privacidad</a> de De trazos a emociones.</span>
            </label>

            <button type="submit" className="btn-submit">
              Crear cuenta
            </button>
          </form>

          <div className="form-footer">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
