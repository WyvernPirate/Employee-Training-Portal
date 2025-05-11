
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth method
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/firebaseConfig'; // Import auth from your Firebase config
import { useAuth } from '@/contexts/AuthContext'; // Import your Auth context

const EmployeeLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
     // This effect runs when currentUser (from AuthContext) or authLoading changes.
    // If AuthContext is done loading AND a currentUser exists with the 'employee' userType,
    // it means either the user was already logged in or just successfully logged in
    // and AuthContext has processed them.
  if (!authLoading && currentUser) {
       if (currentUser.userType === 'employee') { // Ensure userType is also checked
        const from = location.state?.from?.pathname || '/employee-dashboard';
        console.log("EmployeeLogin useEffect: Navigating to", from, "currentUser:", currentUser);
        navigate(from, { replace: true });
       } // No explicit redirect here if userType is admin, as they shouldn't be on this page.
        // ProtectedRoute for /admin-dashboard would handle an admin trying to access employee areas.
    }
  }, [currentUser, authLoading, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.dismiss(); // Clear previous toasts
    
     try {
      await signInWithEmailAndPassword(auth, email, password);
       // DO NOT navigate here.
      // onAuthStateChanged in AuthContext will update currentUser.
      // The useEffect above will then handle navigation.
      toast.success('Login attempt successful! Redirecting...');
       } catch (error: any) {
      console.error("Firebase employee login error:", error);
      toast.error(error.message || 'Invalid credentials or login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If auth is still loading, show a loading indicator.
  // This prevents rendering the form and then immediately redirecting if currentUser is already set.
  if (authLoading) {
   // Also, if currentUser is already set and is an employee, this component will redirect via useEffect.
    // So, this loading state is primarily for the initial load of AuthContext.
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
          <div className="bg-[#ea384c] py-4">
            <h2 className="text-2xl font-bold text-white text-center">Employee Login</h2>
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
                  placeholder="your.email@company.com"
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
                className="w-full bg-[#ea384c] hover:bg-[#d9293d] text-white"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          {/* <div className="mt-4 text-center">
               <p className="text-sm text-gray-600">Don't have an account? <a href="/register" className="text-[#ea384c] hover:underline">Register</a></p>
            </div> */}
          </div> 
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
