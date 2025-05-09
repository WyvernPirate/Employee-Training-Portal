import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Video, FileText } from 'lucide-react';

interface UploadContentAdminTabProps {
  contentTitle: string;
  setContentTitle: (title: string) => void;
  contentDescription: string;
  setContentDescription: (desc: string) => void;
  contentType: 'video' | 'pdf';
  setContentType: (type: 'video' | 'pdf') => void;
  contentDepartment: string;
  setContentDepartment: (dept: string) => void;
  contentFile: File | null;
  setContentFile: (file: File | null) => void;
  thumbnailFile: File | null;
  setThumbnailFile: (file: File | null) => void;
  uploadProgress: number;
  isUploading: boolean;
  isDraggingContent: boolean;
  handleContentDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleContentDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleContentDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  contentFileInputRef: React.RefObject<HTMLInputElement>;
  isDraggingThumbnail: boolean;
  handleThumbnailDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleThumbnailDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleThumbnailDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  thumbnailFileInputRef: React.RefObject<HTMLInputElement>;
  handleContentUpload: (e: React.FormEvent) => void;
  departmentOptions: string[];
}

const UploadContentAdminTab: React.FC<UploadContentAdminTabProps> = ({
  contentTitle, setContentTitle, contentDescription, setContentDescription,
  contentType, setContentType, contentDepartment, setContentDepartment,
  contentFile, setContentFile, thumbnailFile, setThumbnailFile,
  uploadProgress, isUploading, isDraggingContent,
  handleContentDragOver, handleContentDragLeave, handleContentDrop, contentFileInputRef,
  isDraggingThumbnail, handleThumbnailDragOver, handleThumbnailDragLeave, handleThumbnailDrop, thumbnailFileInputRef,
  handleContentUpload, departmentOptions
}) => {
  return (
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

          <div className="space-y-2">
            <Label htmlFor="content-file-input">Content File (Video or PDF)</Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${isDraggingContent ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
              onDragOver={handleContentDragOver}
              onDragLeave={handleContentDragLeave}
              onDrop={handleContentDrop}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex">
                  <Video className="h-10 w-10 text-gray-400" />
                  <FileText className="h-10 w-10 text-gray-400 ml-2" />
                </div>
                <p className="text-sm text-gray-500">
                  Click to upload or drag and drop
                  {isDraggingContent && <span className="text-blue-600 font-semibold"> Release to drop!</span>}
                </p>
                <p className="text-xs text-gray-500">Accepted: MP4, MOV, AVI, PDF</p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => contentFileInputRef.current?.click()}>Choose File</Button>
              </div>
              <Input ref={contentFileInputRef} id="content-file-input" type="file" accept=".mp4,.mov,.avi,.mkv,.webm,.pdf" onChange={(e) => setContentFile(e.target.files ? e.target.files[0] : null)} className="sr-only" />
              {contentFile && <p className="text-sm text-green-600 mt-2">Selected: {contentFile.name}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail-input">Thumbnail Image (optional)</Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${isDraggingThumbnail ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
              onDragOver={handleThumbnailDragOver}
              onDragLeave={handleThumbnailDragLeave}
              onDrop={handleThumbnailDrop}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <FileText className="h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Click to upload or drag and drop thumbnail
                  {isDraggingThumbnail && <span className="text-blue-600 font-semibold"> Release to drop!</span>}
                </p>
                <p className="text-xs text-gray-500">Accepted: PNG, JPG, GIF</p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => thumbnailFileInputRef.current?.click()}>Choose Thumbnail</Button>
              </div>
              <Input ref={thumbnailFileInputRef} id="thumbnail-input" type="file" accept="image/png, image/jpeg, image/gif, image/webp" onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)} className="sr-only" />
              {thumbnailFile && <p className="text-sm text-green-600 mt-2">Selected: {thumbnailFile.name}</p>}
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
  );
};

export default UploadContentAdminTab;