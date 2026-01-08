import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
        // Ensure results array exists and has bloom_level
        if (parsedResults.results && Array.isArray(parsedResults.results)) {
          // Validate and normalize each result
          parsedResults.results = parsedResults.results.map(result => {
            // Normalize is_correct to boolean
            let isCorrect = false;
            if (result.is_correct === true || result.isCorrect === true || result.is_correct === 1 || result.isCorrect === 1) {
              isCorrect = true;
            } else if (result.is_correct === false || result.isCorrect === false || result.is_correct === 0 || result.isCorrect === 0) {
              isCorrect = false;
            }
            
            return {
              ...result,
              bloom_level: result.bloom_level || result.bloomLevel || 'Unknown',
              is_correct: isCorrect,
              isCorrect: isCorrect // Also set camelCase version for compatibility
            };
          });
          console.log('Quiz results loaded and normalized:', {
            total: parsedResults.results.length,
            withBloom: parsedResults.results.filter(r => r.bloom_level && r.bloom_level !== 'Unknown').length,
            bloomLevels: [...new Set(parsedResults.results.map(r => r.bloom_level))],
            correctCount: parsedResults.results.filter(r => r.is_correct === true).length,
            sampleResult: parsedResults.results[0]
          });
        } else {
          console.warn('Results array is missing or invalid:', parsedResults);
        }
        setResults(parsedResults);
        setLoading(false);
        return;
      }
      
      // Otherwise try to fetch from API (limited data available)
      try {
        const response = await quizAPI.getQuizResults(id);
        const basicResults = response.data;
        
        // Try to fetch quiz questions to get bloom_level data
        let bloomDataFromQuiz = [];
        try {
          const quizResponse = await quizAPI.getQuiz(id);
          const quiz = quizResponse.data;
          if (quiz.questions && Array.isArray(quiz.questions)) {
            // Group questions by bloom_level
            const bloomMap = {};
            quiz.questions.forEach((q, index) => {
              const level = q.bloom_level || 'Unknown';
              if (!bloomMap[level]) {
                bloomMap[level] = { level, total: 0, correct: 0 };
              }
              bloomMap[level].total += 1;
              // We can't determine correct/incorrect without submission data
              // But we can show the distribution
            });
            bloomDataFromQuiz = Object.values(bloomMap).map(item => ({
              ...item,
              percentage: 0 // Can't calculate without submission data
            }));
          }
        } catch (quizError) {
          console.log('Could not fetch quiz for bloom data:', quizError);
        }
        
        // Create a basic results structure
        setResults({
          score: basicResults.score,
          total_questions: basicResults.total_questions,
          quiz_title: basicResults.quiz_title,
          correct_answers: Math.round((basicResults.score / 100) * basicResults.total_questions),
          time_taken: 0, // Not available from stored data
          results: [], // Detailed results not available
          isBasicResults: true,
          bloomDataFromQuiz: bloomDataFromQuiz.length > 0 ? bloomDataFromQuiz : null
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

  // Calculate Bloom's Taxonomy data from results
  const bloomData = useMemo(() => {
    if (!results) {
      console.log('No results available');
      return [];
    }
    
    // Check if we have detailed results with bloom_level
    if (results.results && Array.isArray(results.results) && results.results.length > 0) {
      console.log('Processing results for Bloom data:', {
        totalResults: results.results.length,
        sampleResult: results.results[0]
      });
      
      const bloomMap = results.results.reduce((acc, result) => {
        // Ensure bloom_level exists, try multiple possible field names
        const level = result.bloom_level || result.bloomLevel || 'Unknown';
        
        // Use normalized is_correct value (should be boolean after normalization)
        // Fallback check for any edge cases
        const isCorrect = result.is_correct === true || 
                         result.isCorrect === true || 
                         (typeof result.is_correct !== 'undefined' && result.is_correct !== false && result.is_correct !== 0);
        
        if (!acc[level]) {
          acc[level] = {
            level,
            correct: 0,
            total: 0
          };
        }
        
        if (isCorrect) {
          acc[level].correct += 1;
        }
        acc[level].total += 1;
        
        return acc;
      }, {});
      
      const bloomArray = Object.values(bloomMap).map(item => ({
        ...item,
        percentage: item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0
      })).sort((a, b) => {
        // Sort by Bloom's taxonomy order
        const order = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create', 'Unknown'];
        const aIndex = order.indexOf(a.level);
        const bIndex = order.indexOf(b.level);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });
      
      console.log('Bloom data calculated:', {
        bloomMap,
        bloomArray,
        summary: bloomArray.map(b => `${b.level}: ${b.correct}/${b.total} = ${b.percentage}%`)
      });
      
      return bloomArray;
    }
    
    console.log('No detailed results available', {
      hasResults: !!results.results,
      isArray: Array.isArray(results.results),
      length: results.results?.length
    });
    
    // Fallback: use bloomDataFromQuiz if available (for basic results)
    if (results.bloomDataFromQuiz && Array.isArray(results.bloomDataFromQuiz) && results.bloomDataFromQuiz.length > 0) {
      console.log('Using fallback bloomDataFromQuiz');
      return results.bloomDataFromQuiz;
    }
    
    return [];
  }, [results]);

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
                    <XAxis 
                      dataKey="level" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Correct']}
                      labelFormatter={(label) => `Bloom Level: ${label}`}
                    />
                    <Bar 
                      dataKey="percentage" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      label={{ position: 'top', formatter: (value) => `${value}%` }}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Performance Breakdown:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {bloomData.map((item) => (
                      <div key={item.level} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 mb-1">{item.level}</div>
                        <div className="text-lg font-semibold text-primary-600">
                          {item.percentage}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.correct}/{item.total} correct
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
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
                  {results && results.isBasicResults 
                    ? 'Detailed results are only available immediately after quiz submission. Retake the quiz to see cognitive level analysis.'
                    : 'Bloom\'s taxonomy data is not available for this quiz.'}
                </p>
              </div>
            )}
          </AnimatedCard>
        </div>


        {/* Detailed Results - All Questions */}
        {!results.isBasicResults && results.results && results.results.length > 0 && (
          <>
            {/* Wrong Answers Section - Show First */}
            {results.results.filter(r => !r.is_correct).length > 0 && (
              <AnimatedCard delay={8} className="card mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <XCircle className="h-6 w-6 text-red-600 mr-2" />
                    Questions You Got Wrong ({results.results.filter(r => !r.is_correct).length})
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {results.results
                    .map((result, originalIndex) => ({ ...result, originalIndex }))
                    .filter(result => !result.is_correct)
                    .map((result) => (
                      <div key={result.question_id} className="border-2 border-red-300 rounded-xl p-6 bg-red-50 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-red-200 rounded-full mr-3">
                              <XCircle className="h-6 w-6 text-red-700" />
                            </div>
                            <div>
                              <span className="text-lg font-semibold text-red-900">
                                Question {result.originalIndex + 1}
                              </span>
                              <span className="ml-2 text-sm font-medium text-red-700">
                                ✗ Incorrect
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
                          <p className="text-sm font-semibold text-red-800 mb-2">Question:</p>
                          <p className="text-lg text-red-900 leading-relaxed bg-white p-4 rounded-lg border-2 border-red-200 font-medium">
                            {result.question_text}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-semibold text-red-800 mb-2 flex items-center">
                              <XCircle className="h-4 w-4 mr-1" />
                              Your Answer:
                            </p>
                            <div className="p-4 rounded-lg bg-red-100 text-red-900 border-2 border-red-400 font-semibold">
                              {result.user_answer || 'No answer provided'}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Correct Answer:
                            </p>
                            <div className="p-4 rounded-lg bg-green-200 text-green-900 border-2 border-green-400 font-semibold">
                              {result.correct_answer}
                            </div>
                          </div>
                        </div>
                        
                        {/* Source Context for Wrong Answers */}
                        {result.source_context && (
                          <div className="mt-4">
                            <button
                              onClick={() => toggleSourceContext(result.question_id)}
                              className="flex items-center text-blue-700 hover:text-blue-800 font-semibold transition-colors mb-3"
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
                              <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                                <div className="flex items-start">
                                  <Info className="h-5 w-5 text-blue-700 mr-3 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-semibold text-blue-900 mb-2">
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
              </AnimatedCard>
            )}

            {/* Correct Answers Section */}
            {results.results.filter(r => r.is_correct).length > 0 && (
              <AnimatedCard delay={9} className="card mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    Questions You Got Right ({results.results.filter(r => r.is_correct).length})
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {results.results
                    .map((result, originalIndex) => ({ ...result, originalIndex }))
                    .filter(result => result.is_correct)
                    .map((result) => (
                      <div key={result.question_id} className="border-2 border-green-300 rounded-xl p-5 bg-green-50 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-200 rounded-full mr-3">
                              <CheckCircle className="h-5 w-5 text-green-700" />
                            </div>
                            <div>
                              <span className="text-base font-semibold text-green-900">
                                Question {result.originalIndex + 1}
                              </span>
                              <span className="ml-2 text-sm font-medium text-green-700">
                                ✓ Correct
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {result.bloom_level}
                            </span>
                            {result.source_page && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Page {result.source_page}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-base text-green-900 leading-relaxed mb-3">
                          {result.question_text}
                        </p>
                        
                        <div className="p-3 rounded-lg bg-green-100 text-green-900 border border-green-300 font-medium">
                          <span className="text-sm font-semibold">Your Answer: </span>
                          {result.user_answer || 'No answer provided'}
                        </div>
                      </div>
                    ))}
                </div>
              </AnimatedCard>
            )}

            {/* All Questions Summary */}
            <AnimatedCard delay={10} className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Info className="h-6 w-6 text-primary-600 mr-2" />
                Complete Question Review
              </h3>
              
              <div className="space-y-4">
                {results.results.map((result, index) => (
                  <div key={result.question_id} className={`border-2 rounded-lg p-4 ${
                    result.is_correct 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {result.is_correct ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mr-2" />
                        )}
                        <span className={`font-semibold ${
                          result.is_correct ? 'text-green-900' : 'text-red-900'
                        }`}>
                          Q{index + 1}: {result.is_correct ? 'Correct' : 'Wrong'}
                        </span>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {result.bloom_level}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-800 mb-2">{result.question_text}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Your Answer: </span>
                        <span className={result.is_correct ? 'text-green-800' : 'text-red-800'}>
                          {result.user_answer || 'No answer'}
                        </span>
                      </div>
                      {!result.is_correct && (
                        <div>
                          <span className="font-medium text-gray-600">Correct Answer: </span>
                          <span className="text-green-800 font-semibold">
                            {result.correct_answer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </>
        )}

        {/* Basic Results Message */}
        {results.isBasicResults && (
          <AnimatedCard delay={8} className="card">
            <div className="text-center py-12">
              <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Detailed Results Not Available
              </h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Detailed question-by-question results are only available immediately after quiz submission. 
                To see detailed feedback with your answers and correct answers, please retake the quiz.
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
          </AnimatedCard>
        )}

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