import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(formData);
      if (success) {
        toast.success('Welcome back! 🎉');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="animate-fade-in">
            <div className="flex items-center mb-8">
              <BookOpen className="h-12 w-12 mr-4" />
              <h1 className="text-4xl font-bold">QuestAI</h1>
            </div>
            
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Transform Learning with
              <span className="block text-yellow-300">AI-Powered Quizzes</span>
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Upload your study materials or paste text directly to generate 
              intelligent quizzes that adapt to your learning needs.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center animate-slide-up">
                <Sparkles className="h-5 w-5 mr-3 text-yellow-300" />
                <span>Smart question generation from any content</span>
              </div>
              <div className="flex items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Sparkles className="h-5 w-5 mr-3 text-yellow-300" />
                <span>Multiple question types and difficulty levels</span>
              </div>
              <div className="flex items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <Sparkles className="h-5 w-5 mr-3 text-yellow-300" />
                <span>Instant feedback and detailed analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <AnimatedCard className="card" delay={0.3}>
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 animate-bounce-in">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="heading-md text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Sign in to your QuestAI account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="input-field pl-10"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="input-field pl-10"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary group"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fade-in">
              <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
              <p className="text-xs text-blue-700">
                Username: <code className="bg-blue-100 px-1 rounded">quiztest2</code><br />
                Password: <code className="bg-blue-100 px-1 rounded">testpass123</code>
              </p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};

export default Login;