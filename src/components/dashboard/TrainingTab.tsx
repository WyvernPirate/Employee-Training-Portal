
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, FileVideo, Star } from 'lucide-react';

interface TrainingTabProps {
  trainingVideos: any[];
  handleStartTraining: (videoId: number) => void;
}

const TrainingTab = ({ trainingVideos, handleStartTraining }: TrainingTabProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trainingVideos.map(video => (
        <Card key={video.id} className="overflow-hidden flex flex-col">
          <div className="relative">
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-[150px] object-cover"
            />
            <Badge className="absolute top-2 right-2 bg-black">
              {video.department}
            </Badge>
            <div className="absolute bottom-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </div>
          </div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{video.title}</CardTitle>
              {video.completed && (
                <Badge variant="outline" className="bg-green-500 text-white">
                  Completed
                </Badge>
              )}
            </div>
            <CardDescription>{video.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {/* Rating section removed as per request */}
          </CardContent>
          <CardFooter>
            <Button 
              className={video.completed ? "bg-gray-500" : "bg-[#ea384c] hover:bg-[#d9293d]"}
              disabled={video.completed}
              onClick={() => handleStartTraining(video.id)}
            >
              {video.completed ? (
                <>
                  <FileVideo className="mr-2 h-4 w-4" />
                  Completed
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Training
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default TrainingTab;
