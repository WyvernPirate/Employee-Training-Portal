
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OverviewTab from '@/components/dashboard/OverviewTab';
import TrainingTab from '@/components/dashboard/TrainingTab';
import CertificatesTab from '@/components/dashboard/CertificatesTab';
import AssessmentsTab from '@/components/dashboard/AssessmentsTab';
import { trainingVideos, certificates, assessments } from '@/components/dashboard/mockData';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate progress
  const completedVideos = trainingVideos.filter(video => video.completed).length;
  const totalVideos = trainingVideos.length;
  const progressPercentage = Math.round((completedVideos / totalVideos) * 100);
  
  // Find next video for training
  const nextVideo = trainingVideos.find(video => !video.completed);

  const handleStartTraining = (videoId: number) => {
    navigate(`/training-viewer/${videoId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, John!</h2>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab 
              progressPercentage={progressPercentage}
              completedVideos={completedVideos}
              totalVideos={totalVideos}
              certificates={certificates}
              setActiveTab={setActiveTab}
              nextVideo={nextVideo}
              handleStartTraining={handleStartTraining}
            />
          </TabsContent>
          
          <TabsContent value="training">
            <TrainingTab 
              trainingVideos={trainingVideos} 
              handleStartTraining={handleStartTraining} 
            />
          </TabsContent>
          
          <TabsContent value="certificates">
            <CertificatesTab 
              certificates={certificates} 
              setActiveTab={setActiveTab} 
            />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentsTab assessments={assessments} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
