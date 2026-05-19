import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Analyzer from './pages/Analyzer';
import Dashboard from './pages/Dashboard';
import History from './pages/History';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<Analyzer />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/historial" element={<History />} />
    </Routes>
  );
}

export default App;
