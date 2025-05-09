import React from 'react';
import { Button } from "@/components/ui/button";
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
  onEditQuiz: (quiz: Assessment) => void;
  onDeleteQuiz: (quiz: Assessment) => void;
}

const ManageQuizzesAdminTab: React.FC<ManageQuizzesAdminTabProps> = ({
  assessments,
  onEditQuiz,
  onDeleteQuiz,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Quizzes</CardTitle>
        <CardDescription>View, edit, or delete existing quizzes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
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
  );
};

export default ManageQuizzesAdminTab;