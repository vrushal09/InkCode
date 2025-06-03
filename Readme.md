# InkCode - Collaborative Code Editor

![InkCode Logo](frontend/src/assets/logo.png)

A modern, feature-rich collaborative code editor built with React and Firebase. InkCode provides real-time collaboration, advanced editing features, code execution, and comprehensive project management for teams and individual developers.

## 🚀 Features

### 💻 Advanced Code Editor
- **Multi-language Support**: JavaScript, TypeScript, Python, Java, C++, HTML, CSS, SQL, Rust, PHP, Markdown, YAML, XML, and JSON
- **Intelligent Autocomplete**: Smart code completion with language-specific suggestions, DOM methods, and built-in APIs
- **Code Formatting**: Auto-format code with Shift+Alt+F for better readability across all supported languages
- **Search & Replace**: Powerful find and replace functionality with regex support and case sensitivity options
- **Minimap**: VS Code-style minimap for quick navigation through large files
- **Syntax Highlighting**: Rich syntax highlighting powered by CodeMirror 6
- **Multiple Themes**: 7 built-in themes including VS Code Dark, GitHub Light, Dracula, Material, and more

### 🤝 Real-time Collaboration
- **Live Editing**: See changes from team members in real-time
- **User Cursors**: Visual indicators showing where team members are editing
- **Team Management**: Invite, remove, and manage team members with role-based permissions
- **Conflict Resolution**: Smart handling of simultaneous edits
- **User Presence**: See who's currently online and active in your project
- **Chat System**: Built-in chat for team communication
- **Comments System**: Add and manage code comments and discussions

### 🔧 Code Execution & Tools
- **Code Runner**: Execute JavaScript, Python, and other supported languages via JDoodle API
- **Output Console**: View execution results and errors
- **Terminal Panel**: Integrated terminal for command execution
- **File Management**: Create, edit, delete, and organize project files

### 👤 User Management & Customization
- **Authentication**: Secure login with Firebase Authentication
- **User Profiles**: Customizable profiles with avatars and preferences
- **Theme Preferences**: Save and sync editor themes across devices
- **Font Settings**: Adjustable font size and family preferences
- **Workspace Settings**: Persistent editor configurations

### 📁 Project Management
- **Dashboard**: Overview of all projects with quick access
- **File Explorer**: Navigate and manage project files with tree structure
- **File Tabs**: Multi-file editing with tab management
- **Breadcrumb Navigation**: Easy navigation through project structure
- **Sharing**: Share projects with team members

## 🛠 Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **CodeMirror 6**: Advanced code editor with extensions
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router**: Client-side routing and navigation
- **React Toastify**: User notifications and alerts
- **EmailJS**: Contact form functionality

### Backend & Services
- **Firebase**: Complete backend-as-a-service solution
  - **Firestore**: Real-time database for collaboration
  - **Authentication**: User management and security
  - **Hosting**: Web application deployment
- **JDoodle API**: Code execution service
- **Vite**: Fast build tool and development server

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting consistency
- **UUID**: Unique identifier generation
- **PostCSS**: CSS processing and optimization

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- JDoodle API account (for code execution)

### Setup Instructions

1. **Clone the Repository**
   ```powershell
   git clone https://github.com/yourusername/inkcode.git
   cd inkcode
   ```

2. **Install Dependencies**
   ```powershell
   cd frontend
   npm install
   ```

3. **Firebase Configuration**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database and Authentication
   - Copy your Firebase config to `frontend/src/config/firebase.js`
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```

4. **JDoodle API Configuration**
   - Sign up at [JDoodle](https://www.jdoodle.com/compiler-api)
   - Update `frontend/src/config/jdoodle.js` with your API credentials

5. **Start Development Server**
   ```powershell
   npm run dev
   ```

6. **Open in Browser**
   Navigate to `http://localhost:5173`

## 🚀 Usage

### Getting Started
1. **Create Account**: Sign up with email or use Google authentication
2. **Create Project**: Click "New Project" on the dashboard
3. **Start Coding**: Begin writing code with full autocomplete and syntax highlighting
4. **Invite Team**: Add collaborators using the team management panel
5. **Real-time Collaboration**: See live cursors and edits from team members

### Editor Features
- **Autocomplete**: Press `Ctrl+Space` for intelligent code suggestions
- **Format Code**: Use `Shift+Alt+F` to format your code
- **Search**: Press `Ctrl+F` to search, `Ctrl+H` for find and replace
- **Minimap**: Toggle the minimap for code overview and navigation
- **Theme Switch**: Change themes from the user preferences panel
- **Execute Code**: Run your code using the execution panel
- **Chat**: Communicate with team members using the built-in chat
- **Comments**: Add comments to specific lines of code

### Collaboration
- **Team Panel**: Access team management from the editor sidebar
- **Live Cursors**: See colored cursors showing where teammates are editing
- **Presence Indicators**: Green dots show who's currently online
- **Role Management**: Assign editor or viewer permissions to team members
- **Real-time Sync**: All changes are synchronized instantly across all users

## 📋 Key Components

### Core Editor Components
- **`CodeEditorContainer`**: Main container managing editor state and layout
- **`EnhancedCodeEditorPanel`**: Advanced editor with all enhanced features
- **`CodeEditorPanel`**: Basic code editor functionality
- **`EditorHeader`**: Header with project info and controls
- **`EditorFeaturesPanel`**: Feature toggles and settings

### Collaboration Components
- **`TeamManager`**: Team member management and invitations
- **`CursorOverlay`**: Real-time cursor positioning for collaborators
- **`ChatPanel`**: Built-in chat system for team communication
- **`CommentsSystem`**: Code commenting and discussion system
- **`useCollaboration`**: Custom hook managing real-time collaboration logic
- **`useCursors`**: Hook for managing user cursor positions
- **`useChat`**: Hook for chat functionality

### File Management Components
- **`FileExplorer`**: Tree-based file navigation
- **`FileNode`**: Individual file/folder representation
- **`FileTabs`**: Multi-file tab management
- **`Breadcrumb`**: Navigation breadcrumb component
- **`useFileSystem`**: Hook for file operations

### UI Components
- **`Dashboard`**: Project overview and management
- **`Auth`**: Authentication forms and user registration
- **`Profile`**: User profile and preferences management
- **`JoinTeam`**: Team invitation and joining functionality

### Panels & Tools
- **`InputPanel`**: Code input and editing interface
- **`OutputPanel`**: Code execution results display
- **`TerminalPanel`**: Integrated terminal functionality
- **`ControlPanel`**: Editor controls and settings

### Services & Utilities
- **`codeExecutionService`**: Code running and output handling via JDoodle
- **`emailService`**: Email functionality using EmailJS
- **`codeFormatter`**: Multi-language code formatting utilities
- **`UserPreferencesContext`**: Global user settings management

### Configuration
- **`themes.js`**: Theme configurations and styling options
- **`languages.js`**: Supported programming languages configuration
- **`firebase.js`**: Firebase initialization and configuration
- **`jdoodle.js`**: JDoodle API configuration

### Extensions
- **`editorExtensions.js`**: CodeMirror editor extensions
- **`commentGutterExtension.js`**: Code commenting functionality
- **`blameTooltipExtension.js`**: Code blame and history tooltips
- **`lineBlameTooltipExtension.js`**: Line-specific blame information

## 🎨 Customization

### Adding New Themes
1. Define theme in `frontend/src/config/themes.js`
2. Import CodeMirror theme extension
3. Add theme option to user preferences

### Supporting New Languages
1. Install CodeMirror language package
2. Add language import to `languages.js`
3. Update language detection in `codeFormatter.js`
4. Add language support to JDoodle configuration

### Custom Features
The editor is built with extensibility in mind. Add new features by:
- Creating CodeMirror extensions in the `extensions/` directory
- Adding new panels to the editor interface
- Implementing new services in the `services/` directory
- Creating custom hooks in the `hooks/` directory

## 🔧 Configuration

### Environment Variables
Create `.env` file in frontend directory:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_JDOODLE_CLIENT_ID=your-jdoodle-client-id
VITE_JDOODLE_CLIENT_SECRET=your-jdoodle-client-secret
VITE_EMAILJS_SERVICE_ID=your-emailjs-service-id
VITE_EMAILJS_TEMPLATE_ID=your-emailjs-template-id
VITE_EMAILJS_PUBLIC_KEY=your-emailjs-public-key
```

### Firebase Rules
Set up Firestore security rules for proper access control:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        (resource.data.owner == request.auth.uid || 
         request.auth.uid in resource.data.collaborators);
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Deployment
The project includes Vercel configuration files for easy deployment:
- `vercel.json` in both root and frontend directories
- Optimized build configuration in `vite.config.js`
- PostCSS and Tailwind configuration for production builds

## 🤝 Contributing

We welcome contributions to InkCode! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Ensure all linting passes (`npm run lint`)
- Test all features before submitting

### Code Structure
- **Components**: Reusable UI components in `src/components/`
- **Pages**: Route-level components in `src/pages/`
- **Hooks**: Custom React hooks in `src/hooks/`
- **Services**: External API integrations in `src/services/`
- **Utils**: Utility functions in `src/utils/`
- **Config**: Configuration files in `src/config/`
- **Extensions**: CodeMirror extensions in `src/extensions/`

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CodeMirror**: Excellent code editor foundation
- **Firebase**: Reliable backend infrastructure
- **React**: Powerful UI framework
- **Tailwind CSS**: Beautiful styling utilities
- **JDoodle**: Code execution API service
- **EmailJS**: Email service integration
- **Open Source Community**: For the amazing tools and libraries

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs on GitHub Issues
- **Enhanced Features**: See `ENHANCED_EDITOR_FEATURES.md` for detailed feature documentation
- **Contact**: Reach out through the contact form in the application

## 🗺 Roadmap

### Upcoming Features
- [ ] Git integration for version control
- [ ] Plugin system for custom extensions
- [ ] Advanced debugging tools
- [ ] Code review and commenting system
- [ ] Mobile responsive editor
- [ ] Offline mode support
- [ ] Advanced project templates
- [ ] Code snippet library
- [ ] Performance analytics
- [ ] Advanced user roles and permissions
- [ ] Integrated testing framework
- [ ] Docker container support
- [ ] API documentation generator
- [ ] Code metrics and analysis
- [ ] Advanced search across projects

### Recent Updates
- ✅ Enhanced editor features (autocomplete, formatting, search, minimap)
- ✅ Real-time collaboration with cursors
- ✅ Chat system for team communication
- ✅ Comments system for code discussions
- ✅ File explorer with tree structure
- ✅ Code execution via JDoodle API
- ✅ Multiple themes and customization options
- ✅ Team management and permissions
- ✅ User preferences and settings

---

**InkCode** - Where collaboration meets innovation in code editing. Built with ❤️ for developers, by developers.

## 🏗 Architecture Overview

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── CodeEditor/     # Editor-specific components
│   └── ...            # General components
├── pages/              # Route-level components
├── hooks/              # Custom React hooks
├── services/           # External API integrations
├── utils/              # Utility functions
├── config/             # Configuration files
├── extensions/         # CodeMirror extensions
└── contexts/           # React context providers
```

### Data Flow
1. **Authentication**: Firebase Auth manages user sessions
2. **Real-time Data**: Firestore provides real-time collaboration
3. **Code Execution**: JDoodle API handles code running
4. **File Management**: Local state with Firestore persistence
5. **User Preferences**: Context API with local storage

### Key Features Implementation
- **Real-time Collaboration**: WebSocket connections via Firestore
- **Code Editor**: CodeMirror 6 with custom extensions
- **File System**: Virtual file system with persistence
- **Team Management**: Role-based access control
- **Theme System**: Dynamic theme switching with persistence
- **Code Execution**: Secure execution via external API

This comprehensive documentation covers all aspects of the InkCode collaborative code editor, providing developers and users with everything they need to understand, use, and contribute to the project.