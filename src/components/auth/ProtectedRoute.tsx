import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRole: 'employee' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userType = localStorage.getItem('userType') as 'employee' | 'admin' | null;
  const location = useLocation();

  if (!isAuthenticated) {
    // User not authenticated, redirect to general login page.
    // Save the intended location to redirect after successful login.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (userType !== allowedRole) {
    // Authenticated, but wrong role.
    // Redirect to their respective dashboard based on their actual userType.
    if (userType === 'employee') {
      return <Navigate to="/employee-dashboard" replace />;
    } else if (userType === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      // Fallback: Invalid userType, clear auth and redirect to login.
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userType');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // Authenticated and authorized
  return children;
};

export default ProtectedRoute;