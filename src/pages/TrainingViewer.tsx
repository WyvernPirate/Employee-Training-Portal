
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ArrowLeft, Play, Pause, FileVideo } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { toast } from "sonner";

// Mock training content
const mockVideoContent = {
  id: 1,
  title: "Introduction to Brake Systems",
  description: "Learn about the fundamentals of automotive brake systems.",
  videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", // Sample video URL
  pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // Sample PDF URL
  duration: "45 minutes",
  department: "Mechanical",
  totalPages: 10,
};

const TrainingViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("video");
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Get training ID from location state or default to mock content
  const trainingContent = mockVideoContent;

  const handleBackToList = () => {
    navigate('/employee-dashboard');
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
      
      // If video progress is 100%, show the quiz dialog
      if (progress >= 95 && !showQuizDialog) {
        setShowQuizDialog(true);
        toast.success("You've completed this video! Ready for the quiz?");
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < trainingContent.totalPages) {
      setCurrentPage(currentPage + 1);
      const newProgress = (currentPage + 1) / trainingContent.totalPages * 100;
      setPdfProgress(newProgress);
      
      // If PDF progress is 100%, show the quiz dialog
      if (newProgress >= 95 && !showQuizDialog) {
        setShowQuizDialog(true);
        toast.success("You've completed this PDF! Ready for the quiz?");
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      const newProgress = (currentPage - 1) / trainingContent.totalPages * 100;
      setPdfProgress(newProgress);
    }
  };

  const handleRating = (stars: number) => {
    setRating(stars);
    toast.success(`Thank you for your ${stars}-star rating!`);
  };

  const handleTakeQuiz = () => {
    // Navigate to a quiz page or open a quiz component
    setShowQuizDialog(false);
    navigate('/employee-dashboard'); // Replace with actual quiz page path
    toast.info("Quiz functionality will be implemented in the next version!");
  };
  
  useEffect(() => {
    // Track that the user has started this training
    console.log("User started training:", trainingContent.title);
    
    return () => {
      // Track that the user has left the training page
      console.log("User left training:", trainingContent.title);
    };
  }, [trainingContent.title]);

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
          <h2 className="text-3xl font-bold mb-2">{trainingContent.title}</h2>
          <p className="text-gray-600">{trainingContent.description}</p>
          <div className="flex items-center mt-2">
            <span className="inline-block bg-black text-white px-3 py-1 rounded text-sm mr-4">
              {trainingContent.department}
            </span>
            <span className="text-gray-500 text-sm">
              Duration: {trainingContent.duration}
            </span>
          </div>
        </div>

        <Tabs defaultValue="video" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 max-w-md">
            <TabsTrigger value="video">Video Content</TabsTrigger>
            <TabsTrigger value="pdf">PDF Content</TabsTrigger>
          </TabsList>
          
          {/* Video Tab */}
          <TabsContent value="video" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Training Video</CardTitle>
                <CardDescription>Watch the full video to complete this module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                  <video 
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    src={trainingContent.videoUrl}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                  />
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <Button 
                        onClick={togglePlayPause} 
                        size="lg"
                        className="bg-[#ea384c] hover:bg-[#d9293d]"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Play Video
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Progress:</span>
                    <span className="text-sm font-medium">{Math.round(videoProgress)}%</span>
                  </div>
                  <Progress value={videoProgress} className="h-2" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Button onClick={togglePlayPause} variant="outline" className="flex items-center">
                    {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <div className="flex items-center">
                    Rate this video: 
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
          </TabsContent>
          
          {/* PDF Tab */}
          <TabsContent value="pdf" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Training Document</CardTitle>
                <CardDescription>Read through the document to complete this module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] bg-white border rounded-md overflow-hidden mb-4">
                  <iframe 
                    src={`${trainingContent.pdfUrl}#page=${currentPage}`}
                    className="w-full h-full"
                    title="Training Document"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Progress:</span>
                    <span className="text-sm font-medium">
                      Page {currentPage} of {trainingContent.totalPages} ({Math.round(pdfProgress)}%)
                    </span>
                  </div>
                  <Progress value={pdfProgress} className="h-2" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <Button 
                      onClick={handlePrevPage} 
                      disabled={currentPage <= 1}
                      variant="outline" 
                      className="mr-2"
                    >
                      Previous Page
                    </Button>
                    <Button 
                      onClick={handleNextPage} 
                      disabled={currentPage >= trainingContent.totalPages}
                      variant="outline"
                    >
                      Next Page
                    </Button>
                  </div>
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Quiz Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ready to test your knowledge?</DialogTitle>
            <DialogDescription>
              You've completed this training module. Would you like to take a quiz to earn your certificate?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowQuizDialog(false)}>
              Not Yet
            </Button>
            <Button onClick={handleTakeQuiz} className="bg-[#ea384c] hover:bg-[#d9293d]">
              Take Quiz
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingViewer;
