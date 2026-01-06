# QuEstAI - AI-Powered Exam Question Generator

QuEstAI is an intelligent exam question generator designed for the Indian education system (CBSE-style). It uses advanced NLP techniques to analyze educational content and generate Bloom's taxonomy-aligned questions with source context tracking.

## 🌟 Key Features

- **AI-Powered Question Generation**: Uses spaCy and T5 transformer models
- **Multiple Question Types**: MCQ, Short Answer, and True/False questions
- **Bloom's Taxonomy Alignment**: Questions categorized by cognitive levels
- **Source Context Tracking**: "Why is this wrong?" feature shows original text
- **Printable Exports**: Generate Word documents for classroom use
- **User Authentication**: JWT-based secure authentication
- **Data Isolation**: Users only see their own quizzes

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python 3.11) - Modern, fast web framework
- **SQLite** with SQLAlchemy ORM - Database management
- **spaCy** (`en_core_web_sm`) - Natural language processing
- **HuggingFace Transformers** (T5-small) - Question generation
- **PyMuPDF** - PDF text extraction with page tracking
- **python-docx** - Word document generation
- **JWT** with Passlib - Authentication and security

### Frontend
- **React 18** with Vite - Modern React development
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download spaCy model**
   ```bash
   python -m spacy download en_core_web_sm
   ```

5. **Set up environment variables**
   ```bash
   # Update .env file with your settings
   SECRET_KEY=your-super-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DATABASE_URL=sqlite:///./questai.db
   ```

6. **Run the backend server**
   ```bash
   python run.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

## 📖 Usage Guide

### 1. User Registration & Login
- Create an account with username, email, and password
- Login to access the dashboard

### 2. Generate Quiz
- Click "Generate New Quiz" from dashboard
- Upload a PDF file (educational content)
- Configure question types and counts:
  - Multiple Choice Questions (4 options each)
  - Short Answer Questions (open-ended)
  - True/False Questions (binary choice)
- Click "Generate Quiz" and wait for AI processing

### 3. Take Quiz
- Navigate through questions using the sidebar
- Answer questions in any order
- Submit when complete

### 4. View Results
- See overall score and performance metrics
- View Bloom's taxonomy breakdown
- For incorrect answers, click "Why is this wrong?" to see source context
- Export results or retake quiz

### 5. Export for Teachers
- Download Word documents with:
  - Formatted exam paper with answer spaces
  - Separate answer key with source references
  - Professional layout ready for printing

## 🏗️ Architecture

### Database Models
- **User**: Authentication and user management
- **Quiz**: Quiz metadata and scoring
- **Question**: Individual questions with source tracking

### NLP Pipeline
1. **Text Extraction**: PyMuPDF extracts text with page numbers
2. **Content Analysis**: spaCy processes text for entities and complexity
3. **Question Generation**: 
   - Rule-based approach for MCQ and True/False
   - T5 transformer for Short Answer questions
4. **Source Mapping**: Track which text generated each question

### Authentication Flow
- JWT tokens for stateless authentication
- Password hashing with bcrypt
- Protected routes with user isolation

## 🔧 Configuration

### Question Generation Settings
```python
config = {
    "mcq_count": 5,
    "short_answer_count": 3,
    "true_false_count": 2,
    "difficulty_distribution": {"Easy": 30, "Medium": 50, "Hard": 20},
    "bloom_levels": ["Remember", "Understand", "Apply", "Analyze"]
}
```

### Environment Variables
```bash
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./questai.db
```

## 🧪 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Quiz Management
- `POST /quiz/generate` - Generate quiz from PDF
- `GET /quiz/` - Get user's quizzes
- `GET /quiz/{id}` - Get specific quiz
- `POST /quiz/{id}/submit` - Submit quiz answers
- `GET /quiz/{id}/export/docx` - Export as Word document

## 🎯 Educational Features

### Bloom's Taxonomy Integration
- **Remember**: Factual recall questions
- **Understand**: Comprehension and explanation
- **Apply**: Using knowledge in new situations
- **Analyze**: Breaking down complex information

### CBSE-Style Formatting
- Professional exam paper layout
- Proper marking scheme
- Answer key with source references
- Space for student details

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- User data isolation
- Input validation and sanitization
- CORS protection

## 🚀 Deployment

### Production Setup
1. Update environment variables for production
2. Use PostgreSQL instead of SQLite
3. Set up reverse proxy (nginx)
4. Enable HTTPS
5. Configure proper CORS origins

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile example
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- Support for more file formats (DOCX, TXT)
- Advanced question types (Fill-in-the-blanks, Matching)
- Collaborative quiz creation
- Analytics dashboard for teachers
- Integration with Learning Management Systems
- Multi-language support
- Advanced AI models (GPT-4, Claude)

---

**QuEstAI** - Transforming education through intelligent question generation! 🎓✨