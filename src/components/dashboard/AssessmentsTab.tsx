import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, XCircle, HelpCircle, Lock } from 'lucide-react'; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from 'react-router-dom';
import { DashboardAssessment } from '@/pages/EmployeeDashboard'; 

interface AssessmentsTabProps {
  assessments: DashboardAssessment[];
}

const AssessmentsTab = ({ assessments }: AssessmentsTabProps) => {
  const navigate = useNavigate(); // Initialize navigate

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assessments.map(assessment => (
          <Card key={assessment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{assessment.title}{" "}
                {assessment.hasAttempted && (
                  <Badge
                    variant="outline"
                    className={assessment.attemptStatus === 'Passed' ? "bg-green-500 text-white" : "bg-red-500 text-white"}
                  >
                    {assessment.attemptStatus === 'Passed' ? <CheckCircle className="mr-1 h-4 w-4 inline" /> : <XCircle className="mr-1 h-4 w-4 inline" />}
                    {assessment.attemptStatus}
                    {assessment.attemptScore !== undefined && ` (${assessment.attemptScore}%)`}
                  </Badge>
                )}
                </CardTitle>
              </div>
              <CardDescription>{assessment.description || "No description available."}</CardDescription>
             </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
               <span className="text-gray-500">Questions:</span>
                 <span>{assessment.questionsCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time Limit:</span>
                <span>{assessment.timeLimitMinutes ? `${assessment.timeLimitMinutes} minutes` : "N/A"}</span>
             </div>
            </CardContent>
            <CardFooter>
               <div className="flex justify-between items-center w-full">
                {assessment.hasAttempted ? (
                  <div className="flex items-center space-x-2">
                     <p className="text-sm text-gray-500">
                      Attempted on: {assessment.attemptDate ? new Date(assessment.attemptDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ) : (
                 <>
                    {assessment.isRelatedTrainingComplete === false ? ( // Check if explicitly false
                      <Button
                        className="bg-gray-400 text-gray-700 cursor-not-allowed"
                        disabled
                        title="Complete the related training first"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Locked
                      </Button>
                    ) : (
                      <Button
                        className="bg-[#ea384c] hover:bg-[#d9293d]"
                        onClick={() => navigate(`/quiz/${assessment.id}`)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Quiz
                      </Button>
                    )}
                  </>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Quiz Info
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto text-sm">
                    <div className="grid gap-2">
                      <h4 className="font-medium leading-none">{assessment.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Details for this assessment.
                      </p>
                      <p><strong>Questions:</strong> {assessment.questionsCount}</p>
                      <p><strong>Passing Score:</strong> {assessment.passingScore}%</p>
                      <p><strong>Time Limit:</strong> {assessment.timeLimitMinutes ? `${assessment.timeLimitMinutes} minutes` : "N/A"}</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {assessments.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No Assessments Available</CardTitle>
            <CardDescription className="text-center">
              Assessments will appear here when assigned or after completing related training.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </>
  );
};

export default AssessmentsTab;
