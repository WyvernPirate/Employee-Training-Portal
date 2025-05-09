import React, { useState, useEffect } from 'react';
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

import { db, storage } from '@/firebaseConfig';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDoc, orderBy } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

// Interfaces for Firestore data
interface Employee {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  department: string;
  completedVideoIds?: string[];
  // Calculated fields (not directly in Firestore doc, but useful for display)
  progress?: number;
  certificationsCount?: number;
}

interface TrainingContent {
  id: string;
  title: string;
  description?: string;
  contentType: 'video' | 'pdf';
  department: string | string[]; // Can be 'All' or specific department(s)
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  createdAt: any; // Firestore Timestamp
  // Calculated/derived
  views?: number;
  completions?: number;
}

interface Assessment {
  id: string;
  title: string;
  description?: string;
  relatedTrainingContentId?: string;
  questions: Array<{ questionText: string; options: string[]; correctAnswerIndex: number }>;
  passingScore: number;
  timeLimitMinutes?: number;
  department?: string | string[];
  createdAt: any; // Firestore Timestamp
}

const departmentOptions = [
  "Mechanical", "Electrical", "IT", "Customer Support",
  "Human Resources", "Logistics", "Finance", "All"
];


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainingContents, setTrainingContents] = useState<TrainingContent[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [totalCertificatesCount, setTotalCertificatesCount] = useState(0);
  

  // Form states for Upload Content
  const [contentTitle, setContentTitle] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [contentType, setContentType] = useState<'video' | 'pdf'>("video");
  const [contentDepartment, setContentDepartment] = useState(departmentOptions[0]);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form states for Create Quiz
  const [quizTitle, setQuizTitle] = useState("");
  const [quizRelatedContent, setQuizRelatedContent] = useState("");
  // Basic quiz questions structure - can be expanded
  const [quizQuestions, setQuizQuestions] = useState([{ questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  const [quizPassingScore, setQuizPassingScore] = useState(70);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

useEffect(() => {
    fetchAdminData();
  }, []);

  // Filter employees based on search and department
  const filteredEmployees = employees.filter(employee => {
    const name = `${employee.firstName} ${employee.surname}`;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Filter training content (client-side for now, can be optimized with Firestore queries)
  const filteredTrainingContent = trainingContents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase());
    // Simplified department check for now
    const matchesDepartment = departmentFilter === "all" || (typeof content.department === 'string' && content.department === departmentFilter) || (Array.isArray(content.department) && content.department.includes(departmentFilter));
    return matchesSearch && matchesDepartment;
  });

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    toast.info("Logged out successfully!");
    navigate('/');
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch Employees
      const empSnapshot = await getDocs(collection(db, "employees"));
      const empList = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      // TODO: Calculate progress and certificationsCount for each employee
      setEmployees(empList.map(e => ({...e, progress: Math.floor(Math.random() * 100), certificationsCount: Math.floor(Math.random() * 5) }))); // Placeholder calculation

      // Fetch Training Content
      // Order by creation date descending to get recent items first
      const trainingContentQuery = query(collection(db, "training_content"), orderBy("createdAt", "desc"));
      const contentSnapshot = await getDocs(trainingContentQuery);
      const contentList = contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingContent));
      // TODO: Calculate views and completions
      setTrainingContents(contentList.map(c => ({...c, views: Math.floor(Math.random() * 100), completions: Math.floor(Math.random() * c.views!) }))); // Placeholder

      // Fetch Assessments (Quizzes)
      const assessSnapshot = await getDocs(collection(db, "assessments"));
      const assessList = assessSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assessment));
      setAssessments(assessList);

      // Fetch total number of issued certificates
      const certsSnapshot = await getDocs(collection(db, "certificates"));
      setTotalCertificatesCount(certsSnapshot.size);
 

    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error: any) => {
          console.error("Upload error:", error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleContentUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contentFile) {
      toast.error("Please select a content file to upload.");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileUrl = await handleFileUpload(contentFile, `training_content/${contentType}s`);
      let thumbnailUrl = "";
      if (thumbnailFile) {
        thumbnailUrl = await handleFileUpload(thumbnailFile, 'training_content/thumbnails');
      }

      await addDoc(collection(db, "training_content"), {
        title: contentTitle,
        description: contentDescription,
        contentType: contentType,
        department: contentDepartment,
        fileUrl: fileUrl,
        thumbnailUrl: thumbnailUrl,
        // duration: "TODO", // Could be extracted from video metadata or entered manually
        createdAt: serverTimestamp(),
        // uploaderId: "currentAdminId" // TODO: Get current admin ID
      });

      toast.success("Training content uploaded successfully!");
      // Reset form
      setContentTitle(""); setContentDescription(""); setContentFile(null); setThumbnailFile(null);
      fetchAdminData(); // Refresh content list
    } catch (error) {
      toast.error("Failed to upload content. " + (error as Error).message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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

      {isLoading && <div className="container mx-auto py-8 px-4 text-center">Loading admin data...</div>}

        {!isLoading && (
          <div className="container mx-auto py-8 px-4 text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome to the Admin Dashboard</h2>
            <p className="text-gray-600">Manage training content and track employee progress</p>
          </div>
        )}

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
                    <div className="text-3xl font-bold">{trainingContents.length}</div>
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
                    {/* Display the first 5 items from the already sorted and filtered list */}
                    {filteredTrainingContent.slice(0, 5).map((content) => ( 
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
                          <TableCell>{content.views || 0}</TableCell>
                          <TableCell>{content.completions || 0}</TableCell>
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
                {departmentOptions.filter(d => d !== "All").map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
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
                          <TableCell className="font-medium">{employee.firstName} {employee.surname}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{employee.department}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                  className="bg-[#ea384c] h-2.5 rounded-full"
                                  style={{ width: `${employee.progress || 0}%` }}
                                ></div>
                              </div>
                              <span>{employee.progress || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{employee.certificationsCount || 0}</TableCell>
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
                    <Input id="title" value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} placeholder="Enter content title" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={contentDescription} onChange={(e) => setContentDescription(e.target.value)} placeholder="Enter content description" rows={3} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contentType">Content Type</Label>
                      <Select value={contentType} onValueChange={(value) => setContentType(value as 'video' | 'pdf')}>
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
                      <Select value={contentDepartment} onValueChange={setContentDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentOptions.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Video Upload Section */}
                  <div className="space-y-2">
                  <Label htmlFor="content-file-input">Content File</Label>
                    <div className="border-2 border-dashed rounded-md p-6 text-center">
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
                      <Input id="content-file-input" type="file" accept=".mp4,.mov,.avi,.pdf" onChange={(e) => setContentFile(e.target.files ? e.target.files[0] : null)} className="mt-2" />
                      {contentFile && <p className="text-sm text-gray-700 mt-1">Selected: {contentFile.name}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                  <Label htmlFor="thumbnail-input">Thumbnail Image (optional)</Label>
                    <div className="border-2 border-dashed rounded-md p-4 text-center">
                      <p className="text-sm text-gray-500">
                        Click to upload or drag and drop a thumbnail image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (max 2MB)
                      </p>
                      <Input id="thumbnail-input" type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)} className="mt-2" />
                      {thumbnailFile && <p className="text-sm text-gray-700 mt-1">Selected: {thumbnailFile.name}</p>}
                    </div>
                  </div>

                  {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                      <p className="text-xs text-center">{Math.round(uploadProgress)}%</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isUploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Upload Content"}
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
                    <Input id="quiz-title" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Enter quiz title" required />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="related-content">Related Training Content</Label>
                    <Select value={quizRelatedContent} onValueChange={setQuizRelatedContent}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select content" />
                      </SelectTrigger>
                      <SelectContent>
                      {trainingContents.map(content => (
                          <SelectItem key={content.id} value={`content-${content.id}`}>
                            {content.title} ({content.contentType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    {/* TODO: Dynamic Question Adding/Editing UI */}
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
                      <Input id="passing-score" type="number" min="1" max="100" value={quizPassingScore} onChange={(e) => setQuizPassingScore(parseInt(e.target.value))} required />
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
