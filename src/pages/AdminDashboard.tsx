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
import EmployeeDetailsModal from '@/components/admin/EmployeeDetailsModal';

import { db, storage } from '@/firebaseConfig';
import { collection, query, where, getDocs, addDoc, deleteDoc as deleteFirestoreDoc, doc, updateDoc, serverTimestamp, getDoc, orderBy } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import EditContentModal from '@/components/admin/EditContentModal';
import EditQuizModal from '@/components/admin/EditQuizModal';

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

export interface TrainingContent {
  id: string;
  title: string;
  description?: string;
  contentType: 'video' | 'pdf';
  department: string | string[]; // Can be 'All' or specific department(s)
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  createdAt: any; // Firestore Timestamp
  views: number; // Should be initialized to 0 when content is created
  completions: number; // Should be initialized to 0
}

export interface Assessment {
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

interface QuizQuestion {
  id: string; // For React key, e.g., using Date.now().toString() or a UUID
  questionText: string;
  options: string[];
  correctAnswerIndex: number; // Index of the correct option
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
  const [quizDescription, setQuizDescription] = useState("");
  const [quizDepartment, setQuizDepartment] = useState(departmentOptions[0]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { id: Date.now().toString(), questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }
  ]);
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [quizTimeLimit, setQuizTimeLimit] = useState<number | null>(30); // in minutes

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // State for Employee Details Modal
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // State for Delete Confirmation
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'content' | 'quiz', fileUrl?: string, thumbnailUrl?: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // State for Edit Content Modal
  const [editingContent, setEditingContent] = useState<TrainingContent | null>(null);
  const [isEditContentModalOpen, setIsEditContentModalOpen] = useState(false);

  // State for Edit Quiz Modal
  const [editingQuiz, setEditingQuiz] = useState<Assessment | null>(null);
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState(false);


useEffect(() => {
    fetchAdminData();
  }, []);

  const handleViewEmployeeDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleDeleteFileFromStorage = async (fileUrl: string) => {
    if (!fileUrl) return;
    try {
      const fileRef = ref(storage, fileUrl); // Get reference from full URL
      await deleteObject(fileRef);
      console.log("File deleted from storage:", fileUrl);
    } catch (error: any) {
      // It's okay if the file doesn't exist (e.g., already deleted or URL was incorrect)
      if (error.code === 'storage/object-not-found') {
        console.warn("File not found in storage (may have been already deleted):", fileUrl);
      } else {
        console.error("Error deleting file from storage:", fileUrl, error);
        toast.error(`Failed to delete associated file: ${error.message}`);
      }
    }
  };

  const handleDeleteContentInit = (content: TrainingContent) => {
    setItemToDelete({ id: content.id, type: 'content', fileUrl: content.fileUrl, thumbnailUrl: content.thumbnailUrl });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsLoading(true); // Use general loading state for simplicity
    try {
      if (itemToDelete.type === 'content') {
        await deleteFirestoreDoc(doc(db, "training_content", itemToDelete.id));
        if (itemToDelete.fileUrl) await handleDeleteFileFromStorage(itemToDelete.fileUrl);
        if (itemToDelete.thumbnailUrl) await handleDeleteFileFromStorage(itemToDelete.thumbnailUrl);
        toast.success("Training content deleted successfully.");
        } else if (itemToDelete.type === 'quiz') {
        await deleteFirestoreDoc(doc(db, "assessments", itemToDelete.id));
        toast.success("Quiz deleted successfully.");
      }
    
      fetchAdminData(); // Refresh data
    } catch (error) {
      toast.error("Failed to delete item. " + (error as Error).message);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteQuizInit = (quiz: Assessment) => {
    setItemToDelete({ id: quiz.id, type: 'quiz' });
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditContentInit = (content: TrainingContent) => {
    setEditingContent(content);
    setIsEditContentModalOpen(true);
  };

  const handleUpdateTrainingContent = async (
    contentId: string,
    updatedData: Partial<Omit<TrainingContent, 'id' | 'createdAt' | 'views' | 'completions'>>,
    newContentFile?: File | null,
    newThumbnailFile?: File | null
  ) => {
    if (!editingContent) return;

    setIsUploading(true); // Reuse isUploading for saving state
    const dataToUpdate = { ...updatedData };

    try {
      if (newContentFile) {
        // Delete old content file if it exists
        if (editingContent.fileUrl) await handleDeleteFileFromStorage(editingContent.fileUrl);
        // Upload new content file
        dataToUpdate.fileUrl = await handleFileUpload(newContentFile, `training_content/${dataToUpdate.contentType}s`);
      }

      if (newThumbnailFile) {
        // Delete old thumbnail file if it exists
        if (editingContent.thumbnailUrl) await handleDeleteFileFromStorage(editingContent.thumbnailUrl);
        // Upload new thumbnail file
        dataToUpdate.thumbnailUrl = await handleFileUpload(newThumbnailFile, 'training_content/thumbnails');
      }

      const contentDocRef = doc(db, "training_content", contentId);
      await updateDoc(contentDocRef, dataToUpdate);

      toast.success("Training content updated successfully!");
      fetchAdminData();
      setIsEditContentModalOpen(false);
      setEditingContent(null);
    } catch (error) {
      toast.error("Failed to update content. " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditQuizInit = (quiz: Assessment) => {
    setEditingQuiz(quiz);
    setIsEditQuizModalOpen(true);
  };

  const handleUpdateQuiz = async (quizId: string, updatedData: Partial<Omit<Assessment, 'id' | 'createdAt'>>) => {
    setIsUploading(true); // Reuse isUploading for saving state
    try {
      const quizDocRef = doc(db, "assessments", quizId);
      await updateDoc(quizDocRef, updatedData);
      toast.success("Quiz updated successfully!");
      fetchAdminData(); // Refresh data
      setIsEditQuizModalOpen(false);
      setEditingQuiz(null);
    } catch (error) {
      toast.error("Failed to update quiz. " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

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
      const employeesSnapshot = await getDocs(collection(db, "employees"));
      const rawEmployeesList = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));

      // Fetch all training content to calculate progress (we might already have this, but let's ensure)
      const allTrainingContentSnapshot = await getDocs(collection(db, "training_content"));
      const allTrainingVideos = allTrainingContentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const totalNumberOfTrainings = allTrainingVideos.length;

      // Fetch all certificates to count per employee
      const allCertificatesSnapshot = await getDocs(collection(db, "certificates"));
      const allCertificates = allCertificatesSnapshot.docs.map(doc => ({ employeeId: doc.data().employeeId, ...doc.data() }));
      setTotalCertificatesCount(allCertificates.length);

      const processedEmployees = rawEmployeesList.map(emp => {
        const completedCount = emp.completedVideoIds?.length || 0;
        const progress = totalNumberOfTrainings > 0 ? Math.round((completedCount / totalNumberOfTrainings) * 100) : 0;
        const certificationsCount = allCertificates.filter(cert => cert.employeeId === emp.id).length;
        return {
          ...emp,
          progress,
          certificationsCount,
        };
      });
      setEmployees(processedEmployees);

      // Fetch Training Content
      // Order by creation date descending to get recent items first
      const trainingContentQuery = query(collection(db, "training_content"), orderBy("createdAt", "desc"));
      const contentSnapshot = await getDocs(trainingContentQuery);
      const contentList = contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), views: doc.data().views || 0, completions: doc.data().completions || 0 } as TrainingContent));
      setTrainingContents(contentList);

      // Fetch Assessments (Quizzes)
      const assessSnapshot = await getDocs(collection(db, "assessments"));
      const assessList = assessSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assessment));
      setAssessments(assessList);

      // Fetch total number of issued certificates
      const certsSnapshot = await getDocs(collection(db, "certificates"));
      // Removed redundant fetch; totalCertificatesCount is already set above.
 

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
        views: 0, // Initialize views
        completions: 0, // Initialize completions
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


  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      { id: Date.now().toString(), questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }
    ]);
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== questionId));
  };

  const handleQuestionTextChange = (questionId: string, value: string) => {
    setQuizQuestions(quizQuestions.map(q =>
      q.id === questionId ? { ...q, questionText: value } : q
    ));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuizQuestions(quizQuestions.map(q =>
      q.id === questionId ? {
        ...q,
        options: q.options.map((opt, i) => i === optionIndex ? value : opt)
      } : q
    ));
  };

  const handleCorrectAnswerChange = (questionId: string, optionIndex: number) => {
    setQuizQuestions(quizQuestions.map(q =>
      q.id === questionId ? { ...q, correctAnswerIndex: optionIndex } : q
    ));
  };

  const handleQuizCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quizQuestions.some(q => !q.questionText.trim() || q.options.some(opt => !opt.trim()))) {
      toast.error("Please fill out all question texts and options.");
      return;
    }
    if (quizQuestions.length === 0) {
      toast.error("A quiz must have at least one question.");
      return;
    }

    setIsUploading(true); // Reuse isUploading state for quiz creation
    try {
      const newQuizData = {
        title: quizTitle,
        description: quizDescription,
        relatedTrainingContentId: quizRelatedContent || null, // Store null if not selected
        department: quizDepartment,
        questions: quizQuestions.map(({ id, ...rest }) => rest), // Remove temporary id before saving
        passingScore: quizPassingScore,
        timeLimitMinutes: quizTimeLimit,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "assessments"), newQuizData);

      toast.success("Quiz created successfully!");
      // Reset form
      setQuizTitle("");
      setQuizDescription("");
      setQuizRelatedContent("");
      setQuizDepartment(departmentOptions[0]);
      setQuizQuestions([{ id: Date.now().toString(), questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
      setQuizPassingScore(70);
      setQuizTimeLimit(30);
      fetchAdminData(); // Refresh assessments list (if you display it)

    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz. " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
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
              className="text-black border-white hover:bg-[#ea384c] hover:border-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {isLoading && <div className="container mx-auto py-8 px-4 text-center">Loading admin data...</div>}
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage training content and track employee progress</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 max-w-4xl"> {/* Adjusted grid for new tab */}
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="content">Upload Content</TabsTrigger>
            <TabsTrigger value="quizzes">Create Quizzes</TabsTrigger>
             <TabsTrigger value="manageContent">Manage Content</TabsTrigger>
            <TabsTrigger value="manageQuizzes">Manage Quizzes</TabsTrigger>
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
                          <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewEmployeeDetails(employee)}
                            >View Details</Button>
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
                  <Label htmlFor="quiz-description">Quiz Description (optional)</Label>
                    <Textarea id="quiz-description" value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} placeholder="Enter a brief description for the quiz" rows={2} />
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
                      <Label htmlFor="quiz-department">Department</Label>
                      <Select value={quizDepartment} onValueChange={setQuizDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department for this quiz" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentOptions.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  <div className="space-y-2">
                    <Label>Questions</Label>
                    <div className="space-y-4">
                    {quizQuestions.map((question, qIndex) => (
                       <Card key={question.id} className="p-4">
                       <div className="flex justify-between items-center mb-2">
                         <Label htmlFor={`question-${question.id}`}>Question {qIndex + 1}</Label>
                         {quizQuestions.length > 1 && (
                           <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveQuestion(question.id)}>
                             Remove
                           </Button>
                         )}
                       </div>
                       <Textarea
                            id={`question-${question.id}`}
                            placeholder="Enter question text"
                            value={question.questionText}
                            onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                            required
                            className="mb-2"
                        />
                        <Label className="text-sm">Options (Mark correct answer):</Label>
                        {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2 mt-1">
                              <input
                                type="radio"
                                id={`q${question.id}-opt${oIndex}`}
                                name={`q${question.id}-correct`}
                                checked={question.correctAnswerIndex === oIndex}
                                onChange={() => handleCorrectAnswerChange(question.id, oIndex)}
                                className="form-radio h-4 w-4 text-[#ea384c] focus:ring-[#ea384c]"
                              />
                              <Input
                                placeholder={`Option ${oIndex + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(question.id, oIndex, e.target.value)}
                                required
                              />
                            </div>
                        ))} 
                        </Card>
                      ))}
                      <Button type="button" variant="outline" className="w-full" onClick={handleAddQuestion}>
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
                      <Input id="time-limit" type="number" min="1" value={quizTimeLimit} onChange={(e) => setQuizTimeLimit(parseInt(e.target.value))} required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isUploading}>
                     Create Quiz
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Content Tab */}
          <TabsContent value="manageContent">
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
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No training content found.</TableCell>
                      </TableRow>
                    )}
                    {trainingContents.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">{content.title}</TableCell>
                        <TableCell>
                          <Badge variant={content.contentType === 'video' ? 'default' : 'secondary'}>
                            {content.contentType.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{Array.isArray(content.department) ? content.department.join(', ') : content.department}</TableCell>
                        <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditContentInit(content)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteContentInit(content)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Quizzes Tab */}
          <TabsContent value="manageQuizzes">
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
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No quizzes found.</TableCell>
                      </TableRow>
                    )}
                    {assessments.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell className="font-medium">{quiz.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {Array.isArray(quiz.department) ? quiz.department.join(', ') : quiz.department || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{quiz.questions.length}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditQuizInit(quiz)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteQuizInit(quiz)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <EmployeeDetailsModal 
        employee={selectedEmployee}
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
      />
       <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteItem}
        itemName={
          itemToDelete?.type === 'content' ? `"${trainingContents.find(tc => tc.id === itemToDelete?.id)?.title || 'this content'}"` :
          itemToDelete?.type === 'quiz' ? `"${assessments.find(q => q.id === itemToDelete?.id)?.title || 'this quiz'}"` :
          "this item"
        }
      />
      <EditContentModal
        isOpen={isEditContentModalOpen}
        onClose={() => setIsEditContentModalOpen(false)}
        contentToEdit={editingContent}
        onSave={handleUpdateTrainingContent}
        departmentOptions={departmentOptions}
        isSaving={isUploading} // Reuse isUploading state
      />
      <EditQuizModal
        isOpen={isEditQuizModalOpen}
        onClose={() => setIsEditQuizModalOpen(false)}
        quizToEdit={editingQuiz}
        onSave={handleUpdateQuiz}
        trainingContentOptions={trainingContents}
        departmentOptions={departmentOptions}
        isSaving={isUploading} // Reuse isUploading state
      />
    </div>
  );
};

export default AdminDashboard;
