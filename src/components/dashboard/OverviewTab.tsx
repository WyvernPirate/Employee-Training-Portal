
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, PlayCircle, ListChecks } from 'lucide-react';
import { TrainingVideo } from '@/pages/EmployeeDashboard'; // Import the interface

interface OverviewTabProps {
  progressPercentage: number;
  completedTrainings: number;
  totalTrainings: number;
  certificatesEarned: number;
  pendingAssessmentsCount: number;
  passedAssessmentsCount: number;
  nextTrainingItem?: TrainingVideo | null; // Updated from nextVideo
  setActiveTab: (tab: string) => void;
  handleStartTraining: (trainingId: string) => void; // Updated from videoId
}

const OverviewTab = ({
   progressPercentage,
  completedTrainings,
  totalTrainings,
  certificatesEarned,
  pendingAssessmentsCount,
  passedAssessmentsCount,
  nextTrainingItem,
  setActiveTab,
  handleStartTraining
}: OverviewTabProps) => {
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {completedTrainings} of {totalTrainings} trainings completed
            </p>
            <Progress value={progressPercentage} className="mt-2 h-2 [&>*]:bg-[#ea384c]" />
          </CardContent>
        </Card>

        <Card>
         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
            <Award className="h-5 w-5 text-muted-foreground" />
         </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificatesEarned}</div>
            <Button variant="link" className="p-0 h-auto text-xs text-[#ea384c]" onClick={() => setActiveTab('certificates')}>
              View Certificates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments Status</CardTitle>
            <ListChecks className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passedAssessmentsCount} Passed</div>
            <p className="text-xs text-muted-foreground">
              {pendingAssessmentsCount} pending assessments
            </p>
            <Button variant="link" className="p-0 h-auto text-xs text-[#ea384c]" onClick={() => setActiveTab('assessments')}>
              View Assessments
            </Button> 
          </CardContent>
        </Card>
         {nextTrainingItem && (
        <Card className="bg-gradient-to-r from-[#e53935] to-[#c62828] text-white">
          <CardHeader>
            <CardTitle>Continue Your Training</CardTitle>
            <CardDescription className="text-gray-200">
              Next up: {nextTrainingItem.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3 line-clamp-2">{nextTrainingItem.description}</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="bg-white text-[#ea384c] hover:bg-gray-100"
              onClick={() => handleStartTraining(nextTrainingItem.id)}
            >
              <PlayCircle className="mr-2 h-5 w-5" /> Start Now
            </Button>
          </CardFooter>
        </Card>
      )}
      </div>
    </div>
  );
};

export default OverviewTab;
