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
import { TrainingContent } from '@/pages/AdminDashboard'; // Assuming interfaces are exported

interface ManageContentAdminTabProps {
  trainingContents: TrainingContent[];
  searchQuery: string;
  departmentFilter: string;
  setDepartmentFilter: (filter: string) => void;
  departmentOptions: string[];
  setSearchQuery: (query: string) => void;
  onEditContent: (content: TrainingContent) => void;
  onDeleteContent: (content: TrainingContent) => void;
}

const ManageContentAdminTab: React.FC<ManageContentAdminTabProps> = ({
  trainingContents,
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  departmentOptions,
  onEditContent,
  onDeleteContent,
}) => {
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search content by title..."
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
        </Select></div>
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
    </div>
  );
};

export default ManageContentAdminTab;