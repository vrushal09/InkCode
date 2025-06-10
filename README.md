# InkCode

InkCode is a collaborative, real-time code editor platform with multi-language support, team collaboration features, and advanced editor capabilities.

## 🚀 Features

### Code Editor
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, Ruby, Go, Rust, PHP, and more
- **Enhanced Editor Features**: 
  - Intelligent autocomplete with language-specific suggestions
  - Code formatting for consistent style
  - Search & replace functionality with regex support
  - Interactive minimap for easier navigation
  - Syntax highlighting for 20+ programming languages

### Real-Time Collaboration
- **Team Management**: Create projects and invite team members with role-based permissions
- **Live Collaboration**: See teammates' cursors and edits in real-time
- **In-Editor Chat**: Communicate with team members directly within the editor
- **Line Comments**: Discuss specific code segments with targeted comments

### Code Execution
- **Multi-Language Runtime**: Execute code in 10+ programming languages
- **Input Support**: Provide input for interactive programs
- **Runtime Metrics**: View execution time and memory usage statistics
- **Local Fallback**: JavaScript execution in the browser when backend is unavailable

### Advanced Features
- **AI Assistant**: Built-in AI for code analysis, bug fixes, documentation, and more
- **Live Preview**: Real-time preview for HTML/CSS/JavaScript projects
- **Terminal Integration**: Execute shell commands and view output
- **File Management**: Full file/folder system with project organization

## 🛠️ Technology Stack

### Frontend
- **Framework**: React (with Vite)
- **UI Design**: TailwindCSS for styling
- **State Management**: React Context API
- **Code Editor**: CodeMirror integration with custom extensions
- **Real-time Connectivity**: Firebase Realtime Database

### Backend
- **API Server**: Express.js
- **Code Execution**: JDoodle API integration
- **Authentication**: Firebase Authentication
- **Database**: Firebase Realtime Database
- **Cloud Functions**: Firebase Cloud Functions with Google Gemini Pro AI integration

### DevOps
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Version Control**: Git/GitHub

## 📋 Getting Started

### Prerequisites
- Node.js (v16+)
- npm
- Firebase account
- JDoodle API credentials (for code execution)
- Google Gemini Pro API key (for AI features)

### Installation

#### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Environment Variables

#### Frontend (.env file)
```
VITE_API_URL=http://localhost:5000
```

#### Backend (.env file)
```
PORT=5000
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository
2. Configure with:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Environment Variables**: VITE_API_URL=your_backend_url

### Backend (Render)
1. Create a new Web Service
2. Configure with:
   - **Root Directory**: backend
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Environment Variables**: PORT, JDOODLE_CLIENT_ID, JDOODLE_CLIENT_SECRET

## 🔧 Usage

1. **Create an Account**: Sign up or log in using email or Google authentication
2. **Create a Project**: Start a new coding project from the dashboard
3. **Invite Team Members**: Add collaborators with specific roles
4. **Create Files**: Add code files to your project using various supported languages
5. **Execute Code**: Run your code and view the output in the terminal panel
6. **Collaborate**: Chat, comment, and code together in real-time
7. **Use AI Assistant**: Access AI features for code analysis, improvements, and more

## 🌟 Advanced Features

### AI Assistant
- **Code Analysis**: Get insights about code quality, issues, and security vulnerabilities
- **Bug Detection**: Find and fix bugs automatically
- **Documentation Generation**: Create comprehensive documentation for your code
- **Code Refactoring**: Get suggestions for code improvements
- **Chat**: Ask questions about your code and get detailed explanations

### Collaboration Tools
- **Role-Based Permissions**: Assign Owner, Editor, or Viewer roles to team members
- **Real-time Cursor Tracking**: See teammates' cursors and text selections
- **Chat History**: Persistent chat messages for ongoing discussions
- **Email Invitations**: Send invitations to team members via email

### Customization
- **Editor Themes**: Multiple themes including VS Code, GitHub, Material, Monokai
- **Font Settings**: Customize font size, family and editor appearance
- **Layout Options**: Adjust panels, show/hide features based on preferences
- **Keyboard Shortcuts**: Comprehensive shortcuts for efficient coding

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
