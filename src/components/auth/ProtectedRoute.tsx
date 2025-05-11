import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; 

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRole: 'employee' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Authenticating...</div>; 
  }

  if (!currentUser) {
    // No user is logged in (AuthContext has confirmed this, loading is false).
    // Redirect to the main login page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!currentUser.userType) {
    // User is authenticated with Firebase, but userType couldn't be determined from Firestore.
    // AuthContext should have logged them out, but as a safeguard, redirect to login.
    // This case should ideally be rare if AuthContext's logout-on-no-Firestore-match logic is working.
    console.warn("ProtectedRoute: currentUser exists but userType is undefined. Redirecting to login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser.userType !== allowedRole) {
    // User is logged in, but their role doesn't match the allowed role for this route.
    // Redirect them to their appropriate dashboard.
    const redirectTo = currentUser.userType === 'employee' ? '/employee-dashboard' : (currentUser.userType === 'admin' ? '/admin-dashboard' : '/');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;  
  }
  // Authenticated and authorized
  return children;
};

export default ProtectedRoute;