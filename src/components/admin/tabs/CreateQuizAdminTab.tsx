import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from 'lucide-react';
import { TrainingContent, QuizQuestion } from '@/pages/AdminDashboard'; // Assuming interfaces are exported

interface CreateQuizAdminTabProps {
  quizTitle: string;
  setQuizTitle: (title: string) => void;
  quizDescription: string;
  setQuizDescription: (desc: string) => void;
  quizRelatedContent: string;
  setQuizRelatedContent: (id: string) => void;
  quizDepartment: string;
  setQuizDepartment: (dept: string) => void;
  quizQuestions: QuizQuestion[];
  setQuizQuestions: (questions: QuizQuestion[]) => void;
  quizPassingScore: number;
  setQuizPassingScore: (score: number) => void;
  quizTimeLimit: number | null;
  setQuizTimeLimit: (limit: number | null) => void;
  quizGrantsCertificate: boolean;
  setQuizGrantsCertificate: (grants: boolean) => void;
  quizCertificateTitle: string;
  setQuizCertificateTitle: (title: string) => void;
  handleQuizCreation: (e: React.FormEvent) => void;
  handleAddQuestion: () => void;
  handleRemoveQuestion: (id: string) => void;
  handleQuestionTextChange: (id: string, value: string) => void;
  handleOptionChange: (id: string, optionIndex: number, value: string) => void;
  handleCorrectAnswerChange: (id: string, optionIndex: number) => void;
  trainingContents: TrainingContent[];
  departmentOptions: string[];
  isSavingQuiz: boolean; // Renamed from isUploading for clarity
}

const CreateQuizAdminTab: React.FC<CreateQuizAdminTabProps> = ({
  quizTitle, setQuizTitle, quizDescription, setQuizDescription, quizRelatedContent, setQuizRelatedContent,
  quizDepartment, setQuizDepartment, quizQuestions, setQuizQuestions,
  quizPassingScore, setQuizPassingScore, quizTimeLimit, setQuizTimeLimit,
  quizGrantsCertificate, setQuizGrantsCertificate, quizCertificateTitle, setQuizCertificateTitle,
  handleQuizCreation, handleAddQuestion, handleRemoveQuestion, handleQuestionTextChange,
  handleOptionChange, handleCorrectAnswerChange, trainingContents, departmentOptions, isSavingQuiz
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Quiz</CardTitle>
        <CardDescription>Add assessments for training content</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleQuizCreation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Quiz Title</Label>
            <Input id="quiz-title" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Enter quiz title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-description">Quiz Description (optional)</Label>
            <Textarea id="quiz-description" value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} placeholder="Enter a brief description" rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="related-content">Related Training Content</Label>
            <Select value={quizRelatedContent} onValueChange={setQuizRelatedContent}>
              <SelectTrigger><SelectValue placeholder="Select content" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none-value">None</SelectItem>
                {trainingContents.map(content => (
                  <SelectItem key={content.id} value={`content-${content.id}`}>
                    {content.title} ({content.contentType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-department">Department</Label>
            <Select value={quizDepartment} onValueChange={setQuizDepartment}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departmentOptions.map(dept => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Questions</Label>
            <div className="space-y-4">
              {quizQuestions.map((question, qIndex) => (
                <Card key={question.id} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor={`question-${question.id}`}>Question {qIndex + 1}</Label>
                    {quizQuestions.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveQuestion(question.id)}>Remove</Button>
                    )}
                  </div>
                  <Textarea id={`question-${question.id}`} placeholder="Enter question text" value={question.questionText} onChange={(e) => handleQuestionTextChange(question.id, e.target.value)} required className="mb-2" />
                  <Label className="text-sm">Options (Mark correct answer):</Label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2 mt-1">
                      <input type="radio" id={`q${question.id}-opt${oIndex}`} name={`q${question.id}-correct`} checked={question.correctAnswerIndex === oIndex} onChange={() => handleCorrectAnswerChange(question.id, oIndex)} className="form-radio h-4 w-4 text-[#ea384c] focus:ring-[#ea384c]" />
                      <Input placeholder={`Option ${oIndex + 1}`} value={option} onChange={(e) => handleOptionChange(question.id, oIndex, e.target.value)} required />
                    </div>
                  ))}
                </Card>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={handleAddQuestion}><Plus className="mr-2 h-4 w-4" />Add Question</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passing-score">Passing Score (%)</Label>
              <Input id="passing-score" type="number" min="1" max="100" value={quizPassingScore} onChange={(e) => setQuizPassingScore(parseInt(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-limit">Time Limit (minutes)</Label>
              <Input id="time-limit" type="number" min="1" value={quizTimeLimit ?? ''} onChange={(e) => setQuizTimeLimit(e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g., 30" />
            </div>
          </div>

          <div className="space-y-2 border-t pt-4 mt-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="quiz-grants-certificate" checked={quizGrantsCertificate} onChange={(e) => setQuizGrantsCertificate(e.target.checked)} className="form-checkbox h-5 w-5 text-[#ea384c] rounded focus:ring-[#ea384c]" />
              <Label htmlFor="quiz-grants-certificate">Grants a Certificate upon Passing?</Label>
            </div>
            {quizGrantsCertificate && (
              <div className="space-y-2 pl-7">
                <Label htmlFor="quiz-certificate-title">Certificate Title</Label>
                <Input id="quiz-certificate-title" value={quizCertificateTitle} onChange={(e) => setQuizCertificateTitle(e.target.value)} placeholder="e.g., Certified Technician" required={quizGrantsCertificate} />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSavingQuiz}>
            {isSavingQuiz ? "Creating..." : "Create Quiz"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateQuizAdminTab;