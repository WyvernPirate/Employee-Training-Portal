
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/firebaseConfig'; 

const EmployeeLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.dismiss(); // Clear previous toasts
    
      try {
        // 1. Query Firestore for the employee user by email
        const employeesCollectionRef = collection(db, 'employees');
        const q = query(employeesCollectionRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          toast.error('Employee not found.');
          setIsLoading(false);
          return;
        }
  
        const employeeDoc = querySnapshot.docs[0];
        const employeeData = employeeDoc.data();
  
        // 2. Compare the entered password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, employeeData.hashedPassword);
  
        if (passwordMatch) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userType', 'employee');
          localStorage.setItem('employeeId', employeeDoc.id);
          const constructedFullName = (employeeData.firstName && employeeData.surname) ? `${employeeData.firstName} ${employeeData.surname}` : (employeeData.fullName || 'Employee');
          localStorage.setItem('employeeFullName', constructedFullName);
          localStorage.setItem('employeeDepartment', employeeData.department || '');
          localStorage.setItem('employeeEmail', employeeData.email || '');
          toast.success('Login successful!');
          const from = location.state?.from?.pathname || '/employee-dashboard';
          navigate(from, { replace: true });
        } else {
          toast.error('Invalid credentials. Please try again.');
        }
      } catch (error) {
        console.error("Employee login error:", error);
        toast.error('An error occurred during login. Please try again.');
      } finally {
      setIsLoading(false);
      }
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
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Don't have an account? <a href="/register" className="text-[#ea384c] hover:underline">Register</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
