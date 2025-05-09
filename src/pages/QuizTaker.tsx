import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label'; // Assuming Label is from shadcn/ui
import { ArrowLeft, CheckCircle, Loader2, XCircle, Eye } from 'lucide-react';

// Assuming Assessment interface is defined in AdminDashboard or a shared types file
// For now, let's define the necessary parts here or import if available
interface QuizDefinition {
  id: string;
  title: string;
  description?: string;
  questions: Array<{ questionText: string; options: string[]; correctAnswerIndex: number }>;
  passingScore: number;
  timeLimitMinutes?: number;
  relatedTrainingContentId?: string;
  grantsCertificate?: boolean;
  certificateTitle?: string;
}

const QuizTaker = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]); // Array of selected option indices
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [passedQuiz, setPassedQuiz] = useState<boolean | null>(null);

  const employeeId = localStorage.getItem('employeeId');

  useEffect(() => {
    if (!quizId) {
      toast.error("Quiz ID is missing.");
      navigate('/employee-dashboard');
      return;
    }
    if (!employeeId) {
      toast.error("User not identified. Please log in.");
      navigate('/login');
      return;
    }

    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const quizRef = doc(db, "assessments", quizId); // Assuming quizzes are stored in 'assessments'
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          const quizData = { id: quizSnap.id, ...quizSnap.data() } as QuizDefinition;
          // Shuffle questions if desired: quizData.questions.sort(() => Math.random() - 0.5);
          setQuiz(quizData);
          setUserAnswers(new Array(quizData.questions.length).fill(-1)); // Initialize answers
        } else {
          toast.error("Quiz not found.");
          navigate('/employee-dashboard');
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load quiz.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate, employeeId]);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswerIndex) {
        correctCount++;
      }
    });
    return Math.round((correctCount / quiz.questions.length) * 100);
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !employeeId || isSubmitting) return;

    // Optional: Add validation to ensure all questions are answered
    if (userAnswers.some(answer => answer === -1)) {
       toast.warning("Please answer all questions before submitting.");
       return;
    }

    setIsSubmitting(true);
    try {
      const score = calculateScore();
      const passed = score >= quiz.passingScore;
      setFinalScore(score);
      setPassedQuiz(passed);

      // Save the result to a new collection (e.g., employee_assessment_results)
      await addDoc(collection(db, "employee_assessment_results"), {
        employeeId: employeeId,
        quizId: quiz.id,
        title: quiz.title,
        score: score,
        status: passed ? 'Passed' : 'Failed',
        userAnswers: userAnswers,
        questions: quiz.questions, // Save the questions for review purposes
        submittedAt: serverTimestamp(),
      });

      setQuizCompleted(true);
      toast.success(`Quiz submitted!`);

      // Issue certificate if applicable
      if (passed && quiz.grantsCertificate && quiz.certificateTitle) {
        try {
          await addDoc(collection(db, "certificates"), {
            employeeId: employeeId,
            quizId: quiz.id, // Link to the quiz that granted it
            title: quiz.certificateTitle,
            issuedDate: serverTimestamp(),
            issuingBody: "Spare Parts Classroom", // You can make this configurable later
            relatedTrainingContentId: quiz.relatedTrainingContentId || null, // Store if available
          });
          toast.info(`Congratulations! You've earned the "${quiz.certificateTitle}" certificate!`);
        } catch (certError) {
          console.error("Error issuing certificate:", certError);
          toast.error("Quiz passed, but there was an issue issuing your certificate. Please contact admin.");
        }
      }

    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[#ea384c]" /> <p className="ml-4 text-xl">Loading Quiz...</p></div>;
  }

  if (!quiz) {
    return <div className="min-h-screen flex items-center justify-center"><p>Quiz not found.</p></div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Button onClick={() => navigate('/employee-dashboard')} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
          <div className="text-sm text-gray-600 mt-2">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
            {quiz.timeLimitMinutes && ` | Time Limit: ${quiz.timeLimitMinutes} minutes`}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {quizCompleted ? (
            <div className="text-center p-6">
              {passedQuiz ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              )}
              <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
              <p className={`text-xl font-semibold ${passedQuiz ? 'text-green-600' : 'text-red-600'}`}>
                Your Score: {finalScore}% - {passedQuiz ? "Passed" : "Failed"}
              </p>
              <p className="text-gray-600 mt-1">
                Passing Score was: {quiz.passingScore}%
              </p>
              <div className="mt-6 space-y-3">
                <Button onClick={() => navigate('/employee-dashboard')} className="w-full sm:w-auto">
                  Return to Dashboard
                </Button>
                {/* Optional: Button to review answers - implement if needed */}
                {/* <Button variant="outline" onClick={() => alert("Review answers functionality coming soon!")} className="w-full sm:w-auto">
                  <Eye className="mr-2 h-4 w-4" /> Review Answers
                </Button> */}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <p className="text-lg font-semibold">{currentQuestion.questionText}</p>
                <RadioGroup
                  value={userAnswers[currentQuestionIndex]?.toString()} // Use string value for RadioGroup
                  onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`q${currentQuestionIndex}-opt${index}`} />
                      <Label htmlFor={`q${currentQuestionIndex}-opt${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between mt-6">
                <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                  Previous
                </Button>
                {isLastQuestion ? (
                  <Button onClick={handleSubmitQuiz} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Quiz'}
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizTaker;
