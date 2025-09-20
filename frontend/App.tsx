import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { VisitorDashboard } from './components/dashboard/VisitorDashboard';
import { SafetyMetrics } from './components/qshe/SafetyMetrics';
import { MedicalReports } from './components/qshe/MedicalReports';
import { VisitorRequests } from './components/security/VisitorRequests';
import { CompetencyMatrix } from './components/security/CompetencyMatrix';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardRouter />} />
              <Route path="qshe/safety-metrics" element={<SafetyMetrics />} />
              <Route path="qshe/medical-reports" element={<MedicalReports />} />
              <Route path="security/visitor-requests" element={<VisitorRequests />} />
              <Route path="security/competency" element={<CompetencyMatrix />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </div>
  );
}

function DashboardRouter() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <VisitorDashboard />;
}
