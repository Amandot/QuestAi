# Contributing to QuEstAI

Thank you for your interest in contributing to QuEstAI! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub Issues tab to report bugs or request features
- Provide detailed information about the issue
- Include steps to reproduce for bugs
- Use appropriate labels

### Submitting Changes
1. **Fork the repository**
2. **Create a feature branch** from `develop`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
6. **Push to your fork**
7. **Create a Pull Request**

## 🏗️ Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Local Development
1. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/questai.git
   cd questai
   ```

2. **Set up backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   cp .env.example .env
   ```

3. **Set up frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   ```

4. **Run development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && python run.py
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## 📝 Code Style Guidelines

### Python (Backend)
- Follow PEP 8 style guide
- Use Black for code formatting
- Use isort for import sorting
- Use type hints where appropriate
- Write docstrings for functions and classes

```python
def generate_question(content: str, question_type: str) -> Dict[str, Any]:
    """
    Generate a question from the given content.
    
    Args:
        content: The source text content
        question_type: Type of question to generate
        
    Returns:
        Dictionary containing question data
    """
    pass
```

### JavaScript/React (Frontend)
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Use meaningful component and variable names
- Add PropTypes or TypeScript for type checking

```jsx
const QuizCard = ({ quiz, onTakeQuiz, onViewResults }) => {
  return (
    <div className="quiz-card">
      {/* Component content */}
    </div>
  );
};
```

### CSS/Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use semantic class names for custom CSS
- Maintain consistent spacing and colors

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Running Linters
```bash
# Backend
cd backend
black .
flake8 .
isort .

# Frontend
cd frontend
npm run lint
npm run lint:fix
```

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New features include tests
- [ ] Documentation is updated
- [ ] No merge conflicts with target branch

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes
```

## 🏷️ Commit Message Format

Use conventional commit format:
```
type(scope): description

feat(quiz): add export to PDF functionality
fix(auth): resolve login token expiration issue
docs(readme): update installation instructions
style(frontend): improve quiz card styling
test(backend): add tests for question generation
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🌟 Feature Development

### Adding New Question Types
1. Update backend models and schemas
2. Implement generation logic in NLP service
3. Add frontend UI components
4. Update export functionality
5. Add comprehensive tests

### Adding New File Formats
1. Implement text extraction service
2. Update file upload validation
3. Add frontend file type support
4. Test with various file samples

## 🐛 Bug Reports

### Include This Information
- **Environment**: OS, Python/Node versions
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Console logs**: Error messages

### Bug Report Template
```markdown
**Environment:**
- OS: [e.g., Windows 11, macOS 13, Ubuntu 22.04]
- Python: [e.g., 3.11.2]
- Node.js: [e.g., 18.15.0]
- Browser: [e.g., Chrome 110, Firefox 109]

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
A clear description of what you expected to happen.

**Actual Behavior:**
A clear description of what actually happened.

**Screenshots:**
If applicable, add screenshots to help explain your problem.

**Additional Context:**
Add any other context about the problem here.
```

## 📚 Documentation

### Code Documentation
- Add docstrings to all functions and classes
- Include type hints in Python code
- Comment complex logic
- Update API documentation for new endpoints

### User Documentation
- Update README for new features
- Add usage examples
- Include screenshots for UI changes
- Update installation instructions if needed

## 🎯 Areas for Contribution

### High Priority
- [ ] Add more question types (Fill-in-the-blanks, Matching)
- [ ] Improve AI question generation quality
- [ ] Add support for more file formats
- [ ] Enhance mobile responsiveness
- [ ] Add comprehensive test coverage

### Medium Priority
- [ ] Add quiz sharing functionality
- [ ] Implement quiz templates
- [ ] Add analytics dashboard
- [ ] Improve accessibility
- [ ] Add internationalization

### Low Priority
- [ ] Add dark mode theme
- [ ] Implement quiz collaboration
- [ ] Add social features
- [ ] Create mobile app
- [ ] Add advanced export options

## 🆘 Getting Help

### Resources
- **Documentation**: Check README and code comments
- **Issues**: Search existing issues for solutions
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for feedback in PRs

### Contact
- Create an issue for bugs or feature requests
- Use GitHub Discussions for general questions
- Tag maintainers in PRs for review

## 📄 License

By contributing to QuEstAI, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to QuEstAI! 🎓✨