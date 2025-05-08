
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { collection, query, where, getDocs } from "firebase/firestore";
import bcrypt from 'bcryptjs';
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/firebaseConfig'; // Import your Firestore instance

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.dismiss(); // Clear previous toasts
    
    try {
      // 1. Query Firestore for the admin user by email
      const adminCollectionRef = collection(db, 'admin'); // Assuming your collection is named 'admin'
      const q = query(adminCollectionRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error('Admin user not found.');
        setIsLoading(false);
        return;
      }

      // Assuming email is unique, there should only be one doc
      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();

      // 2. Compare the entered password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, adminData.hashedPassword);

      if (passwordMatch) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', 'admin');
        toast.success('Admin login successful!');
        const from = location.state?.from?.pathname || '/admin-dashboard';
        navigate(from, { replace: true });
      } else {
        toast.error('Invalid admin credentials. Please try again.');
      }
    } catch (error) {
      console.error("Admin login error:", error);
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
