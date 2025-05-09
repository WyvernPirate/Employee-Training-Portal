
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen } from 'lucide-react';
import { TrainingVideo, Certificate  } from '@/pages/EmployeeDashboard';

interface OverviewTabProps {
  progressPercentage: number;
  completedVideos: number;
  totalVideos: number;
  certificates: Certificate[];
  setActiveTab: (tab: string) => void;
  nextVideo?: TrainingVideo | null;
  handleStartTraining: (videoId: string) => void;
}

const OverviewTab = ({
  progressPercentage, 
  completedVideos, 
  totalVideos,
  certificates, 
  setActiveTab,
  nextVideo,
  handleStartTraining
}: OverviewTabProps) => {
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Progress</CardTitle>
            <CardDescription>Your overall training completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Completed:</span>
                <span className="font-medium">{completedVideos} of {totalVideos} courses</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-right text-sm text-gray-500">{progressPercentage}%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Certificates</CardTitle>
            <CardDescription>Your earned certifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="h-8 w-8 text-[#ea384c] mr-2" />
              <div>
                <div className="text-xl font-bold">{certificates.length}</div>
                <div className="text-sm text-gray-500">Earned certificates</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("certificates")}>
              View All Certificates
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Next Course</CardTitle>
            <CardDescription>Recommended for you</CardDescription>
          </CardHeader>
          <CardContent>
            {nextVideo ? (
              <div>
                <div className="font-medium">{nextVideo.title}</div>
                <div className="text-sm text-gray-500">{nextVideo.duration}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">All courses completed!</div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              size="sm" 
              className="bg-[#ea384c] hover:bg-[#d9293d]"
              onClick={() => {
                if (nextVideo) {
                  handleStartTraining(nextVideo.id);
                }
              }}
              disabled={!nextVideo}
            >
              Start Training
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="bg-[#ea384c] p-2 rounded-full mr-3">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Certificate Earned</p>
                <p className="text-sm text-gray-500">Brake Systems Specialist - 3 days ago</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-green-500 p-2 rounded-full mr-3">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Completed Course</p>
                <p className="text-sm text-gray-500">Introduction to Brake Systems - 3 days ago</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
