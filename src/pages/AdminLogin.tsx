import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, loading: authLoading, logout: authLogout } = useAuth();

  useEffect(() => {
    if (!authLoading && currentUser) {
     if (currentUser.userType === 'admin') { // Correct user type for this page
        const from = location.state?.from?.pathname || '/admin-dashboard';
        console.log("AdminLogin useEffect: Navigating to", from, "currentUser:", currentUser);
        navigate(from, { replace: true });
      } else {
        // Incorrect user type for this page, or userType is undefined
        toast.error("Access Denied. This login is for administrators only.");
        console.log("AdminLogin useEffect: Mismatched userType or undefined. Logging out. currentUser:", currentUser);
        authLogout(); // Log out the Firebase session
        // User remains on the admin login page as currentUser will become null
      } 
    }
 }, [currentUser, authLoading, navigate, location.state, authLogout]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.dismiss(); // Clear previous toasts
    
    try {
      // 1. Query Firestore for the admin user by email
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login attempt successful! Redirecting...');
      // Navigation is handled by the useEffect hook
    } catch (error: any) {
      console.error("Firebase admin login error:", error);
      toast.error(error.message || 'Invalid credentials or login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Checking authentication...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#000000] text-white p-4">
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white hover:text-gray-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-black py-4">
            <h2 className="text-2xl font-bold text-white text-center">Administrator Login</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-xs text-[#ea384c] hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login as Administrator"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
