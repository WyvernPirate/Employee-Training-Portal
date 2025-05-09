
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Assuming this is available from shadcn/ui
import { Star, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'; // Removed Play, Pause as ReactPlayer handles controls
import { toast } from "sonner";
import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import ReactPlayer from 'react-player/youtube'; // Or your preferred player

interface TrainingContentData {
  id: string;
  title: string;
  description?: string;
  contentType: 'video' | 'pdf';
  fileUrl: string;
  duration?: string;
  department?: string;

}


const TrainingViewer = () => {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>(); // videoId is the training_content ID

  const [content, setContent] = useState<TrainingContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletedByCurrentUser, setIsCompletedByCurrentUser] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // For "Mark as Complete" button

  const [isPlaying, setIsPlaying] = useState(false);
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
        const contentSnap = await getDoc(contentRef);

        if (contentSnap.exists()) {
          const contentData = { id: contentSnap.id, ...contentSnap.data() } as TrainingContentData;
          setContent(contentData);
          // setActiveTab(contentData.contentType); // Set tab based on fetched content type

          // Log view - increment view count
          await updateDoc(contentRef, {
            views: increment(1)
          });

          // Check if this user has completed this content
          const employeeRef = doc(db, "employees", employeeId);
          const employeeSnap = await getDoc(employeeRef);
          if (employeeSnap.exists()) {
            const completedIds = employeeSnap.data()?.completedVideoIds || [];
            setIsCompletedByCurrentUser(completedIds.includes(videoId));
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
            className="text-white border-white hover:bg-[#ea384c] hover:border-transparent"
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
                  url={content.fileUrl} 
                  playing={isPlaying}
                  controls 
                  width="100%" 
                  height="100%"
                  onProgress={(state) => setVideoProgress(state.played * 100)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false);
                    // Optionally auto-mark as complete or prompt user
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