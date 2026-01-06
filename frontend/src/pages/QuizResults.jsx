import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { 
  BookOpen, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Info,
  TrendingUp,
  Download,
  Eye,
  EyeOff,
  Award,
  Target,
  BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';

const QuizResults = () => {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSourceContext, setShowSourceContext] = useState({});

  useEffect(() => {
    fetchResults();
    
    // Cleanup function to clear sessionStorage when component unmounts
    return () => {
      // Clear the stored results when leaving the page
      sessionStorage.removeItem(`quiz_results_${id}`);
    };
  }, [id]);

  const fetchResults = async () => {
    try {
      // First check if we have fresh results from submission in sessionStorage
      const storedResults = sessionStorage.getItem(`quiz_results_${id}`);
      
      if (storedResults) {
        // Use fresh results from recent submission
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
        setLoading(false);
        return;
      }
      
      // Otherwise try to fetch from API (limited data available)
      try {
        const response = await quizAPI.getQuizResults(id);
        const basicResults = response.data;
        
        // Create a basic results structure
        setResults({
          score: basicResults.score,
          total_questions: basicResults.total_questions,
          quiz_title: basicResults.quiz_title,
          correct_answers: Math.round((basicResults.score / 100) * basicResults.total_questions),
          time_taken: 0, // Not available from stored data
          results: [], // Detailed results not available
          isBasicResults: true
        });
      } catch (apiError) {
        if (apiError.response?.status === 400) {
          // Quiz not submitted yet
          toast.error('This quiz has not been submitted yet.');
          navigate(`/quiz/${id}`);
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleSourceContext = (questionId) => {
    setShowSourceContext(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-gradient-to-br from-green-50 to-green-100';
    if (score >= 60) return 'bg-gradient-to-br from-yellow-50 to-yellow-100';
    return 'bg-gradient-to-br from-red-50 to-red-100';
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Outstanding', icon: Award, color: 'text-green-600' };
    if (score >= 80) return { level: 'Excellent', icon: TrendingUp, color: 'text-green-600' };
    if (score >= 70) return { level: 'Good', icon: Target, color: 'text-blue-600' };
    if (score >= 60) return { level: 'Fair', icon: BarChart3, color: 'text-yellow-600' };
    return { level: 'Needs Improvement', icon: TrendingUp, color: 'text-red-600' };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Data for charts
  const pieData = results ? [
    { name: 'Correct', value: results.correct_answers, color: '#10B981' },
    { name: 'Incorrect', value: results.total_questions - results.correct_answers, color: '#EF4444' }
  ] : [];

  const bloomData = results && results.results && results.results.length > 0 ? 
    results.results.reduce((acc, result) => {
      const level = result.bloom_level;
      const existing = acc.find(item => item.level === level);
      if (existing) {
        existing.correct += result.is_correct ? 1 : 0;
        existing.total += 1;
      } else {
        acc.push({
          level,
          correct: result.is_correct ? 1 : 0,
          total: 1,
          percentage: 0
        });
      }
      return acc;
    }, []).map(item => ({
      ...item,
      percentage: Math.round((item.correct / item.total) * 100)
    })) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="text-center">
          <LoadingSpinner size="xl" color="white" />
          <p className="mt-4 text-white font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <AnimatedCard className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Results not found</h2>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </AnimatedCard>
      </div>
    );
  }

  const performance = getPerformanceLevel(results.score);
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                  <h1 className="text-xl font-bold text-gray-900">Quiz Results</h1>
                  <p className="text-sm text-gray-600">Performance Analysis & Feedback</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => quizAPI.exportQuiz(id)}
              className="btn-secondary flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Results
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AnimatedCard delay={0} className={`card ${getScoreBgColor(results.score)} text-center`}>
            <div className={`text-5xl font-bold ${getScoreColor(results.score)} mb-2`}>
              {results.score.toFixed(1)}%
            </div>
            <p className="text-gray-600 font-medium">Overall Score</p>
          </AnimatedCard>
          
          <AnimatedCard delay={1} className="card text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {results.correct_answers}
            </div>
            <p className="text-gray-600">Correct Answers</p>
            <p className="text-sm text-green-600 font-medium">out of {results.total_questions}</p>
          </AnimatedCard>
          
          <AnimatedCard delay={2} className="card text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">
              {results.total_questions - results.correct_answers}
            </div>
            <p className="text-gray-600">Wrong Answers</p>
            {results.total_questions - results.correct_answers > 0 && (
              <p className="text-sm text-red-600 font-medium">Need to review</p>
            )}
          </AnimatedCard>

          <AnimatedCard delay={3} className="card text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {results.time_taken ? formatTime(results.time_taken) : 'N/A'}
            </div>
            <p className="text-gray-600">Time Taken</p>
          </AnimatedCard>
        </div>

        {/* Performance Summary */}
        <AnimatedCard delay={4} className="card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <PerformanceIcon className={`h-8 w-8 ${performance.color} mr-3`} />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Performance: {performance.level}</h3>
                <p className="text-gray-600">
                  {results.correct_answers === results.total_questions 
                    ? "Perfect score! You got all questions right! 🎉"
                    : results.total_questions - results.correct_answers === 1
                    ? "Almost perfect! Just one question to review."
                    : `You got ${results.total_questions - results.correct_answers} questions wrong. Review them below to improve.`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(results.score)}`}>
                {results.score.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500">
                {results.correct_answers}/{results.total_questions} correct
              </p>
            </div>
          </div>
        </AnimatedCard>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score Distribution */}
          <AnimatedCard delay={5} className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-6 w-6 text-primary-600 mr-2" />
              Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 font-medium">Correct ({results.correct_answers})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 font-medium">Incorrect ({results.total_questions - results.correct_answers})</span>
              </div>
            </div>
          </AnimatedCard>

          {/* Bloom's Taxonomy Performance */}
          <AnimatedCard delay={6} className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-6 w-6 text-primary-600 mr-2" />
              Bloom's Taxonomy Performance
            </h3>
            {bloomData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={bloomData}>
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-2">
                  Performance across different cognitive levels
                </p>
              </>
            ) : (
              <div className="text-center py-16">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Detailed performance data not available
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Retake the quiz to see cognitive level analysis
                </p>
              </div>
            )}
          </AnimatedCard>
        </div>

        {/* Wrong Answers Summary */}
        {results && results.results && !results.isBasicResults && (
          <AnimatedCard delay={7} className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <XCircle className="h-6 w-6 text-red-600 mr-2" />
              Questions You Got Wrong
            </h3>
            
            {results.results.filter(result => !result.is_correct).length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-green-700 mb-2">Perfect Score!</h4>
                <p className="text-green-600">You answered all questions correctly. Great job! 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.results
                  .map((result, originalIndex) => ({ ...result, originalIndex }))
                  .filter(result => !result.is_correct)
                  .map((result, wrongIndex) => (
                    <div key={result.question_id} className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-red-100 rounded-full mr-3">
                            <XCircle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <span className="text-lg font-medium text-red-900">
                              Question {result.originalIndex + 1}
                            </span>
                            <span className="ml-2 text-sm text-red-600">
                              (Wrong Answer #{wrongIndex + 1})
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {result.bloom_level}
                          </span>
                          {result.source_page && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                              Page {result.source_page}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-red-800 mb-2">Question:</p>
                        <p className="text-red-900 text-lg leading-relaxed bg-white p-3 rounded-lg border border-red-200">
                          {result.question_text}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-red-800 mb-2 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" />
                            Your Wrong Answer:
                          </p>
                          <div className="p-4 rounded-lg bg-red-100 text-red-900 border-2 border-red-300 font-medium">
                            {result.user_answer || 'No answer provided'}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-green-800 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Correct Answer:
                          </p>
                          <div className="p-4 rounded-lg bg-green-100 text-green-900 border-2 border-green-300 font-medium">
                            {result.correct_answer}
                          </div>
                        </div>
                      </div>
                      
                      {/* Explanation for wrong answers */}
                      {result.source_context && (
                        <div className="mt-4">
                          <button
                            onClick={() => toggleSourceContext(result.question_id)}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors mb-3"
                          >
                            {showSourceContext[result.question_id] ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide Explanation
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Why is this wrong? Show explanation
                              </>
                            )}
                          </button>
                          
                          {showSourceContext[result.question_id] && (
                            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                              <div className="flex items-start">
                                <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-blue-900 mb-2">
                                    Explanation (Source: Page {result.source_page}):
                                  </p>
                                  <p className="text-sm text-blue-800 leading-relaxed">
                                    {result.source_context}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </AnimatedCard>
        )}

        {/* Detailed Results */}
        <AnimatedCard delay={8} className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Info className="h-6 w-6 text-primary-600 mr-2" />
            All Questions Review
          </h3>
          
          {results.isBasicResults ? (
            <div className="text-center py-12">
              <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Detailed Results Not Available
              </h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Detailed question-by-question results are only available immediately after quiz submission. 
                To see detailed feedback, please retake the quiz.
              </p>
              <div className="flex justify-center space-x-4">
                <Link to={`/quiz/${id}`} className="btn-primary">
                  Retake Quiz
                </Link>
                <Link to="/generate" className="btn-secondary">
                  Generate New Quiz
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {results.results && results.results.map((result, index) => (
                <div key={result.question_id} className={`border-2 rounded-xl p-6 hover:shadow-md transition-shadow ${
                  result.is_correct 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {result.is_correct ? (
                        <div className="p-2 bg-green-100 rounded-full mr-3">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-100 rounded-full mr-3">
                          <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                      )}
                      <div>
                        <span className={`text-lg font-medium ${
                          result.is_correct ? 'text-green-900' : 'text-red-900'
                        }`}>
                          Question {index + 1}
                        </span>
                        <span className={`ml-2 text-sm font-medium ${
                          result.is_correct ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.is_correct ? '✓ Correct' : '✗ Wrong'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {result.bloom_level}
                      </span>
                      {result.source_page && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          Page {result.source_page}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className={`mb-4 text-lg leading-relaxed ${
                    result.is_correct ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.question_text}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Your Answer:</p>
                      <div className={`p-4 rounded-lg border-2 font-medium ${
                        result.is_correct 
                          ? 'bg-green-100 text-green-800 border-green-300' 
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {result.user_answer || 'No answer provided'}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Correct Answer:</p>
                      <div className="p-4 rounded-lg bg-green-100 text-green-800 border-2 border-green-300 font-medium">
                        {result.correct_answer}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatedCard>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Link to={`/quiz/${id}`} className="btn-secondary">
            Retake Quiz
          </Link>
          <Link to="/generate" className="btn-secondary">
            Generate New Quiz
          </Link>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;