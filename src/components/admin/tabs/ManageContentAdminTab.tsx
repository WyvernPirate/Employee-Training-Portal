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
import { TrainingContent } from '@/pages/AdminDashboard'; // Assuming interfaces are exported

interface ManageContentAdminTabProps {
  trainingContents: TrainingContent[];
  onEditContent: (content: TrainingContent) => void;
  onDeleteContent: (content: TrainingContent) => void;
}

const ManageContentAdminTab: React.FC<ManageContentAdminTabProps> = ({
  trainingContents,
  onEditContent,
  onDeleteContent,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Training Content</CardTitle>
        <CardDescription>View, edit, or delete existing training materials.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainingContents.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center">No training content found.</TableCell></TableRow>
            )}
            {trainingContents.map((content) => (
              <TableRow key={content.id}>
                <TableCell className="font-medium">{content.title}</TableCell>
                <TableCell><Badge variant={content.contentType === 'video' ? 'default' : 'secondary'}>{content.contentType.toUpperCase()}</Badge></TableCell>
                <TableCell>{Array.isArray(content.department) ? content.department.join(', ') : content.department}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEditContent(content)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteContent(content)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ManageContentAdminTab;