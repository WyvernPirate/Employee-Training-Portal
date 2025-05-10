import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Assessment, TrainingContent } from '@/pages/AdminDashboard';

interface ManageQuizzesAdminTabProps {
  assessments: Assessment[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (filter: string) => void;
  relatedContentFilter: string;
  setRelatedContentFilter: (filter: string) => void;
  departmentOptions: string[];
  allTrainingContents: TrainingContent[];
  onEditQuiz: (quiz: Assessment) => void;
  onDeleteQuiz: (quiz: Assessment) => void;
}

const ManageQuizzesAdminTab: React.FC<ManageQuizzesAdminTabProps> = ({
  assessments,
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  relatedContentFilter,
  setRelatedContentFilter,
  departmentOptions,
  allTrainingContents,
  onEditQuiz,
  onDeleteQuiz,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search quizzes by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={departmentFilter}
          onValueChange={setDepartmentFilter}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departmentOptions.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={relatedContentFilter}
          onValueChange={setRelatedContentFilter}
        >
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Filter by Related Content" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Related Content</SelectItem>
            {allTrainingContents.map(content => (
              <SelectItem key={`content-${content.id}`} value={`content-${content.id}`}>{content.title}</SelectItem>
            ))}
          </SelectContent>
        </Select></div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Quizzes</CardTitle>
          <CardDescription>View, edit, or delete existing quizzes.</CardDescription>
        </CardHeader>
        <CardContent> <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Related Content</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center">No quizzes found for the current filters.</TableCell></TableRow>
             )}
            {assessments.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell><Badge variant="outline">{Array.isArray(quiz.department) ? quiz.department.join(', ') : quiz.department || 'N/A'}</Badge></TableCell>
                <TableCell>
                  {quiz.relatedTrainingContentId
                    ? allTrainingContents.find(c => `content-${c.id}` === quiz.relatedTrainingContentId)?.title || <span className="text-xs text-gray-500">Content not found</span>
                    : 'N/A'
                  }
                </TableCell>
                <TableCell>{quiz.questions.length}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEditQuiz(quiz)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteQuiz(quiz)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
};

export default ManageQuizzesAdminTab;