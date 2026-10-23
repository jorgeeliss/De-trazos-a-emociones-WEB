import { Navigate } from 'react-router-dom';
import { tokenVigente } from './api';

const ProtectedRoute = ({ children }) => {
  // Sin token, o con token inválido o expirado: no se entra.
  if (!tokenVigente()) {
    // Distinguimos "nunca inició sesión" de "la sesión expiró".
    const habiaToken = Boolean(localStorage.getItem('token'));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to={habiaToken ? '/login?expirado=1' : '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
