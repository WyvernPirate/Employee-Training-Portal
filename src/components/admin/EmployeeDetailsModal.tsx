import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Progress } from "@/components/ui/progress";
// Import the more detailed interfaces, assuming they are exported from AdminDashboard or a shared types file
import { Employee, AdminCertificate, TrainingProgressItem } from '@/pages/AdminDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({ employee, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("summary");
  if (!employee) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
       <DialogHeader>
          <DialogTitle>Employee Details: {employee.firstName} {employee.surname}</DialogTitle>
          <DialogDescription>
           Detailed information for {employee.email} - <Badge variant="secondary">{employee.department}</Badge>
           </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="certificates">Certificates ({employee.certificatesAwarded?.length || 0})</TabsTrigger>
            <TabsTrigger value="progress">Training Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="py-4 space-y-3">
            <div className="grid grid-cols-[150px_1fr] items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Full Name:</span>
              <span className="text-sm">{employee.firstName} {employee.surname}</span>
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <span className="text-sm">{employee.email}</span>
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Department:</span>
              <Badge variant="outline">{employee.department}</Badge>
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Overall Progress:</span>
              <div className="flex items-center">
                <Progress value={employee.progress || 0} className="w-[60%] mr-2 h-3 [&>*]:bg-[#ea384c]" />
                <span>{employee.progress || 0}%</span>
              </div>
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Total Certificates:</span>
              <span className="text-sm">{employee.certificationsCount || 0}</span>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="py-4 max-h-[400px] overflow-y-auto">
            {employee.certificatesAwarded && employee.certificatesAwarded.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate Title</TableHead>
                    <TableHead>Issued Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employee.certificatesAwarded.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.title}</TableCell>
                      <TableCell>{cert.issuedDate instanceof Date ? cert.issuedDate.toLocaleDateString() : new Date(cert.issuedDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-4">No certificates earned yet.</p>
            )}
          </TabsContent>

          <TabsContent value="progress" className="py-4 max-h-[400px] overflow-y-auto">
            {employee.detailedTrainingProgress && employee.detailedTrainingProgress.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Training Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employee.detailedTrainingProgress.map((item) => (
                    <TableRow key={item.contentId}>
                      <TableCell className="font-medium">{item.contentTitle}</TableCell>
                      <TableCell>
                        <Badge variant={item.contentType === 'video' ? 'default' : 'secondary'}>
                          {item.contentType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.status === 'Completed' ? (
                          <Badge className="bg-green-500 text-white">Completed</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-4">No training data available.</p>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            onClick={() => {
              onClose();
              setTimeout(() => setActiveTab("summary"), 150); 
            }}
            variant="outline"
          >Close</Button> </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsModal;