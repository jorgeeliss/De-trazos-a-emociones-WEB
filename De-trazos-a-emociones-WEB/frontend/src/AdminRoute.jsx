import { Navigate } from 'react-router-dom';
import { tokenVigente } from './api';

const AdminRoute = ({ children }) => {
  // Igual que ProtectedRoute: sin sesión válida, fuera.
  if (!tokenVigente()) {
    const habiaToken = Boolean(localStorage.getItem('token'));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to={habiaToken ? '/login?expirado=1' : '/login'} replace />;
  }

  // Además, debe ser administrador.
  let esAdmin;
  try {
    esAdmin = JSON.parse(localStorage.getItem('user') || '{}').esAdmin === true;
  } catch {
    esAdmin = false;
  }

  if (!esAdmin) {
    return <Navigate to="/app" replace />;
  }

  return children;
};

export default AdminRoute;
