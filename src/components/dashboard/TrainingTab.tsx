import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, CheckCircle2, FileText, Video as VideoIcon } from 'lucide-react';
import { TrainingVideo } from '@/pages/EmployeeDashboard'; // Import the interface

interface TrainingTabProps {
  trainingVideos: TrainingVideo[];
  handleStartTraining: (trainingId: string) => void;
}

const TrainingTab: React.FC<TrainingTabProps> = ({ trainingVideos, handleStartTraining }) => {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainingVideos.map((video) => (
          <Card key={video.id} className="flex flex-col overflow-hidden">
            <CardHeader className="p-0 relative">
              <img
                src={video.thumbnailUrl || `https://via.placeholder.com/400x225.png/E0E0E0/B0B0B0?text=${video.contentType === 'video' ? 'Video' : 'Document'}`}
                alt={video.title}
                className="rounded-t-lg w-full h-48 object-cover"
              />
              {video.completed && (
                <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white shadow-md">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                </Badge>
              )}
               <Badge variant="secondary" className="absolute top-2 left-2 shadow-md">
                {video.contentType === 'video' ? <VideoIcon className="mr-1 h-3 w-3" /> : <FileText className="mr-1 h-3 w-3" />}
                {video.contentType.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 flex-grow">
              <CardTitle className="text-lg mb-1 line-clamp-2">{video.title}</CardTitle>
              <CardDescription className="text-sm text-gray-600 line-clamp-3 mb-2 h-16">
                {video.description}
              </CardDescription>
              {video.duration && (
                <p className="text-xs text-gray-500">Duration: {video.duration}</p>
              )}
              {video.department && (
                 <Badge variant="outline" className="mt-2 text-xs">
                  {Array.isArray(video.department) ? video.department.join(', ') : video.department}
                </Badge>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleStartTraining(video.id)}
                className="w-full bg-[#ea384c] hover:bg-[#d9293d]"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                {video.completed ? "View Again" : "Start Training"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {trainingVideos.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No Training Content Available</CardTitle>
            <CardDescription className="text-center">
              New training materials will appear here when assigned.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </>
  );
};

export default TrainingTab;