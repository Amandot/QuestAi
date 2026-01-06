import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    return api.post('/auth/login', formData);
  },
};

// Quiz API
export const quizAPI = {
  generateQuiz: (title, config, file) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('config', JSON.stringify(config));
    formData.append('file', file);
    return api.post('/quiz/generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  generateQuizFromText: (title, config, textContent) => {
    return api.post('/quiz/generate/from-text', {
      title,
      config,
      text_content: textContent
    });
  },
  
  getUserQuizzes: () => api.get('/quiz/'),
  
  getQuiz: (quizId) => api.get(`/quiz/${quizId}`),
  
  getQuizResults: (quizId) => api.get(`/quiz/${quizId}/results`),
  
  submitQuiz: (quizId, submission) => api.post(`/quiz/${quizId}/submit`, submission),
  
  exportQuiz: (quizId) => api.get(`/quiz/${quizId}/export/docx`, {
    responseType: 'blob',
  }),
  
  updateQuiz: (quizId, updates) => api.put(`/quiz/${quizId}`, updates),
  
  deleteQuiz: (quizId) => api.delete(`/quiz/${quizId}`),
};

export default api;