import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from '../components/Sidebar';

const Instructions = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('getting-started');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const sections = [
        { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
        { id: 'editor-features', title: 'Editor Features', icon: '💻' },
        { id: 'collaboration', title: 'Collaboration', icon: '🤝' },
        { id: 'file-management', title: 'File Management', icon: '📁' },
        { id: 'code-execution', title: 'Code Execution', icon: '⚡' },
        { id: 'customization', title: 'Customization', icon: '🎨' },
        { id: 'team-management', title: 'Team Management', icon: '👥' },
        { id: 'shortcuts', title: 'Keyboard Shortcuts', icon: '⌨️' }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'getting-started':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">🚀 Getting Started with InkCode</h2>
                            <p className="text-[#FFFFFF]/60 mb-6">
                                Welcome to InkCode! This comprehensive guide will help you master all features of our collaborative code editor.
                            </p>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">Step 1: Create Your First Project</h3>
                            <ul className="space-y-2 text-[#FFFFFF]/70">
                                <li>• Click the <span className="text-[#FFFFFF] font-medium">"New Project"</span> button on your dashboard</li>
                                <li>• Enter a descriptive project name</li>
                                <li>• Click <span className="text-[#FFFFFF] font-medium">"Create Project"</span> to initialize your workspace</li>
                            </ul>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">Step 2: Understanding the Interface</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-[#FFFFFF] mb-2">Left Panel</h4>
                                    <ul className="text-sm text-[#FFFFFF]/70 space-y-1">
                                        <li>• File Explorer - Navigate your project files</li>
                                        <li>• Team Panel - Manage collaborators</li>
                                        <li>• Chat - Communicate with team members</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-[#FFFFFF] mb-2">Main Editor</h4>
                                    <ul className="text-sm text-[#FFFFFF]/70 space-y-1">
                                        <li>• Code Editor - Write and edit your code</li>
                                        <li>• File Tabs - Switch between open files</li>
                                        <li>• Toolbar - Access editor features</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">Step 3: Create Your First File</h3>
                            <ul className="space-y-2 text-[#FFFFFF]/70">
                                <li>• Right-click in the File Explorer</li>
                                <li>• Select <span className="text-[#FFFFFF] font-medium">"New File"</span></li>
                                <li>• Enter filename with extension (e.g., <code className="bg-[#242424] px-2 py-1 rounded">index.js</code>)</li>
                                <li>• Start coding with full syntax highlighting and autocomplete!</li>
                            </ul>
                        </div>
                    </div>
                );

            case 'editor-features':
                return (<div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">💻 Advanced Editor Features</h2>
                        <p className="text-[#FFFFFF]/60 mb-6">
                            InkCode provides powerful editing capabilities to enhance your coding experience.
                        </p>
                    </div>

                    <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">🧠 Intelligent Autocomplete</h3>
                        <div className="space-y-3">
                            <p className="text-[#FFFFFF]/70">Get smart code suggestions as you type:</p>
                            <ul className="space-y-2 text-[#FFFFFF]/70">
                                <li>• <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + Space</kbd> - Trigger autocomplete manually</li>
                                <li>• Language-specific keywords and functions</li>
                                <li>• DOM methods and properties</li>
                                <li>• Built-in JavaScript/TypeScript APIs</li>
                                <li>• Array and String methods with descriptions</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">✨ Code Formatting</h3>
                        <div className="space-y-3">
                            <p className="text-[#FFFFFF]/70">Keep your code clean and consistent:</p>
                            <ul className="space-y-2 text-[#FFFFFF]/70">
                                <li>• <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Shift + Alt + F</kbd> - Format current file</li>
                                <li>• Supports JavaScript, TypeScript, HTML, CSS, JSON, Python, Java, C++</li>
                                <li>• Automatic indentation and spacing</li>
                                <li>• Consistent bracket and brace formatting</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">🔍 Search & Replace</h3>
                        <div className="space-y-3">
                            <p className="text-[#FFFFFF]/70">Find and replace text efficiently:</p>
                            <ul className="space-y-2 text-[#FFFFFF]/70">
                                <li>• <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + F</kbd> - Open search</li>
                                <li>• <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + H</kbd> - Open find & replace</li>
                                <li>• Regular expression support</li>
                                <li>• Case sensitive/insensitive options</li>
                                <li>• Replace single or all occurrences</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">🗺️ Minimap Navigation</h3>
                        <div className="space-y-3">
                            <p className="text-[#FFFFFF]/70">Navigate large files with ease:</p>
                            <ul className="space-y-2 text-[#FFFFFF]/70">
                                <li>• Toggle minimap from the editor toolbar</li>
                                <li>• Click to jump to specific sections</li>
                                <li>• Visual overview of code structure</li>
                                <li>• Perfect for large files and quick navigation</li>
                            </ul>
                        </div>
                    </div>
                </div>
                ); case 'collaboration':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">🤝 Real-time Collaboration</h2>
                            <p className="text-[#FFFFFF]/60 mb-6">
                                Work together seamlessly with your team in real-time.
                            </p>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">👥 Inviting Team Members</h3>
                            <div className="space-y-3">
                                <ol className="space-y-2 text-[#FFFFFF]/70">
                                    <li>1. Open the Team Panel from the left sidebar</li>
                                    <li>2. Click <span className="text-[#FFFFFF] font-medium">"Invite Member"</span></li>
                                    <li>3. Enter their email address</li>
                                    <li>4. Choose their role (Editor or Viewer)</li>
                                    <li>5. Click <span className="text-[#FFFFFF] font-medium">"Send Invitation"</span></li>
                                </ol>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">👁️ Live Cursors & Presence</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">See what your teammates are doing:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-2"></span>Green dots show online team members</li>
                                    <li>• Colored cursors show where teammates are editing</li>
                                    <li>• Real-time text changes appear instantly</li>
                                    <li>• Hover over cursors to see team member names</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">💬 Built-in Chat</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Communicate without leaving the editor:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• Access chat from the left panel</li>
                                    <li>• Send messages to all team members</li>
                                    <li>• Share code snippets and links</li>
                                    <li>• Message history is preserved</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">💭 Code Comments</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Discuss specific lines of code:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• Click the comment icon in the gutter</li>
                                    <li>• Add comments to specific lines</li>
                                    <li>• Reply to existing comments</li>
                                    <li>• Resolve discussions when done</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ); case 'file-management':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">📁 File Management</h2>
                            <p className="text-[#FFFFFF]/60 mb-6">
                                Organize and manage your project files efficiently.
                            </p>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">🌳 File Explorer</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Navigate your project structure:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• <strong className="text-[#FFFFFF]">Right-click</strong> to create new files or folders</li>
                                    <li>• <strong className="text-[#FFFFFF]">Single-click</strong> to select files</li>
                                    <li>• <strong className="text-[#FFFFFF]">Double-click</strong> to open files in editor</li>
                                    <li>• <strong className="text-[#FFFFFF]">Drag & drop</strong> to move files around</li>
                                    <li>• Use context menu to rename or delete</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">📑 File Tabs</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Manage multiple open files:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• Click tabs to switch between open files</li>
                                    <li>• <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + W</kbd> - Close current tab</li>
                                    <li>• Middle-click or X button to close tabs</li>
                                    <li>• Modified files show a dot indicator</li>
                                    <li>• Tabs show file icons based on type</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">🍞 Breadcrumb Navigation</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Track your location in the project:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• Shows current file path</li>
                                    <li>• Click breadcrumb segments to navigate</li>
                                    <li>• Helpful for deep folder structures</li>
                                    <li>• Auto-updates as you switch files</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">📝 Supported File Types</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <h4 className="font-medium text-[#FFFFFF] mb-2">Web Development</h4>
                                    <ul className="text-[#FFFFFF]/70 space-y-1">
                                        <li>• JavaScript (.js)</li>
                                        <li>• TypeScript (.ts)</li>
                                        <li>• HTML (.html)</li>
                                        <li>• CSS (.css)</li>
                                        <li>• JSON (.json)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-[#FFFFFF] mb-2">Programming</h4>
                                    <ul className="text-[#FFFFFF]/70 space-y-1">
                                        <li>• Python (.py)</li>
                                        <li>• Java (.java)</li>
                                        <li>• C++ (.cpp)</li>
                                        <li>• Rust (.rs)</li>
                                        <li>• PHP (.php)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-[#FFFFFF] mb-2">Configuration</h4>
                                    <ul className="text-[#FFFFFF]/70 space-y-1">
                                        <li>• YAML (.yml)</li>
                                        <li>• XML (.xml)</li>
                                        <li>• SQL (.sql)</li>
                                        <li>• Markdown (.md)</li>
                                        <li>• And many more!</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ); case 'code-execution':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">⚡ Code Execution</h2>
                            <p className="text-[#FFFFFF]/60 mb-6">
                                Run your code directly in the browser and see results instantly.
                            </p>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">▶️ Running Code</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Execute your code with these steps:</p>
                                <ol className="space-y-2 text-[#FFFFFF]/70">
                                    <li>1. Write your code in the editor</li>
                                    <li>2. Click the <span className="text-[#FFFFFF] font-medium">"Run"</span> button in the toolbar</li>
                                    <li>3. Select the programming language</li>
                                    <li>4. View output in the Output Panel</li>
                                    <li>5. Check for errors in the console</li>
                                </ol>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">🌐 Supported Languages</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-yellow-400">●</span>
                                        <span className="text-[#FFFFFF]/70">JavaScript</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-blue-400">●</span>
                                        <span className="text-[#FFFFFF]/70">Python</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-orange-400">●</span>
                                        <span className="text-[#FFFFFF]/70">Java</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-purple-400">●</span>
                                        <span className="text-[#FFFFFF]/70">C++</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-red-400">●</span>
                                        <span className="text-[#FFFFFF]/70">Rust</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-indigo-400">●</span>
                                        <span className="text-[#FFFFFF]/70">PHP</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-green-400">●</span>
                                        <span className="text-[#FFFFFF]/70">Node.js</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-cyan-400">●</span>
                                        <span className="text-[#FFFFFF]/70">C</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-pink-400">●</span>
                                        <span className="text-[#FFFFFF]/70">And more!</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">📊 Output Panel</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Understanding the execution results:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• <span className="text-green-400">●</span> <strong className="text-[#FFFFFF]">Success:</strong> Code ran without errors</li>
                                    <li>• <span className="text-red-400">●</span> <strong className="text-[#FFFFFF]">Error:</strong> Compilation or runtime errors</li>
                                    <li>• <span className="text-yellow-400">●</span> <strong className="text-[#FFFFFF]">Warning:</strong> Potential issues in code</li>
                                    <li>• <span className="text-blue-400">●</span> <strong className="text-[#FFFFFF]">Output:</strong> Program results and console.log</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">💡 Tips for Code Execution</h3>
                            <div className="space-y-3">
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• Save your file before running for best results</li>
                                    <li>• Use <code className="bg-[#242424] px-2 py-1 rounded text-[#FFFFFF]">console.log()</code> for debugging in JavaScript</li>
                                    <li>• Use <code className="bg-[#242424] px-2 py-1 rounded text-[#FFFFFF]">print()</code> for output in Python</li>
                                    <li>• Include proper input handling for interactive programs</li>
                                    <li>• Check execution time limits for complex algorithms</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ); case 'customization':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">🎨 Customization & Themes</h2>
                            <p className="text-[#FFFFFF]/60 mb-6">
                                Personalize your coding environment to match your preferences.
                            </p>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">🌈 Theme Selection</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Choose from 7 beautiful themes:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-[#FFFFFF]">Dark Themes</h4>
                                        <ul className="text-[#FFFFFF]/70 space-y-1">
                                            <li>• VS Code Dark (Default)</li>
                                            <li>• Dracula</li>
                                            <li>• Material Dark</li>
                                            <li>• One Dark</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-[#FFFFFF]">Light Themes</h4>
                                        <ul className="text-[#FFFFFF]/70 space-y-1">
                                            <li>• GitHub Light</li>
                                            <li>• Solarized Light</li>
                                            <li>• Nord</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">⚙️ Accessing Preferences</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Change your settings:</p>
                                <ol className="space-y-2 text-[#FFFFFF]/70">
                                    <li>1. Click your profile avatar in the top-right</li>
                                    <li>2. Select <span className="text-[#FFFFFF] font-medium">"Profile"</span> from dropdown</li>
                                    <li>3. Navigate to the <span className="text-[#FFFFFF] font-medium">"Preferences"</span> tab</li>
                                    <li>4. Adjust theme, font size, and other settings</li>
                                    <li>5. Changes are saved automatically</li>
                                </ol>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">🔤 Font Customization</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Adjust text appearance:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• <strong className="text-[#FFFFFF]">Font Size:</strong> Range from 12px to 24px</li>
                                    <li>• <strong className="text-[#FFFFFF]">Font Family:</strong> Choose from multiple programming fonts</li>
                                    <li>• <strong className="text-[#FFFFFF]">Line Height:</strong> Adjust spacing between lines</li>
                                    <li>• <strong className="text-[#FFFFFF]">Tab Size:</strong> Set indentation preferences</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">📱 Responsive Design</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">InkCode adapts to your device:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• Collapsible sidebar on smaller screens</li>
                                    <li>• Touch-friendly interface for tablets</li>
                                    <li>• Optimized layouts for different screen sizes</li>
                                    <li>• Consistent experience across devices</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ); case 'team-management':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">👥 Team Management</h2>
                            <p className="text-[#FFFFFF]/60 mb-6">
                                Efficiently manage your team and control access to your projects.
                            </p>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">👑 User Roles</h3>
                            <div className="space-y-4">
                                <div className="border border-[#242424] rounded-lg p-4">
                                    <h4 className="font-medium text-yellow-400 mb-2">👑 Owner</h4>
                                    <ul className="text-[#FFFFFF]/70 text-sm space-y-1">
                                        <li>• Full access to all project features</li>
                                        <li>• Can invite and remove team members</li>
                                        <li>• Can delete the project</li>
                                        <li>• Can change member roles</li>
                                    </ul>
                                </div>
                                <div className="border border-[#242424] rounded-lg p-4">
                                    <h4 className="font-medium text-green-400 mb-2">✏️ Editor</h4>
                                    <ul className="text-[#FFFFFF]/70 text-sm space-y-1">
                                        <li>• Can read and write code</li>
                                        <li>• Can create, edit, and delete files</li>
                                        <li>• Can participate in chat and comments</li>
                                        <li>• Can execute code</li>
                                    </ul>
                                </div>
                                <div className="border border-[#242424] rounded-lg p-4">
                                    <h4 className="font-medium text-blue-400 mb-2">👁️ Viewer</h4>
                                    <ul className="text-[#FFFFFF]/70 text-sm space-y-1">
                                        <li>• Can view code and files (read-only)</li>
                                        <li>• Can participate in chat</li>
                                        <li>• Can view comments but not create them</li>
                                        <li>• Cannot edit or execute code</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">📧 Invitation Process</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">How to invite team members:</p>
                                <ol className="space-y-2 text-[#FFFFFF]/70">
                                    <li>1. Open Team Panel in the editor</li>
                                    <li>2. Click <span className="text-[#FFFFFF] font-medium">"Invite Member"</span></li>
                                    <li>3. Enter the member's email address</li>
                                    <li>4. Select their role (Editor or Viewer)</li>
                                    <li>5. Add an optional personal message</li>
                                    <li>6. Click <span className="text-[#FFFFFF] font-medium">"Send Invitation"</span></li>
                                    <li>7. They'll receive an email with a join link</li>
                                </ol>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">⚡ Managing Members</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Control your team effectively:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• <strong className="text-[#FFFFFF]">View Members:</strong> See all current team members</li>
                                    <li>• <strong className="text-[#FFFFFF]">Change Roles:</strong> Promote viewers to editors or vice versa</li>
                                    <li>• <strong className="text-[#FFFFFF]">Remove Members:</strong> Remove access for specific users</li>
                                    <li>• <strong className="text-[#FFFFFF]">Pending Invitations:</strong> Track who hasn't joined yet</li>
                                    <li>• <strong className="text-[#FFFFFF]">Online Status:</strong> See who's currently active</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">🔒 Security & Privacy</h3>
                            <div className="space-y-3">
                                <p className="text-[#FFFFFF]/70">Keep your projects secure:</p>
                                <ul className="space-y-2 text-[#FFFFFF]/70">
                                    <li>• Only invited members can access projects</li>
                                    <li>• Email verification required for new members</li>
                                    <li>• Role-based permissions prevent unauthorized changes</li>
                                    <li>• Project owners have full control over access</li>
                                    <li>• Real-time activity tracking for transparency</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ); case 'shortcuts':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">⌨️ Keyboard Shortcuts</h2>
                            <p className="text-[#FFFFFF]/60 mb-6">
                                Speed up your workflow with these essential keyboard shortcuts.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">📝 Editor Shortcuts</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Autocomplete</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + Space</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Format Code</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Shift + Alt + F</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Search</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + F</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Find & Replace</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + H</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Save File</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + S</kbd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">📑 File Management</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">New File</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + N</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Close Tab</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + W</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Switch Tab</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + Tab</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Quick Open</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + P</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Open File</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + O</kbd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">✂️ Text Editing</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Select All</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + A</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Copy</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + C</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Paste</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + V</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Undo</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + Z</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Redo</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + Y</kbd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">🔧 Code Actions</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Comment Line</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + /</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Duplicate Line</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Shift + Alt + ↓</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Move Line Up</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Alt + ↑</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Move Line Down</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Alt + ↓</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#FFFFFF]/70">Select Line</span>
                                        <kbd className="bg-[#242424] px-2 py-1 rounded text-sm text-[#FFFFFF]">Ctrl + L</kbd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/20 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">💡 Pro Tips</h3>
                            <ul className="space-y-2 text-[#FFFFFF]/70">
                                <li>• Hold <kbd className="bg-[#242424] px-1 py-0.5 rounded text-xs text-[#FFFFFF]">Alt</kbd> while clicking to place multiple cursors</li>
                                <li>• Use <kbd className="bg-[#242424] px-1 py-0.5 rounded text-xs text-[#FFFFFF]">Ctrl + D</kbd> to select next occurrence of current word</li>
                                <li>• Press <kbd className="bg-[#242424] px-1 py-0.5 rounded text-xs text-[#FFFFFF]">F11</kbd> to toggle fullscreen mode</li>
                                <li>• Use <kbd className="bg-[#242424] px-1 py-0.5 rounded text-xs text-[#FFFFFF]">Ctrl + Shift + P</kbd> for command palette (if available)</li>
                            </ul>
                        </div>
                    </div>
                );

            default:
                return <div>Section not found</div>;
        }
    }; return (
        <div className="min-h-screen bg-[#000000] flex">
            {/* Conditional Sidebar - only show if user is logged in */}
            {user && <Sidebar currentPage="instructions" />}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-[#000000] border-b border-[#242424] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-[#FFFFFF]">InkCode Instructions</h1>
                            <p className="text-sm text-[#FFFFFF]/60">Learn how to use all features of our collaborative code editor</p>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate(user ? '/dashboard' : '/home')}
                                className="flex items-center space-x-2 px-4 py-2 bg-[#FFFFFF] text-[#000000] rounded-lg hover:bg-[#FFFFFF]/90 transition-colors text-sm font-medium"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>{user ? 'Back to Dashboard' : 'Back to Home'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-[#000000]">
                    <div className="p-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Navigation Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-4 sticky top-6">
                                        <h2 className="text-lg font-semibold mb-4 text-[#FFFFFF]">Tutorial Sections</h2>
                                        <nav className="space-y-2">
                                            {sections.map((section) => (
                                                <button
                                                    key={section.id}
                                                    onClick={() => setActiveSection(section.id)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${activeSection === section.id
                                                        ? 'bg-[#FFFFFF]/10 text-[#FFFFFF] border border-[#FFFFFF]/20'
                                                        : 'text-[#FFFFFF]/70 hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/5'
                                                        }`}
                                                >
                                                    <span className="text-lg">{section.icon}</span>
                                                    <span className="text-sm font-medium">{section.title}</span>
                                                </button>
                                            ))}
                                        </nav>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="lg:col-span-3">
                                    <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                                        {renderContent()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Instructions;
