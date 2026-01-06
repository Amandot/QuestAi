import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, PlusCircle, BarChart2, LogOut } from 'lucide-react';
import { quizAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

        {/* Placeholder stats / content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total quizzes</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">–</p>
              </div>
              <BarChart2 className="h-8 w-8 text-primary-500" />
            </div>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 mb-2">Recent activity</p>
            <p className="text-gray-700 text-sm">
              Your recently generated quizzes will appear here.
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 mb-2">Get started</p>
            <p className="text-gray-700 text-sm">
              Click &quot;New Quiz&quot; to upload a PDF or paste text and let QuEstAI generate questions.
            </p>
          </div>
        </div>

        {/* Placeholder for quiz list – can be wired to `quizAPI.getUserQuizzes()` later */}
        <section className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your quizzes</h2>
            <Link
              to="/generate"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Generate a quiz
            </Link>
          </div>
          <p className="text-sm text-gray-600">
            You don&apos;t have any quizzes yet. Generate one to see it listed here.
          </p>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;


