
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Award, UserCheck } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#000000] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Spare Parts Academy</h1>
          <div className="space-x-4">
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#ea384c] text-white py-20">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Automotive Spare Parts Training Portal</h1>
          <p className="text-xl md:text-2xl mb-8">Empowering employees with knowledge and certification</p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Button 
              onClick={() => navigate('/login')} 
              size="lg"
              variant='outline'
              className="bg-white text-[#ea384c] hover:bg-black hover:border-black"
            >
              Employee Login
            </Button>
            <Button 
              onClick={() => navigate('/admin-login')} 
              variant="outline" 
              size="lg"
              className="text-[#ea384c] bg-white hover:bg-black hover:border-black"
            >
              Administrator Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Training Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-[#ea384c] p-3 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Training</h3>
              <p className="text-gray-600">Access comprehensive video tutorials on automotive spare parts.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center ">
              <div className="bg-[#ea384c] p-3 rounded-full mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Assessments</h3>
              <p className="text-gray-600">Complete quizzes and tests to validate your knowledge.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-[#ea384c] p-3 rounded-full mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certification</h3>
              <p className="text-gray-600">Earn certificates upon successful completion of training modules.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-[#ea384c] p-3 rounded-full mb-4">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Monitor your learning journey and track certifications earned.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000000] text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Spare Parts Academy</h2>
              <p className="text-sm text-gray-300">Automotive Training Excellence</p>
            </div>
            <div className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} Spare Parts Academy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
