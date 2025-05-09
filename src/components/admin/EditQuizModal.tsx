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
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Assessment, TrainingContent } from '@/pages/AdminDashboard';

interface QuizQuestionEdit {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface EditQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizToEdit: Assessment | null;
  onSave: (quizId: string, updatedData: Partial<Omit<Assessment, 'id' | 'createdAt'>>) => Promise<void>;
  trainingContentOptions: TrainingContent[];
  departmentOptions: string[];
  isSaving: boolean;
}

const EditQuizModal: React.FC<EditQuizModalProps> = ({
  isOpen,
  onClose,
  quizToEdit,
  onSave,
  trainingContentOptions,
  departmentOptions,
  isSaving
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [relatedContentId, setRelatedContentId] = useState("");
  const [department, setDepartment] = useState("");
  const [questions, setQuestions] = useState<QuizQuestionEdit[]>([]);
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | null>(30);
  const [grantsCertificate, setGrantsCertificate] = useState(false);
  const [certificateTitle, setCertificateTitle] = useState("");

  useEffect(() => {
    if (quizToEdit) {
      setTitle(quizToEdit.title);
      setDescription(quizToEdit.description || ""); 
      setRelatedContentId(quizToEdit.relatedTrainingContentId || "none");
      setDepartment(Array.isArray(quizToEdit.department) ? quizToEdit.department[0] : quizToEdit.department || departmentOptions[0]);
      setQuestions(quizToEdit.questions.map((q, index) => ({ ...q, id: `q-${index}-${Date.now()}` })) || []);
      setPassingScore(quizToEdit.passingScore || 70);
      setTimeLimit(quizToEdit.timeLimitMinutes ?? 30);
      setGrantsCertificate(quizToEdit.grantsCertificate || false);
      setCertificateTitle(quizToEdit.certificateTitle || "");
    }
  }, [quizToEdit, isOpen, departmentOptions]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: keyof QuizQuestionEdit, value: any, optionIndex?: number) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === id) {
        if (field === 'options' && optionIndex !== undefined) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizToEdit) return;

    if (questions.some(q => !q.questionText.trim() || q.options.some(opt => !opt.trim()))) {
      toast.error("Please fill out all question texts and options.");
      return;
    }
    if (questions.length === 0) {
      toast.error("A quiz must have at least one question.");
      return;
    }

    const updatedData: Partial<Omit<Assessment, 'id' | 'createdAt'>> = {
      title,
      description,
      relatedTrainingContentId: relatedContentId === "none" ? null : relatedContentId, 
      department,
      questions: questions.map(({ id, ...rest }) => rest), 
      passingScore,
      timeLimitMinutes: timeLimit,
      grantsCertificate,
      certificateTitle: grantsCertificate ? certificateTitle : " ",
    };

    try {
      await onSave(quizToEdit.id, updatedData);
      onClose();
    } catch (error) {
      toast.error("Failed to save quiz. Please try again.");
      console.error("Error saving quiz:", error);
    }
  };

  if (!quizToEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Quiz: {quizToEdit.title}</DialogTitle>
          <DialogDescription>Make changes to this assessment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-quiz-title">Quiz Title</Label>
            <Input id="edit-quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-quiz-description">Description</Label>
            <Textarea id="edit-quiz-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quiz-related-content">Related Training Content (Optional)</Label>
              <Select value={relatedContentId} onValueChange={setRelatedContentId}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {trainingContentOptions.map(content => (
                    <SelectItem key={content.id} value={`content-${content.id}`}>{content.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quiz-department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departmentOptions.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Label>Questions</Label>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {questions.map((q, qIndex) => (
              <Card key={q.id} className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <Label>Question {qIndex + 1}</Label>
                  {questions.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveQuestion(q.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                </div>
                <Textarea placeholder="Question text" value={q.questionText} onChange={(e) => handleQuestionChange(q.id, 'questionText', e.target.value)} required className="mb-1" />
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2 mt-1">
                    <input type="radio" name={`q-${q.id}-correct`} checked={q.correctAnswerIndex === oIndex} onChange={() => handleQuestionChange(q.id, 'correctAnswerIndex', oIndex)} className="form-radio h-4 w-4 text-[#ea384c] focus:ring-[#ea384c]" />
                    <Input placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => handleQuestionChange(q.id, 'options', e.target.value, oIndex)} required />
                  </div>
                ))}
              </Card>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={handleAddQuestion} className="w-full"><Plus className="mr-2 h-4 w-4" />Add Question</Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quiz-passing-score">Passing Score (%)</Label>
              <Input id="edit-quiz-passing-score" type="number" min="1" max="100" value={passingScore} onChange={(e) => setPassingScore(parseInt(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quiz-time-limit">Time Limit (minutes, 0 for no limit)</Label>
              <Input id="edit-quiz-time-limit" type="number" min="0" value={timeLimit ?? ""} onChange={(e) => setTimeLimit(e.target.value === "" ? null : parseInt(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2 border-t pt-4 mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-quiz-grants-certificate"
                checked={grantsCertificate}
                onChange={(e) => setGrantsCertificate(e.target.checked)}
                className="form-checkbox h-5 w-5 text-[#ea384c] rounded focus:ring-[#ea384c]"
              />
              <Label htmlFor="edit-quiz-grants-certificate">Grants a Certificate upon Passing?</Label>
            </div>
            {grantsCertificate && (
              <div className="space-y-2 pl-7">
                <Label htmlFor="edit-quiz-certificate-title">Certificate Title</Label>
                <Input id="edit-quiz-certificate-title" value={certificateTitle} onChange={(e) => setCertificateTitle(e.target.value)} placeholder="e.g., Certified Brake Systems Technician" required={grantsCertificate} />
              </div>
            )}
          </div>
            
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizModal;