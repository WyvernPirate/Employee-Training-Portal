import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from 'lucide-react';

interface RegisterEmployeeAdminTabProps {
  newEmployeeFirstName: string;
  setNewEmployeeFirstName: (name: string) => void;
  newEmployeeSurname: string;
  setNewEmployeeSurname: (name: string) => void;
  newEmployeeEmail: string;
  setNewEmployeeEmail: (email: string) => void;
  newEmployeePassword: string;
  setNewEmployeePassword: (password: string) => void;
  newEmployeeConfirmPassword: string;
  setNewEmployeeConfirmPassword: (password: string) => void;
  newEmployeeDepartment: string;
  setNewEmployeeDepartment: (department: string) => void;
  departmentOptions: string[];
  handleAdminEmployeeRegistration: (e: React.FormEvent) => void;
  isRegisteringEmployee: boolean;
}

const RegisterEmployeeAdminTab: React.FC<RegisterEmployeeAdminTabProps> = ({
  newEmployeeFirstName, setNewEmployeeFirstName,
  newEmployeeSurname, setNewEmployeeSurname,
  newEmployeeEmail, setNewEmployeeEmail,
  newEmployeePassword, setNewEmployeePassword,
  newEmployeeConfirmPassword, setNewEmployeeConfirmPassword,
  newEmployeeDepartment, setNewEmployeeDepartment,
  departmentOptions,
  handleAdminEmployeeRegistration,
  isRegisteringEmployee,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Employee</CardTitle>
        <CardDescription>Create a new employee account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdminEmployeeRegistration} className="space-y-4">
          <div>
            <Label htmlFor="newEmpFirstName">First Name</Label>
            <Input id="newEmpFirstName" type="text" value={newEmployeeFirstName} onChange={(e) => setNewEmployeeFirstName(e.target.value)} placeholder="John" required />
          </div>
          <div>
            <Label htmlFor="newEmpSurname">Surname</Label>
            <Input id="newEmpSurname" type="text" value={newEmployeeSurname} onChange={(e) => setNewEmployeeSurname(e.target.value)} placeholder="Doe" required />
          </div>
          <div>
            <Label htmlFor="newEmpEmail">Email Address</Label>
            <Input id="newEmpEmail" type="email" value={newEmployeeEmail} onChange={(e) => setNewEmployeeEmail(e.target.value)} placeholder="employee.email@company.com" required />
          </div>
          <div>
            <Label htmlFor="newEmpDepartment">Department</Label>
            <Select value={newEmployeeDepartment} onValueChange={setNewEmployeeDepartment} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.filter(d => d !== "All") // Admins should assign to a specific dept
                .map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="newEmpPassword">Password</Label>
            <Input id="newEmpPassword" type="password" value={newEmployeePassword} onChange={(e) => setNewEmployeePassword(e.target.value)} placeholder="•••••••• (min. 6 characters)" required />
          </div>
          <div>
            <Label htmlFor="newEmpConfirmPassword">Confirm Password</Label>
            <Input id="newEmpConfirmPassword" type="password" value={newEmployeeConfirmPassword} onChange={(e) => setNewEmployeeConfirmPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full bg-[#ea384c] hover:bg-[#d9293d] text-white" disabled={isRegisteringEmployee}>
            {isRegisteringEmployee ? "Registering..." : <><UserPlus className="mr-2 h-4 w-4" /> Register Employee</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterEmployeeAdminTab;