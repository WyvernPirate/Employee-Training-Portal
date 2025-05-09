
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { Assessment } from '@/pages/EmployeeDashboard';

interface AssessmentsTabProps {
  assessments: Assessment[];
}

const AssessmentsTab = ({ assessments }: AssessmentsTabProps) => {
  
   const handleStartQuiz = (quizId: string) => { // ID is now string
    toast.info("Quiz functionality will be implemented soon!");
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assessments.map(assessment => (
          <Card key={assessment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{assessment.title}</CardTitle>
                {(assessment.status === 'Completed' || assessment.status === 'Passed' || assessment.status === 'Failed') && (
                  <Badge variant="outline" className="bg-green-500 text-white">
                    {assessment.status}
                  </Badge>
                )}
              </div>
              <CardDescription>{assessment.description || "No description available."}</CardDescription>
             </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
              <span className="text-gray-500">Related Training ID:</span>
                <span>{assessment.relatedTrainingId || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Questions:</span>
                <span>{assessment.questions?.size || "N/A"}</span>
                </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time Limit:</span>
                <span>{assessment.timeLimit}</span>
              </div>
                {assessment.score !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Your Score:</span>
                    <span className="font-medium">{assessment.score}</span>
                  </div>
                )}
  
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full items-center">
                <Button 
                  className={(assessment.status === 'Completed' || assessment.status === 'Passed' || assessment.status === 'Failed') ? "bg-gray-500" : "bg-[#ea384c] hover:bg-[#d9293d]"}
                  disabled={(assessment.status === 'Completed' || assessment.status === 'Passed' || assessment.status === 'Failed')}
                  onClick={() => handleStartQuiz(assessment.id)}
                >
                  {(assessment.status === 'Completed' || assessment.status === 'Passed' || assessment.status === 'Failed') ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Quiz
                    </>
                  )}
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <AlertCircle className="h-4 w-4" />
                      <span className="ml-2">Quiz Tips</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Tips for Taking Quizzes</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                        <li>Choose the best answer for each question</li>
                        <li>Once answered, you cannot go back to previous questions</li>
                        <li>You must complete the quiz in one session</li>
                        <li>A score of 70% or higher is required to pass</li>
                      </ul>
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
              Complete some training courses to unlock assessments
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </>
  );
};

export default AssessmentsTab;
