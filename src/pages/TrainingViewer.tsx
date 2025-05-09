import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Assuming this is available from shadcn/ui
import { Star, ArrowLeft, CheckCircle, Loader2, HelpCircle } from 'lucide-react'; // Added HelpCircle for quiz button
import { toast } from "sonner";
import { doc, getDoc, updateDoc, increment, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import ReactPlayer from 'react-player'; // Or your preferred player

interface TrainingContentData {
  id: string;
  title: string;
  description?: string;
  contentType: 'video' | 'pdf';
  fileUrl: string;
  duration?: string;
  department?: string;
  // views and completions are tracked in Firestore, but not strictly needed in this interface for display here
}


const TrainingViewer = () => {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>(); // videoId is the training_content ID

  const [content, setContent] = useState<TrainingContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletedByCurrentUser, setIsCompletedByCurrentUser] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // For "Mark as Complete" button

  const [associatedQuizId, setAssociatedQuizId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Controlled by ReactPlayer callbacks
  const [videoProgress, setVideoProgress] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const employeeId = localStorage.getItem('employeeId');

  // Simplified activeTab logic for now, assuming content type dictates view
  // const [activeTab, setActiveTab] = useState("video");


  const handleBackToList = () => {
    navigate('/employee-dashboard');
  };


  const handleRating = (stars: number) => {
    setRating(stars);
    toast.success(`Thank you for your ${stars}-star rating!`);
    // TODO: Optionally save rating to Firestore
  };

   // handleVideoTimeUpdate and togglePlayPause are not needed if ReactPlayer handles controls and progress.
  // ReactPlayer's onProgress callback updates videoProgress directly.


  useEffect(() => {
    console.log("TrainingViewer useEffect: videoId from params:", videoId, "employeeId from localStorage:", employeeId);
    if (!videoId) {
      toast.error("Training content ID is missing.");
      navigate(-1);
      return;
    }
    if (!employeeId) {
      toast.error("User not identified. Please log in.");
      navigate('/login');
      return;
    }

    const fetchContentAndLogView = async () => {
      setIsLoading(true);
      try {
        const contentRef = doc(db, "training_content", videoId);
        console.log("TrainingViewer fetchContentAndLogView: Fetching content for ID:", videoId);
        const contentSnap = await getDoc(contentRef);

        if (contentSnap.exists()) {
          const contentData = { id: contentSnap.id, ...contentSnap.data() } as TrainingContentData;
          setContent(contentData);
          console.log("TrainingViewer fetchContentAndLogView: Content data fetched:", contentData);
          
          // Log view - increment view count
          // Consider adding logic here to only increment view once per user per content
          await updateDoc(contentRef, {
            views: increment(1)
          });

          // Check if this user has completed this content
          const employeeRef = doc(db, "employees", employeeId);
          const employeeSnap = await getDoc(employeeRef);
          console.log("TrainingViewer fetchContentAndLogView: Fetched employee doc for completion check. Exists:", employeeSnap.exists());
          if (employeeSnap.exists()) {
            const completedIds = employeeSnap.data()?.completedVideoIds || [];
            setIsCompletedByCurrentUser(completedIds.includes(videoId));
            console.log("TrainingViewer fetchContentAndLogView: Is content completed by current user?", completedIds.includes(videoId));
          }

          // Fetch associated quiz
          // The relatedTrainingContentId in assessments is stored as "content-THE_ACTUAL_ID"
          console.log("TrainingViewer fetchContentAndLogView: Fetching associated quiz for contentId:", `content-${videoId}`);
          const assessmentsRef = collection(db, "assessments");
          const quizQuery = query(assessmentsRef, where("relatedTrainingContentId", "==", `content-${videoId}`));
          const quizSnapshot = await getDocs(quizQuery);

          if (!quizSnapshot.empty) {
            setAssociatedQuizId(quizSnapshot.docs[0].id); // Store the ID of the first matching quiz
          } else {
            setAssociatedQuizId(null);
          }

        } else {
          toast.error("Training content not found.");
          navigate('/employee-dashboard');
        }
      } catch (error) {
        console.error("Error fetching training content:", error);
        toast.error("Failed to load training content.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentAndLogView();
  }, [videoId, navigate, employeeId]);

  const handleMarkAsComplete = async () => {
    if (!videoId || !employeeId || isCompletedByCurrentUser || !content) return;

    setIsUpdating(true);
    try {
      const employeeRef = doc(db, "employees", employeeId);
      await updateDoc(employeeRef, {
        completedVideoIds: arrayUnion(videoId)
      });

      const contentRef = doc(db, "training_content", videoId);
      await updateDoc(contentRef, {
        completions: increment(1)
      });

      setIsCompletedByCurrentUser(true);
      toast.success(`"${content.title}" marked as complete!`);
    } catch (error) {
      console.error("Error marking as complete:", error);
      toast.error("Failed to mark as complete.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[#ea384c]" /> <p className="ml-4 text-xl">Loading Training...</p></div>;
  }

  if (!content) {
    return <div className="min-h-screen flex items-center justify-center"><p>Content not found.</p></div>;
  }

  // Log the fileUrl for video content to help debug
  if (content.contentType === 'video') {
  console.log("TrainingViewer (render): Preparing to render ReactPlayer. fileUrl:", content.fileUrl, "Full content object:", content);
 }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#000000] text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Spare Parts Academy</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToList}
            className="text-black border-white hover:bg-[#ea384c] hover:border-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{content.title}</h2>
          <p className="text-gray-600">{content.description}</p>
          <div className="flex items-center mt-2">
          {content.department && (
              <span className="inline-block bg-black text-white px-3 py-1 rounded text-sm mr-4">
                {content.department}
              </span>
            )}
            {content.duration && (
              <span className="text-gray-500 text-sm">
                Duration: {content.duration}
              </span>
            )}
          </div>
        </div>

        {/* Content Display Area */}
        <Card>
          <CardHeader>
            <CardTitle>{content.contentType === 'video' ? "Training Video" : "Training Document"}</CardTitle>
            <CardDescription>
              {content.contentType === 'video' ? "Watch the full video to complete this module." : "Read through the document to complete this module."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {content.contentType === 'video' && (
              <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                {/* Using ReactPlayer for broader compatibility, assuming fileUrl is a direct video URL or YouTube link */}
                <ReactPlayer
                  key={content.fileUrl} // Add key to force re-mount if URL changes
                  url={content.fileUrl}
                  playing={isPlaying}
                  controls
                  width="100%"
                  height="100%"
                  onProgress={(state) => setVideoProgress(state.played * 100)}
                  onReady={() => console.log("ReactPlayer: onReady triggered for URL:", content.fileUrl)}
                  onStart={() => console.log("ReactPlayer: onStart triggered for URL:", content.fileUrl)}
                  config={{
                    file: {
                      forceVideo: true, // Try forcing it to be treated as a video
                      attributes: { crossOrigin: 'anonymous' }
                    }
                  }}
                  onPlay={() => { console.log("ReactPlayer: onPlay"); setIsPlaying(true); }}
                  onPause={() => { console.log("ReactPlayer: onPause"); setIsPlaying(false); }}
                  onEnded={() => {
                    setIsPlaying(false);
                    // Optionally auto-mark as complete or prompt user
                    }}
                  onError={(e) => {
                    console.error("ReactPlayer Error:", e); 
                    toast.error("Video could not be loaded. Please check the console for details.");
 
                  }}
                />
              </div>
            )}

            {content.contentType === 'pdf' && (
              <div className="aspect-[3/4] md:aspect-video bg-white border rounded-md overflow-hidden mb-4">
                <iframe
                  src={content.fileUrl}
                  className="w-full h-[600px] md:h-full" // Ensure iframe has enough height
                  title={content.title}
                />
              </div>
            )}

            {/* Progress and Rating - can be simplified or enhanced */}
            {content.contentType === 'video' && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Progress:</span>
                  <span className="text-sm font-medium">{Math.round(videoProgress)}%</span>
                </div>
                <Progress value={videoProgress} className="h-2 [&>*]:bg-[#ea384c]" />
                </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {!isCompletedByCurrentUser ? (
                <Button
                  onClick={handleMarkAsComplete}
                  disabled={isUpdating}
                  size="lg"
                  className="w-full sm:w-auto bg-[#ea384c] hover:bg-[#d9293d]"
                >
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Mark as Complete
                </Button>
              ) : (
                <div className="w-full sm:w-auto text-center p-3 bg-green-100 text-green-700 rounded-md border border-green-300">
                  <CheckCircle className="inline-block mr-2 h-5 w-5" /> You have completed this training!
                </div>
                )}

              {/* Display "Start Quiz" button if content is complete and a quiz is associated */}
              {isCompletedByCurrentUser && associatedQuizId && (
                <Button
                  onClick={() => navigate(`/quiz/${associatedQuizId}`)}
                  size="lg"
                  variant="default" // Or another variant like "success" if you have one
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Start Quiz for this Training
                </Button>
              )}
                  <div className="flex items-center">
                    Rate this document:
                    <div className="ml-2 flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 cursor-pointer ${
                            rating && star <= rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                          onClick={() => handleRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingViewer;
