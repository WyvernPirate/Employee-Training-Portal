import React from 'react';
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

interface Employee {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  department: string;
  progress?: number;
  certificationsCount?: number;

}

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({ employee, isOpen, onClose }) => {
  if (!employee) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Employee Details: {employee.firstName} {employee.surname}</DialogTitle>
          <DialogDescription>
            Detailed information for {employee.email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Full Name:</span>
            <span className="text-sm">{employee.firstName} {employee.surname}</span>
          </div>
          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <span className="text-sm">{employee.email}</span>
          </div>
          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Department:</span>
            <Badge variant="outline">{employee.department}</Badge>
          </div>
          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Training Progress:</span>
            <div className="flex items-center">
              <Progress value={employee.progress || 0} className="w-[60%] mr-2 h-3" />
              <span>{employee.progress || 0}%</span>
            </div>
          </div>
          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Certifications:</span>
            <span className="text-sm">{employee.certificationsCount || 0}</span>
          </div>
          </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Close</Button>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsModal;