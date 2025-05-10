import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
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
import { Assessment } from '@/pages/AdminDashboard'; // Assuming interfaces are exported

interface ManageQuizzesAdminTabProps {
  assessments: Assessment[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onEditQuiz: (quiz: Assessment) => void;
  onDeleteQuiz: (quiz: Assessment) => void;
}

const ManageQuizzesAdminTab: React.FC<ManageQuizzesAdminTabProps> = ({
  assessments,
  searchQuery,
  setSearchQuery,
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
        {/* Optional: Add department filter here if needed later */}
      </div>

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
              <TableHead>Questions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center">No quizzes found.</TableCell></TableRow>
            )}
            {assessments.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell><Badge variant="outline">{Array.isArray(quiz.department) ? quiz.department.join(', ') : quiz.department || 'N/A'}</Badge></TableCell>
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