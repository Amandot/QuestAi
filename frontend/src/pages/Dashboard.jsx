import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { quizAPI } from '../services/api';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  TrendingUp, 
  Award,
  LogOut,
  User,
  Download,
  Trash2,
  Play,
  BarChart3,
  Target,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    averageScore: 0,
    completedQuizzes: 0
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getUserQuizzes();
      const quizzesData = response.data;
      setQuizzes(quizzesData);
      
      const totalQuizzes = quizzesData.length;
      const totalQuestions = quizzesData.reduce((sum, quiz) => sum + (quiz.total_questions || 0), 0);
      const completedQuizzes = quizzesData.filter(quiz => quiz.score !== null).length;
      const averageScore = completedQuizzes > 0 
        ? quizzesData.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / completedQuizzes 
        : 0;
      
      setStats({ totalQuizzes, totalQuestions, averageScore: Math.round(averageScore), completedQuizzes });
    } catch (error) {
      toast.error('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizAPI.deleteQuiz(quizId);
        toast.success('Quiz deleted successfully');
        fetchQuizzes();
      } catch (error) {
        toast.error('Failed to delete quiz');
      }
    }
  };

  const handleExportQuiz = async (quizId, title) => {
    try {
      const response = await quizAPI.exportQuiz(quizId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}_exam.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Quiz exported successfully');
    } catch (error) {
      toast.error('Failed to export quiz');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-lg border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-blue-600">QuEstAI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.username}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50">
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.username}! 👋</h2>
          <p className="text-lg text-gray-600">Ready to create some amazing quizzes today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</h3>
            <p className="text-gray-600">Total Quizzes</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</h3>
            <p className="text-gray-600">Questions Created</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.averageScore}%</h3>
            <p className="text-gray-600">Average Score</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.completedQuizzes}</h3>
            <p className="text-gray-600">Completed</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Link to="/generate" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg">
            <Plus className="h-5 w-5 mr-2" />
            Create New Quiz
          </Link>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Your Quizzes</h3>
            <div className="flex items-center space-x-2 text-gray-600">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm font-medium">{quizzes.length} total</span>
            </div>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first AI-powered quiz</p>
              <Link to="/generate" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h4>
                      <p className="text-sm text-gray-600">{quiz.description}</p>
                    </div>
                    {quiz.score !== null && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(quiz.score)}`}>
                        {quiz.score}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{quiz.total_questions || 0} questions</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link to={`/quiz/${quiz.id}`} className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                      <Play className="h-4 w-4 mr-1" />
                      {quiz.score !== null ? 'Retake' : 'Start'}
                    </Link>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleExportQuiz(quiz.id, quiz.title)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                        <Download className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;