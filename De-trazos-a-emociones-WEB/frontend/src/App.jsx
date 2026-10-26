import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Analyzer from './pages/Analyzer';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import Admin from './pages/Admin';
import Configuracion from './pages/Configuracion';
import Reportes from './pages/Reportes';
import Ninos from './pages/Ninos';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import { ThemeProvider } from './context/ThemeContext';
import { TourProvider } from './context/TourContext';
import { AnalisisSesionProvider } from './context/AnalisisSesionContext';
import AnalisisToast from './components/common/AnalisisToast';

function App() {
  return (
    <ThemeProvider>
    <TourProvider>
    <AnalisisSesionProvider>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/terminos" element={<Terminos />} />
      <Route path="/privacidad" element={<Privacidad />} />
      <Route
      path="/app"
      element={
        <ProtectedRoute>
          <Analyzer />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/historial"
      element={
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      }
      />

    <Route
      path="/admin"
      element={
        <AdminRoute>
          <Admin />
        </AdminRoute>
      }
      />

    <Route
      path="/configuracion"
      element={
        <ProtectedRoute>
          <Configuracion />
        </ProtectedRoute>
      }
      />

    <Route
      path="/reportes"
      element={
        <ProtectedRoute>
          <Reportes />
        </ProtectedRoute>
      }
      />

    <Route
      path="/ninos"
      element={
        <ProtectedRoute>
          <Ninos />
        </ProtectedRoute>
      }
      />
          </Routes>
      <AnalisisToast />
    </AnalisisSesionProvider>
    </TourProvider>
    </ThemeProvider>
        );
      }

      export default App;
