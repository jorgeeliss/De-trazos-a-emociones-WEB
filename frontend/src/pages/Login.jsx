import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, CheckCircle } from 'lucide-react';
import AuthGraphics from '../components/auth/AuthGraphics';
import './AuthCommon.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simular autenticación exitosa
    navigate('/app');
  };

  return (
    <div className="auth-container">
      {/* Panel Izquierdo - Gráficos */}
      <AuthGraphics 
        title="Descubre el mundo emocional de cada niño" 
        highlight="emocional" 
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
            <h1>SIGN IN</h1>
            <p>Inicia sesión con tu correo electrónico</p>
          </div>

          <form onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">
              Iniciar sesión
            </button>
          </form>

          <div className="form-footer">
            ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
