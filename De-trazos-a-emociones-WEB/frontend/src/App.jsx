import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Analyzer from './pages/Analyzer';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import ProtectedRoute from './ProtectedRoute';
import { AnalisisSesionProvider } from './context/AnalisisSesionContext';
import AnalisisToast from './components/common/AnalisisToast';

function App() {
  return (
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
          </Routes>
      <AnalisisToast />
    </AnalisisSesionProvider>
        );
      }

      export default App;
