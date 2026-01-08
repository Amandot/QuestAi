import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, PlusCircle, BarChart2, LogOut, Clock, FileText, Trash2, Play, Award, CheckCircle2 } from 'lucide-react';
import { quizAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getUserQuizzes();
      // Sort by created_at descending (newest first)
      const sortedQuizzes = response.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setQuizzes(sortedQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await quizAPI.deleteQuiz(quizId);
      toast.success('Quiz deleted successfully');
      fetchQuizzes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const completedQuizzes = quizzes.filter(q => q.score !== null && q.score !== undefined).length;
  const totalQuizzes = quizzes.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-7 w-7 text-primary-600" />
            <span className="text-xl font-semibold text-gray-900">QuEstAI</span>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-gray-600">
                Signed in as <span className="font-medium">{user.username}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Generate AI-powered quizzes from your PDFs or text content, and review past quizzes.
            </p>
          </div>
          <button
            onClick={() => navigate('/generate')}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium shadow-sm hover:bg-primary-700"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Quiz
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total quizzes</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{totalQuizzes}</p>
              </div>
              <BarChart2 className="h-8 w-8 text-primary-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{completedQuizzes}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average score</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {completedQuizzes > 0
                    ? Math.round(
                        quizzes
                          .filter(q => q.score !== null && q.score !== undefined)
                          .reduce((sum, q) => sum + q.score, 0) / completedQuizzes
                      )
                    : '–'}
                  {completedQuizzes > 0 && '%'}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Quiz History */}
        <section className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quiz History</h2>
            <Link
              to="/generate"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Generate a quiz
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">You don&apos;t have any quizzes yet.</p>
              <p className="text-sm text-gray-500">
                Click &quot;New Quiz&quot; to upload a PDF or paste text and let QuEstAI generate questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                        {quiz.score !== null && quiz.score !== undefined ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Not Started
                          </span>
                        )}
                      </div>
                      {quiz.description && (
                        <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {quiz.total_questions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(quiz.created_at)}
                        </span>
                        {quiz.score !== null && quiz.score !== undefined && (
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <Award className="h-4 w-4" />
                            Score: {Math.round(quiz.score)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {quiz.score === null || quiz.score === undefined ? (
                        <button
                          onClick={() => navigate(`/quiz/${quiz.id}`)}
                          className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                          <Play className="h-4 w-4 mr-1.5" />
                          Take Quiz
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/quiz/${quiz.id}/results`)}
                            className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100"
                          >
                            <Award className="h-4 w-4 mr-1.5" />
                            View Results
                          </button>
                          <button
                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                            className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                            title="Retake quiz"
                          >
                            <Play className="h-4 w-4 mr-1.5" />
                            Retake
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                        title="Delete quiz"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;


