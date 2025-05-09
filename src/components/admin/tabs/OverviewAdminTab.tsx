import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Video, FileText } from 'lucide-react';
import { TrainingContent } from '@/pages/AdminDashboard'; // Assuming interfaces are exported or accessible

interface OverviewAdminTabProps {
  employeesCount: number;
  trainingContentsCount: number;
  totalCertificatesCount: number;
  recentTrainingContent: TrainingContent[];
}

const OverviewAdminTab: React.FC<OverviewAdminTabProps> = ({
  employeesCount,
  trainingContentsCount,
  totalCertificatesCount,
  recentTrainingContent,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Employees</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-[#ea384c] mr-3" />
              <div className="text-3xl font-bold">{employeesCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Training Content</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-[#ea384c] mr-3" />
              <div className="text-3xl font-bold">{trainingContentsCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Certifications Issued</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-[#ea384c] mr-3" />
              <div className="text-3xl font-bold">{totalCertificatesCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Training Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Completions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrainingContent.slice(0, 5).map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{content.title}</TableCell>
                    <TableCell>
                      {content.contentType === 'video' ?
                        <Badge className="bg-blue-500">Video</Badge> :
                        <Badge className="bg-orange-500">PDF</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{Array.isArray(content.department) ? content.department.join(', ') : content.department}</Badge>
                    </TableCell>
                    <TableCell>{content.views}</TableCell>
                    <TableCell>{content.completions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewAdminTab;