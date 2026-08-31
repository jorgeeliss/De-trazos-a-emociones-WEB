import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Analyzer from './pages/Analyzer';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
        );
      }

      export default App;
