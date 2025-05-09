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
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';

// Define interfaces for our data
export interface TrainingVideo {
  id: string; // Firestore document ID
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl?: string; // e.g., YouTube ID or direct URL
  department?: string | string[]; // For filtering
  order?: number; // For sequencing
  completed?: boolean; // This will be derived based on employee's progress
}

export interface Certificate {
  id: string; // Firestore document ID
  title: string;
  issuedDate: any; // Firestore Timestamp (will be converted to Date)
  expiryDate?: any; // Firestore Timestamp (optional)
  issuingBody: string;
  certificateUrl?: string; // URL to the certificate file
  relatedTrainingId?: string; // ID of a video in training_videos
}

export interface Assessment {
  id: string; // Firestore document ID
  title: string;
  description?: string;
  status: 'Pending' | 'Completed' | 'Passed' | 'Failed';
  score?: number;
  dueDate?: any; // Firestore Timestamp (optional)
  relatedTrainingId?: string; // ID of a video in training_videos
  assessmentUrl?: string; 
  questions?: Map<string, { score: number; options: string[] }>; // Map of question IDs with score and options
  timeLimit?: number; // e.g., "30 minutes"
}

interface EmployeeData {
  fullName: string;
  department: string;
  completedVideoIds?: string[]; // Array of TrainingVideo IDs
}

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [trainingVideos, setTrainingVideos] = useState<TrainingVideo[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  

  const employeeId = localStorage.getItem('employeeId');
  const cachedFullName = localStorage.getItem('employeeFullName');
  const cachedDepartment = localStorage.getItem('employeeDepartment');

  useEffect(() => {
    if (!employeeId) {
       // If employeeId is missing, but ProtectedRoute allowed access,
      // it means isAuthenticated is true, but essential data is missing.
      // This is an inconsistent state. Force a full logout.
      toast.error("User session data incomplete. Logging out for safety.");
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userType');
      localStorage.removeItem('employeeId');
      localStorage.removeItem('employeeFullName');
      localStorage.removeItem('employeeDepartment');
      // employeeEmail is also set by login, but not critical for auth state here
      navigate('/login', { replace: true });
     return;
    }
    fetchDashboardData(employeeId);
  }, [employeeId, navigate]);

  const fetchDashboardData = async (currentEmployeeId: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch Employee Details (including completedVideoIds)
      const empDocRef = doc(db, "employees", currentEmployeeId);
      const empDocSnap = await getDoc(empDocRef);
      let currentEmployeeData: EmployeeData;

      if (empDocSnap.exists()) {
        const data = empDocSnap.data();
        currentEmployeeData = {
            fullName: data.fullName || cachedFullName || "Employee",
            department: data.department || cachedDepartment || "",
            completedVideoIds: data.completedVideoIds || [],
        };
        setEmployeeData(currentEmployeeData);
         // Update localStorage if fetched data is more accurate
        if (data.fullName) localStorage.setItem('employeeFullName', data.fullName);
        if (data.department) localStorage.setItem('employeeDepartment', data.department);
      } else {
        toast.error("Employee data not found. Displaying cached info if available.");
        currentEmployeeData = { // Fallback
            fullName: cachedFullName || "Employee",
            department: cachedDepartment || "",
            completedVideoIds: [],
        };
        setEmployeeData(currentEmployeeData);
      }

      // 2. Fetch Training Videos
      // Consider filtering by currentEmployeeData.department or fetching "General" videos too
      const videosCollectionRef = collection(db, "training_videos");
      // Example: Fetch all videos ordered by 'order' field, then mark completed status
      const videosQuery = query(videosCollectionRef, orderBy("order", "asc")); // Assuming you have an 'order' field
      
      const videosSnapshot = await getDocs(videosQuery);
      const fetchedVideos = videosSnapshot.docs.map(docSnap => {
        const videoData = docSnap.data();
        return {
          id: docSnap.id,
          title: videoData.title || "Untitled Video",
          description: videoData.description || "",
          duration: videoData.duration || "N/A",
          thumbnailUrl: videoData.thumbnailUrl || "https://placeholder.pics/svg/300x200/DEDEDE/555555/Video",
          videoUrl: videoData.videoUrl,
          department: videoData.department,
          order: videoData.order,
          completed: currentEmployeeData.completedVideoIds?.includes(docSnap.id) || false,
        } as TrainingVideo;
      });
      setTrainingVideos(fetchedVideos);

      // 3. Fetch Certificates for the employee
      const certsQuery = query(collection(db, "certificates"), where("employeeId", "==", currentEmployeeId));
      const certsSnapshot = await getDocs(certsQuery);
      const fetchedCerts = certsSnapshot.docs.map(docSnap => {
        const certData = docSnap.data();
        return { 
          id: docSnap.id, 
          ...certData,
          // Convert Firestore Timestamps to JS Dates if needed for display components
          issuedDate: certData.issuedDate?.toDate ? certData.issuedDate.toDate() : new Date(certData.issuedDate),
          expiryDate: certData.expiryDate?.toDate ? certData.expiryDate.toDate() : (certData.expiryDate ? new Date(certData.expiryDate) : undefined),
        } as Certificate;
      });
      setCertificates(fetchedCerts);

      // 4. Fetch Assessments for the employee
      const assessQuery = query(collection(db, "assessments"), where("employeeId", "==", currentEmployeeId));
      const assessSnapshot = await getDocs(assessQuery);
      const fetchedAssessments = assessSnapshot.docs.map(docSnap => {
        const assessData = docSnap.data();
        return { 
          id: docSnap.id, 
          title: assessData.title || "Untitled Assessment",
          description: assessData.description,
          status: assessData.status || "Pending",
          score: assessData.score,
          dueDate: assessData.dueDate?.toDate ? assessData.dueDate.toDate() : (assessData.dueDate ? new Date(assessData.dueDate) : undefined),
          relatedTrainingId: assessData.relatedTrainingId,
          assessmentUrl: assessData.assessmentUrl,
          questions: assessData.questions, // Expecting 'questions' array on the Firestore doc
          timeLimitMinutes: assessData.timeLimitMinutes,
        } as Assessment;
      });
      setAssessments(fetchedAssessments);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate progress
  const completedVideosCount = trainingVideos.filter(video => video.completed).length;
  const totalVideosCount = trainingVideos.length;
  const progressPercentage = totalVideosCount > 0 ? Math.round((completedVideosCount / totalVideosCount) * 100) : 0;
  
  // Find next video for training
  const nextVideo = trainingVideos.find(video => !video.completed);

  const handleStartTraining = (videoId: string) => { // videoId is now string (Firestore ID)
    navigate(`/training-viewer/${videoId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('employeeFullName');
    localStorage.removeItem('employeeDepartment');
    toast.info("You have been logged out.");
    navigate('/');
  };
  

  const userName = employeeData?.fullName || cachedFullName || "Employee"; 

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <DashboardHeader onLogout={handleLogout} userName={userName} /> {/* Show header even on load */}
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

        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            
            <OverviewTab 
              progressPercentage={progressPercentage}
              completedVideos={completedVideosCount}
              totalVideos={totalVideosCount}
              certificates={certificates} // Pass the fetched certificates
              setActiveTab={setActiveTab}
              nextVideo={nextVideo}
              handleStartTraining={handleStartTraining}
            />
          </TabsContent>
          
          <TabsContent value="training">
            <TrainingTab 
              trainingVideos={trainingVideos} // Pass the fetched videos
              handleStartTraining={handleStartTraining} 
            />
          </TabsContent>
          
          <TabsContent value="certificates">
            <CertificatesTab 
              certificates={certificates} // Pass the fetched certificates
              setActiveTab={setActiveTab} 
            />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentsTab assessments={assessments} /> {/* Pass the fetched assessments */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
