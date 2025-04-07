import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Upload, Users, Video, FileText, LogOut, Plus, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for employees
const employees = [
  { id: 1, name: "John Smith", department: "Mechanical", progress: 75, certifications: 2 },
  { id: 2, name: "Jane Doe", department: "Electrical", progress: 40, certifications: 1 },
  { id: 3, name: "Robert Johnson", department: "Logistics", progress: 20, certifications: 0 },
  { id: 4, name: "Emily Wilson", department: "Customer Support", progress: 90, certifications: 3 },
  { id: 5, name: "Michael Brown", department: "Mechanical", progress: 60, certifications: 1 }
];

// Mock data for training content
const trainingContent = [
  { id: 1, title: "Introduction to Brake Systems", contentType: "video", department: "Mechanical", views: 42, completions: 28 },
  { id: 2, title: "Understanding Transmission Components", contentType: "video", department: "Mechanical", views: 37, completions: 22 },
  { id: 3, title: "Electrical Systems in Modern Vehicles", contentType: "video", department: "Electrical", views: 31, completions: 19 },
  { id: 4, title: "Spare Parts Catalog 2023", contentType: "pdf", department: "All", views: 56, completions: 41 },
  { id: 5, title: "Service Manual - Standard Procedures", contentType: "pdf", department: "Mechanical", views: 29, completions: 18 }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Filter employees based on search and department
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleLogout = () => {
    navigate('/');
  };

  const handleContentUpload = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Training content uploaded successfully!");
    // In a real app, this would send the form data to an API
  };

  const handleQuizCreation = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Quiz created successfully!");
    // In a real app, this would send the form data to an API
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#000000] text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Spare Parts Academy - Admin</h1>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-block">Administrator</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-white border-white hover:bg-[#ea384c] hover:border-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage training content and track employee progress</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="content">Upload Content</TabsTrigger>
            <TabsTrigger value="quizzes">Create Quizzes</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Employees</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-[#ea384c] mr-3" />
                    <div className="text-3xl font-bold">{employees.length}</div>
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
                    <div className="text-3xl font-bold">{trainingContent.length}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-[#ea384c] mr-3" />
                    <div className="text-3xl font-bold">{employees.reduce((total, emp) => total + emp.certifications, 0)}</div>
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
                      {trainingContent.map((content) => (
                        <TableRow key={content.id}>
                          <TableCell className="font-medium">{content.title}</TableCell>
                          <TableCell>
                            {content.contentType === 'video' ? 
                              <Badge className="bg-blue-500">Video</Badge> : 
                              <Badge className="bg-orange-500">PDF</Badge>
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{content.department}</Badge>
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
          </TabsContent>
          
          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="Customer Support">Customer Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Employee List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Certifications</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{employee.department}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-[#ea384c] h-2.5 rounded-full" 
                                  style={{ width: `${employee.progress}%` }}
                                ></div>
                              </div>
                              <span>{employee.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{employee.certifications}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">View Details</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Upload Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Upload Training Content</CardTitle>
                <CardDescription>Add new training videos or PDF documents for employees</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContentUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Content Title</Label>
                    <Input id="title" placeholder="Enter content title" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Enter content description" rows={3} required />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contentType">Content Type</Label>
                      <Select defaultValue="video">
                        <SelectTrigger id="contentType">
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select defaultValue="mechanical">
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="mechanical">Mechanical</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="logistics">Logistics</SelectItem>
                          <SelectItem value="customer-support">Customer Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Video Upload Section */}
                  <div className="space-y-2">
                    <Label>Content File</Label>
                    <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex">
                          <Video className="h-10 w-10 text-gray-400" />
                          <FileText className="h-10 w-10 text-gray-400 ml-2" />
                        </div>
                        <p className="text-sm text-gray-500">
                          Click to upload or drag and drop video files or PDF documents
                        </p>
                        <p className="text-xs text-gray-500">
                          Video: MP4, MOV or AVI (max 500MB)<br />
                          PDF: PDF files (max 50MB)
                        </p>
                      </div>
                      <Input id="content-file" type="file" accept=".mp4,.mov,.avi,.pdf" className="sr-only" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail Image</Label>
                    <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50">
                      <p className="text-sm text-gray-500">
                        Click to upload or drag and drop a thumbnail image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (max 2MB)
                      </p>
                      <Input id="thumbnail" type="file" accept="image/*" className="sr-only" />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Content
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Create Quiz</CardTitle>
                <CardDescription>Add assessments for training content</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuizCreation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiz-title">Quiz Title</Label>
                    <Input id="quiz-title" placeholder="Enter quiz title" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="related-content">Related Training Content</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainingContent.map(content => (
                          <SelectItem key={content.id} value={`content-${content.id}`}>
                            {content.title} ({content.contentType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Questions</Label>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4">
                        <div className="space-y-2 mb-4">
                          <Label htmlFor="question-1">Question 1</Label>
                          <Input id="question-1" placeholder="Enter question" required />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <input type="radio" id="q1-correct" name="q1-answer" defaultChecked />
                            <Input placeholder="Correct answer" required />
                          </div>
                          
                          {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-2 mb-2">
                              <input type="radio" id={`q1-option-${i}`} name="q1-answer" />
                              <Input placeholder={`Option ${i}`} required />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button type="button" variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passing-score">Passing Score (%)</Label>
                      <Input id="passing-score" type="number" min="1" max="100" defaultValue="70" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                      <Input id="time-limit" type="number" min="1" defaultValue="30" required />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Create Quiz
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
