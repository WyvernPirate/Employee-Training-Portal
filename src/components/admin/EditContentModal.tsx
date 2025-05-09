import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import  { TrainingContent }  from '@/pages/AdminDashboard'; 

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentToEdit: TrainingContent | null;
  onSave: (
    contentId: string,
    updatedData: Partial<Omit<TrainingContent, 'id' | 'createdAt' | 'views' | 'completions'>>,
    newContentFile?: File | null,
    newThumbnailFile?: File | null
  ) => Promise<void>;
  departmentOptions: string[];
  isSaving: boolean;
}

const EditContentModal: React.FC<EditContentModalProps> = ({
  isOpen,
  onClose,
  contentToEdit,
  onSave,
  departmentOptions,
  isSaving
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<'video' | 'pdf'>("video");
  const [department, setDepartment] = useState("");
  const [newContentFile, setNewContentFile] = useState<File | null>(null);
  const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    if (contentToEdit) {
      setTitle(contentToEdit.title);
      setDescription(contentToEdit.description || "");
      setContentType(contentToEdit.contentType);
      setDepartment(Array.isArray(contentToEdit.department) ? contentToEdit.department[0] : contentToEdit.department || departmentOptions[0]); // Simplified for single select
      setNewContentFile(null); // Reset file inputs
      setNewThumbnailFile(null);
    }
  }, [contentToEdit, isOpen, departmentOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentToEdit) return;

    const updatedData: Partial<Omit<TrainingContent, 'id' | 'createdAt' | 'views' | 'completions'>> = {
      title,
      description,
      contentType,
      department,
    };

    try {
      await onSave(contentToEdit.id, updatedData, newContentFile, newThumbnailFile);
      onClose(); // Close modal on successful save
    } catch (error) {
      // Error is handled by onSave, toast shown there
    }
  };

  if (!contentToEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Training Content</DialogTitle>
          <DialogDescription>Make changes to "{contentToEdit.title}"</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Content Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-contentType">Content Type</Label>
              <Select value={contentType} onValueChange={(value) => setContentType(value as 'video' | 'pdf')}>
                <SelectTrigger id="edit-contentType"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="edit-department"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departmentOptions.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-content-file">Replace Content File (Optional)</Label>
            <Input id="edit-content-file" type="file" accept={contentType === 'video' ? ".mp4,.mov,.avi" : ".pdf"} onChange={(e) => setNewContentFile(e.target.files ? e.target.files[0] : null)} />
            {contentToEdit.fileUrl && !newContentFile && <p className="text-xs text-gray-500 mt-1">Current file: <a href={contentToEdit.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">{contentToEdit.fileUrl.split('/').pop()?.split('?')[0].substring(14)}</a></p>}
            {newContentFile && <p className="text-xs text-green-600 mt-1">New file selected: {newContentFile.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-thumbnail-file">Replace Thumbnail (Optional)</Label>
            <Input id="edit-thumbnail-file" type="file" accept="image/*" onChange={(e) => setNewThumbnailFile(e.target.files ? e.target.files[0] : null)} />
            {contentToEdit.thumbnailUrl && !newThumbnailFile && <p className="text-xs text-gray-500 mt-1">Current thumbnail: <a href={contentToEdit.thumbnailUrl} target="_blank" rel="noopener noreferrer" className="underline">{contentToEdit.thumbnailUrl.split('/').pop()?.split('?')[0].substring(14)}</a></p>}
            {newThumbnailFile && <p className="text-xs text-green-600 mt-1">New thumbnail selected: {newThumbnailFile.name}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContentModal;