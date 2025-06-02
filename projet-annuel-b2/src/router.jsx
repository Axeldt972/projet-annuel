import { Routes, Route, Navigate } from 'react-router-dom';
import SignalementPage from './pages/SignalementPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import PlanPage from './pages/PlanPage';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilPage from './pages/ProfilPage';

export default function AppRouter() {
  return (
    <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signalement" element={<SignalementPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["admin", "technique"]}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPage />
          </ProtectedRoute>
        } />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/profil" element={
          <ProtectedRoute allowedRoles={["admin", "technique", "utilisateur"]}>
            <ProfilPage />
          </ProtectedRoute>
        } />
      </Routes>
  );
}
