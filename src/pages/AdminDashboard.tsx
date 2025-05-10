import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import EmployeeDetailsModal from '@/components/admin/EmployeeDetailsModal';

import { db, storage } from '@/firebaseConfig';
import { collection, query, where, getDocs, addDoc, deleteDoc as deleteFirestoreDoc, doc, updateDoc, serverTimestamp, getDoc, orderBy } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import EditContentModal from '@/components/admin/EditContentModal';
import EditQuizModal from '@/components/admin/EditQuizModal';

// Import new tab components
import OverviewAdminTab from '@/components/admin/tabs/OverviewAdminTab';
import EmployeesAdminTab from '@/components/admin/tabs/EmployeesAdminTab';
import UploadContentAdminTab from '@/components/admin/tabs/UploadContentAdminTab';
import CreateQuizAdminTab from '@/components/admin/tabs/CreateQuizAdminTab';
import ManageContentAdminTab from '@/components/admin/tabs/ManageContentAdminTab';
import ManageQuizzesAdminTab from '@/components/admin/tabs/ManageQuizzesAdminTab';


// Interfaces for Firestore data
export interface Employee {
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
  grantsCertificate?: boolean; // Whether passing the quiz grants a certificate
  certificateTitle?: string; // Title of the certificate

}

export interface QuizQuestion {
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
  const [isDraggingContent, setIsDraggingContent] = useState(false);
  const contentFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const thumbnailFileInputRef = useRef<HTMLInputElement | null>(null);

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
  const [quizGrantsCertificate, setQuizGrantsCertificate] = useState(false);
  const [quizCertificateTitle, setQuizCertificateTitle] = useState("");

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

  // Drag and Drop Handlers for Content File
  const handleContentDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingContent(true);
  };

  const handleContentDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingContent(false);
  };

  const handleContentDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingContent(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      // Basic type check (can be more robust)
      if (droppedFile.type.startsWith("video/") || droppedFile.type === "application/pdf") {
        setContentFile(droppedFile);
      } else {
        toast.error("Invalid file type. Please upload a video or PDF.");
      }
      e.dataTransfer.clearData();
    }
  };

  // Drag and Drop Handlers for Thumbnail File
  const handleThumbnailDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThumbnail(true);
  };

  const handleThumbnailDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThumbnail(false);
  };

  const handleThumbnailDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThumbnail(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("image/")) {
        setThumbnailFile(droppedFile);
      } else {
        toast.error("Invalid file type. Please upload an image (PNG, JPG, GIF).");
      }
      e.dataTransfer.clearData();
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
        grantsCertificate: quizGrantsCertificate,
        certificateTitle: quizGrantsCertificate ? quizCertificateTitle : "",
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
      setQuizGrantsCertificate(false);
      setQuizCertificateTitle("");
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
          <h1 className="text-2xl font-bold">Spare Parts Classroom - Admin</h1>
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
            <OverviewAdminTab
              employeesCount={employees.length}
              trainingContentsCount={trainingContents.length}
              totalCertificatesCount={totalCertificatesCount}
              recentTrainingContent={filteredTrainingContent}
            />
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <EmployeesAdminTab
              employees={filteredEmployees}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              departmentOptions={departmentOptions}
              onViewEmployeeDetails={handleViewEmployeeDetails}
            />
          </TabsContent>

          {/* Upload Content Tab */}
          <TabsContent value="content">
            <UploadContentAdminTab
              contentTitle={contentTitle} setContentTitle={setContentTitle}
              contentDescription={contentDescription} setContentDescription={setContentDescription}
              contentType={contentType} setContentType={setContentType}
              contentDepartment={contentDepartment} setContentDepartment={setContentDepartment}
              contentFile={contentFile} setContentFile={setContentFile}
              thumbnailFile={thumbnailFile} setThumbnailFile={setThumbnailFile}
              uploadProgress={uploadProgress} isUploading={isUploading}
              isDraggingContent={isDraggingContent}
              handleContentDragOver={handleContentDragOver}
              handleContentDragLeave={handleContentDragLeave}
              handleContentDrop={handleContentDrop}
              contentFileInputRef={contentFileInputRef}
              isDraggingThumbnail={isDraggingThumbnail}
              handleThumbnailDragOver={handleThumbnailDragOver}
              handleThumbnailDragLeave={handleThumbnailDragLeave}
              handleThumbnailDrop={handleThumbnailDrop}
              thumbnailFileInputRef={thumbnailFileInputRef}
              handleContentUpload={handleContentUpload}
              departmentOptions={departmentOptions}
            />
          </TabsContent>
          

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <CreateQuizAdminTab
              quizTitle={quizTitle} setQuizTitle={setQuizTitle}
              quizDescription={quizDescription} setQuizDescription={setQuizDescription}
              quizRelatedContent={quizRelatedContent} setQuizRelatedContent={setQuizRelatedContent}
              quizDepartment={quizDepartment} setQuizDepartment={setQuizDepartment}
              quizQuestions={quizQuestions} setQuizQuestions={setQuizQuestions}
              quizPassingScore={quizPassingScore} setQuizPassingScore={setQuizPassingScore}
              quizTimeLimit={quizTimeLimit} setQuizTimeLimit={setQuizTimeLimit}
              quizGrantsCertificate={quizGrantsCertificate} setQuizGrantsCertificate={setQuizGrantsCertificate}
              quizCertificateTitle={quizCertificateTitle} setQuizCertificateTitle={setQuizCertificateTitle}
              handleQuizCreation={handleQuizCreation}
              handleAddQuestion={handleAddQuestion}
              handleRemoveQuestion={handleRemoveQuestion}
              handleQuestionTextChange={handleQuestionTextChange}
              handleOptionChange={handleOptionChange}
              handleCorrectAnswerChange={handleCorrectAnswerChange}
              trainingContents={trainingContents}
              departmentOptions={departmentOptions}
              isSavingQuiz={isUploading} 
            />
          </TabsContent>

          {/* Manage Content Tab */}
          <TabsContent value="manageContent">
            <ManageContentAdminTab
              trainingContents={trainingContents}
              onEditContent={handleEditContentInit}
              onDeleteContent={handleDeleteContentInit}
            />
          </TabsContent>

          {/* Manage Quizzes Tab */}
          <TabsContent value="manageQuizzes">
            <ManageQuizzesAdminTab
              assessments={assessments}
              onEditQuiz={handleEditQuizInit}
              onDeleteQuiz={handleDeleteQuizInit}
            />
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
