import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

import Index from './pages/Index';
import Login from './pages/EmployeeLogin';
import AdminLogin from './pages/AdminLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TrainingViewer from './pages/TrainingViewer';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EmployeeRegister from './pages/EmployeeRegister';
import QuizTaker from './pages/QuizTaker';
import CertificateViewer from './pages/CertificateViewer';
 
// Helper to get current auth status
const useAuth = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userType = localStorage.getItem('userType') as 'employee' | 'admin' | null;
  return { isAuthenticated, userType };
};

const App = () => {
  const { isAuthenticated, userType } = useAuth();

  return (
    <Router>
      <Toaster richColors position="top-right" /> {/* Global Toaster for notifications */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated && userType === 'employee' ? <Navigate to="/employee-dashboard" replace /> :
            isAuthenticated && userType === 'admin' ? <Navigate to="/admin-dashboard" replace /> : // Admins accidentally on /login
            <Login />
          } 
        />
        <Route 
          path="/admin-login" 
          element={
            isAuthenticated && userType === 'admin' ? <Navigate to="/admin-dashboard" replace /> :
            isAuthenticated && userType === 'employee' ? <Navigate to="/employee-dashboard" replace /> : // Employees accidentally on /admin-login
            <AdminLogin />
          } 
        />
        <Route 
          path="/register" 
          element={ // If already logged in, redirect to their dashboard
            isAuthenticated && userType === 'employee' ? <Navigate to="/employee-dashboard" replace /> :
            isAuthenticated && userType === 'admin' ? <Navigate to="/admin-dashboard" replace /> :
            <EmployeeRegister />
          } 
        />
        
        {/* Protected Employee Routes */}
        <Route 
          path="/employee-dashboard" 
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/training-viewer/:videoId" 
          element={
            <ProtectedRoute allowedRole="employee">
              <TrainingViewer />
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        {/* Protected Quiz Taker Route */}
         <Route
          path="/quiz/:quizId" // This is the important part
          element={
            <ProtectedRoute allowedRole="employee">
              <QuizTaker />
            </ProtectedRoute>
          }
          />
        {/* Protected Certificate Viewer Route */}
        <Route
          path="/certificate/:certificateId" // This is the important part
          element={
            <ProtectedRoute allowedRole="employee">
              <CertificateViewer />
            </ProtectedRoute>
          }
          />

        {/* Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;