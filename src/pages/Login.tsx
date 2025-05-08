
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login (in a real app, this would be an API call)
    setTimeout(() => {
      setIsLoading(false);
      const from = location.state?.from?.pathname || '/employee-dashboard';
      
      // For demo purposes - employee@test.com goes to employee dashboard
      if (email === 'employee@test.com' && password === 'password') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', 'employee');
        toast.success('Login successful!');
        navigate(from, { replace: true });
        return;
      }
      
      toast.error('Invalid credentials. Please try again.');
    }, 1000);
  };

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
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                For demo purposes:<br/>
                Employee: employee@test.com / password<br/>
                Admin: admin@test.com / password
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
