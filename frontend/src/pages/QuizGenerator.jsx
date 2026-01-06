import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { 
  BookOpen, 
  Upload, 
  ArrowLeft, 
  FileText, 
  Settings,
  Zap,
  Type,
  File
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizGenerator = () => {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'text'
  const [formData, setFormData] = useState({
    title: '',
    mcq_count: 5,
    short_answer_count: 3,
    true_false_count: 2,
  });
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('count') ? parseInt(value) || 0 : value
    }));
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    if (value.length <= 10000) {
      setTextContent(value);
    } else {
      toast.error('Text content cannot exceed 10,000 characters');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        toast.error('Please drop a PDF file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation based on input mode
    if (inputMode === 'upload' && !file) {
      toast.error('Please select a PDF file');
      return;
    }
    
    if (inputMode === 'text') {
      if (!textContent.trim()) {
        toast.error('Please enter some text content');
        return;
      }
      if (textContent.trim().length < 100) {
        toast.error('Text content must be at least 100 characters');
        return;
      }
    }
    
    if (!formData.title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    const totalQuestions = formData.mcq_count + formData.short_answer_count + formData.true_false_count;
    if (totalQuestions === 0) {
      toast.error('Please specify at least one question');
      return;
    }

    setLoading(true);
    
    try {
      const config = {
        mcq_count: formData.mcq_count,
        short_answer_count: formData.short_answer_count,
        true_false_count: formData.true_false_count,
        difficulty_distribution: { "Easy": 30, "Medium": 50, "Hard": 20 },
        bloom_levels: ["Remember", "Understand", "Apply", "Analyze"]
      };

      let response;
      if (inputMode === 'upload') {
        response = await quizAPI.generateQuiz(formData.title, config, file);
      } else {
        response = await quizAPI.generateQuizFromText(formData.title, config, textContent);
      }
      
      toast.success('Quiz generated successfully!');
      navigate(`/quiz/${response.data.id}`);
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = formData.mcq_count + formData.short_answer_count + formData.true_false_count;
  const isFormValid = inputMode === 'upload' ? file : textContent.trim().length >= 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link to="/dashboard" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
            </Link>
            <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Generate Quiz</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create AI-Powered Quiz
          </h2>
          <p className="text-gray-600">
            Upload your educational content or paste text directly to generate exam questions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quiz Details */}
          <div className="card">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Quiz Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="input-field"
                  placeholder="e.g., Chapter 5: Photosynthesis Quiz"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Input Mode Toggle */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Upload className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Content Source</h3>
            </div>
            
            {/* Toggle Buttons */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === 'upload'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <File className="h-4 w-4 mr-2" />
                Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === 'text'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Type className="h-4 w-4 mr-2" />
                Paste Text
              </button>
            </div>

            {/* Upload Mode */}
            {inputMode === 'upload' && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 text-green-600 mx-auto" />
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Drop your PDF here, or{' '}
                        <label className="text-primary-600 hover:text-primary-700 cursor-pointer">
                          browse
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Supports PDF files up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Text Mode */}
            {inputMode === 'text' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-2">
                    Paste your study content here *
                  </label>
                  <textarea
                    id="textContent"
                    value={textContent}
                    onChange={handleTextChange}
                    placeholder="Paste your study notes, textbook content, or any educational material here. Minimum 100 characters required."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    style={{ minHeight: '300px' }}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-600">
                      Minimum 100 characters required
                    </p>
                    <p className={`text-sm ${
                      textContent.length > 9000 ? 'text-red-600' : 
                      textContent.length > 8000 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {textContent.length}/10,000 characters
                    </p>
                  </div>
                </div>
                
                {textContent.length > 0 && textContent.length < 100 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Please add more content. You need at least {100 - textContent.length} more characters.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Question Configuration */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Settings className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Question Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="mcq_count" className="block text-sm font-medium text-gray-700 mb-2">
                  Multiple Choice Questions
                </label>
                <input
                  type="number"
                  id="mcq_count"
                  name="mcq_count"
                  min="0"
                  max="20"
                  className="input-field"
                  value={formData.mcq_count}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-1">4 options each</p>
              </div>
              
              <div>
                <label htmlFor="short_answer_count" className="block text-sm font-medium text-gray-700 mb-2">
                  Short Answer Questions
                </label>
                <input
                  type="number"
                  id="short_answer_count"
                  name="short_answer_count"
                  min="0"
                  max="10"
                  className="input-field"
                  value={formData.short_answer_count}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-1">Open-ended responses</p>
              </div>
              
              <div>
                <label htmlFor="true_false_count" className="block text-sm font-medium text-gray-700 mb-2">
                  True/False Questions
                </label>
                <input
                  type="number"
                  id="true_false_count"
                  name="true_false_count"
                  min="0"
                  max="10"
                  className="input-field"
                  value={formData.true_false_count}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-1">Binary choice</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Total Questions:</strong> {totalQuestions} | 
                <strong> Estimated Time:</strong> {Math.ceil(totalQuestions * 2)} minutes
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end space-x-4">
            <Link to="/dashboard" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !isFormValid || totalQuestions === 0}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Generate Quiz
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizGenerator;