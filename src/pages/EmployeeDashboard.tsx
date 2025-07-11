import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OverviewTab from '@/components/dashboard/OverviewTab';
import TrainingTab from '@/components/dashboard/TrainingTab';
import CertificatesTab from '@/components/dashboard/CertificatesTab';
import AssessmentsTab from '@/components/dashboard/AssessmentsTab';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';

// Define interfaces for our data
export interface TrainingVideo {
  id: string; // Firestore document ID
  title: string;
  description: string;
  duration?: string;
  thumbnailUrl: string;
  fileUrl: string; 
  contentType: 'video' | 'pdf';
  department?: string | string[]; // For filtering
  order?: number; 
  completed?: boolean; 
}

export interface Certificate {
  id: string; // Firestore document ID
  title: string;
  issuedDate: any; 
  expiryDate?: any; 
  issuingBody: string;
  certificateUrl?: string; // URL to the certificate file
  relatedTrainingContentId?: string; 
}

export interface DashboardAssessment {
  id: string; 
  title: string;
  description?: string;
  relatedTrainingContentId?: string;
  timeLimitMinutes?: number;
  passingScore: number;
  questionsCount: number;
  attemptStatus?: 'Passed' | 'Failed'; 
  attemptScore?: number;
  attemptDate?: Date;
  hasAttempted: boolean; 
  isRelatedTrainingComplete?: boolean; 
}

interface EmployeeData {
  fullName: string;
  department: string;
  completedVideoIds?: string[]; 
}

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [trainingVideos, setTrainingVideos] = useState<TrainingVideo[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [assessments, setAssessments] = useState<DashboardAssessment[]>([]);

  const { currentUser, logout: authLogout } = useAuth(); // Get currentUser and logout from AuthContext

  useEffect(() => {
    // currentUser will be null initially if not logged in, or if AuthContext is still loading.
    // AuthContext's loading state is handled by ProtectedRoute.
    // If ProtectedRoute allows rendering, currentUser should be available.
    if (currentUser && currentUser.uid) {
      console.log("EmployeeDashboard: useEffect triggered, calling fetchDashboardData for employeeId (UID):", currentUser.uid);
    fetchDashboardData(currentUser.uid); // Fetch data only when currentUser.uid is available
    } else if (!currentUser && !isLoading) { 
      // If still not loading (meaning AuthContext resolved) and no currentUser, then redirect.
       // This case should ideally be caught by ProtectedRoute,
      // but as a safeguard if the component somehow renders without a currentUser.
      toast.error("User not authenticated. Redirecting to login.");
     navigate('/login', { replace: true });
     }
  }, [currentUser?.uid, navigate]); // Depend only on currentUser.uid (or currentUser itself) and navigate

  const fetchDashboardData = async (currentEmployeeId: string) => {
    console.log("fetchDashboardData: Starting for employeeId:", currentEmployeeId);
    setIsLoading(true);
    try {
      // 1. Fetch Employee Details
       // Employee details (name, department) are now part of currentUser from AuthContext
      // if you've set them up to be fetched there.
  
      console.log("fetchDashboardData: Fetching employee details...");
     // Query for the employee document where the 'uid' field matches currentEmployeeId (Firebase Auth UID)
      const employeesCollectionRef = collection(db, "employees");
      const empDetailsQuery = query(employeesCollectionRef, where("uid", "==", currentEmployeeId));
      const empQuerySnapshot = await getDocs(empDetailsQuery);
      let currentEmployeeData: EmployeeData;
      let employeeDocumentExists = false;

     if (!empQuerySnapshot.empty) {
        const empDocSnap = empQuerySnapshot.docs[0]; // Assuming uid is unique
        const data = empDocSnap.data() as Record<string, any>; // Added type assertion
         console.log("fetchDashboardData: Employee doc exists, data:", data);
        employeeDocumentExists = true;
        currentEmployeeData = {
            fullName: (data.firstName && data.surname) 
                         ? `${data.firstName} ${data.surname}`
                        : currentUser?.displayName || `${currentUser?.firstName || ''} ${currentUser?.surname || ''}`.trim() || "Employee",
            department: data.department || currentUser?.department || "",
         completedVideoIds: data.completedVideoIds || [],
        };
        setEmployeeData(currentEmployeeData);
        // No need to set these in localStorage anymore for auth purposes
        // if (currentEmployeeData.fullName && currentEmployeeData.fullName !== "Employee") {
        //     localStorage.setItem('employeeFullName', currentEmployeeData.fullName);
        // }
        // if (data.department) localStorage.setItem('employeeDepartment', data.department);
     } else {
        console.warn("fetchDashboardData: Employee doc with uid field matching currentEmployeeId not found:", currentEmployeeId);
        toast.error("Employee data not found in Firestore. Using info from authentication if available.");
       currentEmployeeData = {
            fullName: currentUser?.displayName || `${currentUser?.firstName || ''} ${currentUser?.surname || ''}`.trim() || "Employee",
            department: currentUser?.department || "",
                completedVideoIds: [],
        };
        setEmployeeData(currentEmployeeData);
      }
      console.log("fetchDashboardData: Employee details processed. currentEmployeeData:", currentEmployeeData);

      // 2. Fetch Training Content
      console.log("fetchDashboardData: Fetching training content...");
      let contentQuery;
      if (currentEmployeeData.department && currentEmployeeData.department !== "" && currentEmployeeData.department !== "All") {
        console.log("fetchDashboardData: Querying training_content for department:", currentEmployeeData.department, "and 'All'");
        contentQuery = query(
          collection(db, "training_content"),
          where("department", "in", [currentEmployeeData.department, "All"]),
          orderBy("createdAt", "desc")
        );
      } else {
        // If department is "All", empty, or undefined, show all content
        // Or, if you want to show only "All" department content for empty/undefined employee department:
        // contentQuery = query(collection(db, "training_content"), where("department", "==", "All"), orderBy("createdAt", "desc"));
        // For now, let's assume empty/undefined/ "All" department for employee means they see all training.
        console.log("fetchDashboardData: Employee department is 'All' or not specific, querying all training_content");
         contentQuery = query(collection(db, "training_content"), orderBy("createdAt", "desc"));
      }

      const contentSnapshot = await getDocs(contentQuery);
      console.log("fetchDashboardData: Training content snapshot size:", contentSnapshot.size);
      const fetchedContent = contentSnapshot.docs.map(docSnap => {
        const contentData = docSnap.data() as Record<string, any>; 
        const trainingVideo: TrainingVideo = {
          id: docSnap.id,
          title: (contentData.title as string) || "Untitled Content",
          description: (contentData.description as string) || "",
          duration: contentData.duration as string | undefined,
          thumbnailUrl: (contentData.thumbnailUrl as string) || "https://placeholder.pics/svg/300x225.png/DEDEDE/555555/Content",
          fileUrl: (contentData.fileUrl as string) || "", 
          contentType: contentData.contentType as 'video' | 'pdf', 
          department: contentData.department as string | string[] | undefined,
          order: contentData.order as number | undefined,
          completed: currentEmployeeData.completedVideoIds?.includes(docSnap.id) || false,
        };
        return trainingVideo; 
      });
      setTrainingVideos(fetchedContent);
      console.log("fetchDashboardData: Training content fetched and mapped. Count:", fetchedContent.length);

      // 3. Fetch Certificates for the employee
      console.log("fetchDashboardData: Fetching certificates...");
      const certsQuery = query(collection(db, "certificates"), where("employeeId", "==", currentEmployeeId), orderBy("issuedDate", "desc"));
      const certsSnapshot = await getDocs(certsQuery);
      console.log("fetchDashboardData: Certificates snapshot size:", certsSnapshot.size);
      const fetchedCerts = certsSnapshot.docs.map(docSnap => {
        const certData = docSnap.data() as Record<string, any>; 
        const certificate: Certificate = {
          id: docSnap.id,
          title: (certData.title as string) || "Untitled Certificate",
          issuedDate: certData.issuedDate?.toDate ? certData.issuedDate.toDate() : (certData.issuedDate ? new Date(certData.issuedDate) : new Date()),
          expiryDate: certData.expiryDate?.toDate ? certData.expiryDate.toDate() : (certData.expiryDate ? new Date(certData.expiryDate) : null),
          issuingBody: (certData.issuingBody as string) || "N/A",
          certificateUrl: certData.certificateUrl as string | undefined,
          relatedTrainingContentId: certData.relatedTrainingContentId as string | undefined,
        };
        return certificate;
      });
      setCertificates(fetchedCerts);
      console.log("fetchDashboardData: Certificates fetched and mapped. Count:", fetchedCerts.length);

      // 4. Fetch Quiz Definitions (Assessments)
      console.log("fetchDashboardData: Fetching quiz definitions (assessments)...");
      let quizDefQuery;
      if (currentEmployeeData.department && currentEmployeeData.department !== "All") {
        console.log("fetchDashboardData: Querying assessments for department:", currentEmployeeData.department, "and 'All'");
        quizDefQuery = query(
          collection(db, "assessments"),
          where("department", "in", [currentEmployeeData.department, "All"]),
          orderBy("createdAt", "desc")
        );
      } else {
        console.log("fetchDashboardData: Querying all assessments");
        quizDefQuery = query(collection(db, "assessments"), orderBy("createdAt", "desc"));
      }
      const quizDefSnapshot = await getDocs(quizDefQuery);
      console.log("fetchDashboardData: Quiz definitions snapshot size:", quizDefSnapshot.size);
      const quizDefinitions = quizDefSnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>; 
        const quizDefPart = {
          id: doc.id,
          title: (data.title as string) || "Untitled Quiz",
          description: (data.description as string) || "",
          relatedTrainingContentId: data.relatedTrainingContentId as string | undefined,
          timeLimitMinutes: data.timeLimitMinutes as number | undefined,
          passingScore: (data.passingScore as number) || 70, 
          questions: data.questions as Array<{ questionText: string; options: string[]; correctAnswerIndex: number }> | undefined,
        };
        return quizDefPart; 
      });
      console.log("fetchDashboardData: Quiz definitions fetched and mapped. Count:", quizDefinitions.length);

      // 5. Fetch Employee's Quiz Attempts
      console.log("fetchDashboardData: Fetching employee quiz attempts...");
      const attemptsQuery = query(collection(db, "employee_assessment_results"), where("employeeId", "==", currentEmployeeId));
      const attemptsSnapshot = await getDocs(attemptsQuery);
      console.log("fetchDashboardData: Employee quiz attempts snapshot size:", attemptsSnapshot.size);
      const employeeAttemptsMap = new Map<string, any>();
      attemptsSnapshot.forEach(docSnap => { 
        const attempt = docSnap.data() as Record<string, any>; 
        const attemptQuizId = attempt.quizId as string;
        if (attemptQuizId) { 
            const existingAttempt = employeeAttemptsMap.get(attemptQuizId);
            const currentAttemptSubmittedAt = attempt.submittedAt?.toDate ? attempt.submittedAt.toDate() : (attempt.submittedAt ? new Date(attempt.submittedAt) : null);
            const existingAttemptSubmittedAt = existingAttempt?.submittedAt; 

            if (!existingAttempt || (currentAttemptSubmittedAt && existingAttemptSubmittedAt && currentAttemptSubmittedAt > existingAttemptSubmittedAt)) {
                employeeAttemptsMap.set(attemptQuizId, { ...attempt, id: docSnap.id, submittedAt: currentAttemptSubmittedAt });
            }
        }
      });
      console.log("fetchDashboardData: Employee quiz attempts processed into map. Map size:", employeeAttemptsMap.size);

      // 6. Merge Quiz Definitions with Attempts
      console.log("fetchDashboardData: Merging quiz definitions with attempts...");
      const dashboardAssessments = quizDefinitions.map(quizDef => {
        let relatedTrainingComplete = true; // Default to true if no related content
        if (quizDef.relatedTrainingContentId) {
          const actualContentId = quizDef.relatedTrainingContentId.replace('content-', '');
          relatedTrainingComplete = currentEmployeeData.completedVideoIds?.includes(actualContentId) || false;
        }
        if (!quizDef) {
            console.warn("fetchDashboardData: Encountered undefined quizDef during merge. Skipping.");
            return null; 
        }
        const attempt = employeeAttemptsMap.get(quizDef.id);
        const assessment: DashboardAssessment = {
          id: quizDef.id,
          title: quizDef.title,
          description: quizDef.description,
          relatedTrainingContentId: quizDef.relatedTrainingContentId,
          timeLimitMinutes: quizDef.timeLimitMinutes,
          passingScore: quizDef.passingScore,
          questionsCount: Array.isArray(quizDef.questions) ? quizDef.questions.length : 0,
          hasAttempted: !!attempt,
          attemptStatus: attempt?.status as 'Passed' | 'Failed' | undefined,
          attemptScore: attempt?.score as number | undefined,
          attemptDate: attempt?.submittedAt as Date | undefined,
          isRelatedTrainingComplete: relatedTrainingComplete,
        };
        return assessment;
      }).filter(Boolean) as DashboardAssessment[]; 
      setAssessments(dashboardAssessments);
      console.log("fetchDashboardData: Dashboard assessments merged. Count:", dashboardAssessments.length);
      console.log("fetchDashboardData: Successfully completed all fetches and processing.");

    } catch (error) {
      // Handle errors gracefully
      console.error("Error fetching dashboard data:", error); 
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
      console.log("fetchDashboardData: Finished. isLoading set to false.");
    }
  };

  const completedVideosCount = trainingVideos.filter(video => video.completed).length;
  const totalVideosCount = trainingVideos.length;
  const progressPercentage = totalVideosCount > 0 ? Math.round((completedVideosCount / totalVideosCount) * 100) : 0;
  const nextVideo = trainingVideos.find(video => !video.completed);
  const passedAssessmentsCount = assessments.filter(a => a.attemptStatus === 'Passed').length;
  const pendingAssessmentsCount = assessments.filter(a => !a.hasAttempted).length;

  const handleStartTraining = (videoId: string) => {
    navigate(`/training-viewer/${videoId}`);
  };

  const handleLogout = async () => {
    await authLogout(); // Use logout from AuthContext
   toast.info("You have been logged out.");
    navigate('/');
  };

  const userName = employeeData?.fullName || currentUser?.displayName || `${currentUser?.firstName || ''} ${currentUser?.surname || ''}`.trim() || "Employee";

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <DashboardHeader onLogout={handleLogout} userName={userName} />
        <div className="flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#ea384c] mb-4" />
          <p className="text-xl text-gray-700">Loading your dashboard...</p>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onLogout={handleLogout} userName={userName} />

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {userName}!</h2>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
           <TabsList className="grid grid-cols-2 sm:grid-cols-4 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              progressPercentage={progressPercentage}
              completedTrainings={completedVideosCount}
              totalTrainings={totalVideosCount}
              certificatesEarned={certificates.length}
              pendingAssessmentsCount={pendingAssessmentsCount}
              passedAssessmentsCount={passedAssessmentsCount}
              setActiveTab={setActiveTab}
              nextTrainingItem={nextVideo}
              handleStartTraining={handleStartTraining}
            />
          </TabsContent>

          <TabsContent value="training">
            <TrainingTab
              trainingVideos={trainingVideos}
              handleStartTraining={handleStartTraining}
            />
          </TabsContent>

          <TabsContent value="certificates">
            <CertificatesTab
              certificates={certificates}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentsTab assessments={assessments} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
