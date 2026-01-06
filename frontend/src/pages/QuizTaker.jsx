import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';

const QuizTaker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz && !submitted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quiz, submitted]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getQuiz(id);
      setQuiz(response.data);
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    const unansweredCount = quiz.questions.length - Object.keys(answers).length;
    
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    try {
      const submission = {
        answers: quiz.questions.map(q => ({
          question_id: q.id,
          user_answer: answers[q.id] || ''
        }))
      };

      const response = await quizAPI.submitQuiz(id, submission);
      setSubmitted(true);
      
      // Store results in sessionStorage for immediate access
      const resultsData = {
        ...response.data,
        time_taken: timeElapsed,
        quiz_title: quiz.title
      };
      sessionStorage.setItem(`quiz_results_${id}`, JSON.stringify(resultsData));
      
      toast.success('Quiz submitted successfully!');
      navigate(`/quiz/${id}/results`);
    } catch (error) {
      console.error('Quiz submission error:', error);
      if (error.response?.status === 404) {
        toast.error('Quiz not found or you don\'t have permission to access it');
        navigate('/dashboard');
      } else if (error.response?.status === 400) {
        toast.error('Invalid submission data. Please check your answers.');
      } else {
        toast.error('Failed to submit quiz. Please try again.');
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercentage = () => {
    return Math.round((getAnsweredCount() / quiz.questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="text-center">
          <LoadingSpinner size="xl" color="white" />
          <p className="mt-4 text-white font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <AnimatedCard className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Quiz not found</h2>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </AnimatedCard>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progressPercentage = getProgressPercentage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </Link>
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg mr-3">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
                  <p className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
              </div>
              <div className="text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Progress:</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-primary-600 font-medium">{progressPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <AnimatedCard delay={0} className="card sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                Questions
              </h3>
              <div className="grid grid-cols-5 lg:grid-cols-1 gap-2 mb-6">
                {quiz.questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : answers[q.id]
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {index + 1}
                      {answers[q.id] && (
                        <CheckCircle className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span className="font-medium">{getAnsweredCount()}/{quiz.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium">{quiz.questions.length - getAnsweredCount()}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleSubmit}
                  className="w-full btn-primary"
                >
                  Submit Quiz
                </button>
              </div>
            </AnimatedCard>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <AnimatedCard delay={1} className="card">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {question.question_type}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {question.bloom_level}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentQuestion + 1} / {quiz.questions.length}
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                  {question.question_text}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-4 mb-8">
                {question.question_type === 'MCQ' && question.options && (
                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          answers[question.id] === option
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                          answers[question.id] === option
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[question.id] === option && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-900 flex-1">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === 'True/False' && (
                  <div className="space-y-3">
                    {['True', 'False'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          answers[question.id] === option
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                          answers[question.id] === option
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[question.id] === option && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-900 flex-1">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === 'Short Answer' && (
                  <div>
                    <textarea
                      className="input-field h-32 resize-none"
                      placeholder="Type your answer here..."
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Provide a clear and concise answer to the question above.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Previous
                </button>
                
                <div className="text-sm text-gray-500">
                  {answers[question.id] ? (
                    <span className="text-green-600 font-medium">✓ Answered</span>
                  ) : (
                    <span>Not answered</span>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                  disabled={currentQuestion === quiz.questions.length - 1}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Next
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;