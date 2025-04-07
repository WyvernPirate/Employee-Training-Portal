
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';

const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <header className="bg-[#000000] text-white p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Spare Parts Academy</h1>
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline-block">John Smith</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="text-white border-white hover:bg-[#ea384c] hover:border-transparent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
