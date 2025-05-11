import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import QuizTaker from './pages/QuizTaker';
import CertificateViewer from './pages/CertificateViewer';
 
const AppContent = () => {
  // This component will now have access to the auth context
  // The old direct localStorage checks for routing can be replaced by logic in ProtectedRoute
  // and by checking currentUser from useAuth() if needed for specific redirect logic inside components.
  const { currentUser, loading } = useAuth(); // Get currentUser from new context
  
  return (
    <>
      <Toaster richColors position="top-right" /> {/* Global Toaster for notifications */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
         
        
        {/* Protected Employee Routes */}
        <Route 
          path="/employee-dashboard" 
          element={
            <ProtectedRoute allowedRole="employee">
                             <EmployeeDashboard key={currentUser?.uid || 'employee_logged_out'} />
               </ProtectedRoute>
          } 
        />
        <Route 
          path="/training-viewer/:videoId" 
          element={
            <ProtectedRoute allowedRole="employee">
                           <TrainingViewer key={currentUser?.uid || 'employee_viewer_logged_out'} />
               </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
               <AdminDashboard key={currentUser?.uid || 'admin_logged_out'} />
              </ProtectedRoute>
          } 
        />
        {/* Protected Quiz Taker Route */}
         <Route
          path="/quiz/:quizId" 
          element={
            <ProtectedRoute allowedRole="employee">
            <QuizTaker key={currentUser?.uid || 'quiz_taker_logged_out'} />
           </ProtectedRoute>
          }
          />
        {/* Protected Certificate Viewer Route */}
        <Route
          path="/certificate/:certificateId" 
          element={
            <ProtectedRoute allowedRole="employee">
               <CertificateViewer key={currentUser?.uid || 'cert_viewer_logged_out'} />
              </ProtectedRoute>
          }
          />

        {/* Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
       </>
  );
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;