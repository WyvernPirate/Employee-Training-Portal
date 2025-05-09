
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  onLogout: () => void;
  userName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout, userName }) => {
  return (
    <header className="bg-[#000000] text-white p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Spare Parts Classroom</h1>
        <div className="flex items-center space-x-4">
          <span>Welcome, {userName}!</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout}
            className="text-black border-white hover:bg-[#ea384c] hover:border-transparent"
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
