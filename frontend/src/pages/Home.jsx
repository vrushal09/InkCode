import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Home() {
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            title: "Multi-Language Support",
            description: "Code in 20+ programming languages with intelligent autocomplete and syntax highlighting",
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            )
        },
        {
            title: "Real-Time Collaboration",
            description: "Work together with your team in real-time with live cursors and instant updates",
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            title: "Code Execution",
            description: "Run your code instantly in 10+ languages with runtime metrics and input support",
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            title: "AI Assistant",
            description: "Get intelligent code analysis, bug fixes, documentation, and explanations",
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        }
    ];    const techStack = [
        { name: "React", category: "Frontend" },
        { name: "Firebase", category: "Backend" },
        { name: "CodeMirror", category: "Editor" },
        { name: "TailwindCSS", category: "Styling" },
        { name: "Vercel", category: "Hosting" },
        { name: "Google Gemini", category: "AI" }
    ];

    return (
        <div className="min-h-screen relative text-white overflow-hidden bg-black">
            {/* Grid Background */}
            <div className="fixed inset-0 opacity-20" style={{
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
            }}></div>
            
            {/* Content Layer */}
            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">                            <div className="flex items-center space-x-3">
                                <img src="/Logo-2.png" alt="InkCode Logo" className="w-8 h-8" />
                                <span className="text-lg font-medium">InkCode</span>
                            </div>
                            <nav className="hidden md:flex items-center space-x-8">
                                <a href="#features" className="text-[#FFFFFF]/70 hover:text-white transition-colors text-sm">Features</a>
                                <a href="#tech" className="text-[#FFFFFF]/70 hover:text-white transition-colors text-sm">Technology</a>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm font-medium"
                                >
                                    Get Started
                                </button>
                            </nav>
                        </div>
                    </div>
                </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight mb-6">
                            Collaborative Code Editor
                            <span className="block text-[#FFFFFF]/80 text-xl sm:text-2xl lg:text-3xl mt-2">
                                Built for Teams
                            </span>
                        </h1>                        <p className="text-lg sm:text-xl text-[#FFFFFF]/70 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Real-time collaboration, multi-language support, and AI-powered assistance. 
                            Code together, ship faster.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="w-full sm:w-auto px-8 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-medium"
                            >
                                Start Coding Now
                            </button>
                            <button 
                                onClick={() => navigate('/instructions')}
                                className="w-full sm:w-auto px-8 py-3 bg-black/20 text-white rounded-lg hover:bg-black/30 transition-colors font-medium border border-white/20"
                            >
                                View Documentation
                            </button>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="mt-16 relative">
                        <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-4xl mx-auto">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-[#FFFFFF]/60 text-sm ml-4">main.js</span>
                            </div>
                            <div className="font-mono text-sm space-y-2">
                                <div className="text-[#FFFFFF]/60">// Real-time collaborative coding</div>
                                <div className="text-blue-400">function <span className="text-yellow-400">collaborate</span>() {`{`}</div>
                                <div className="pl-4 text-[#FFFFFF]/80">const team = <span className="text-green-400">'unstoppable'</span>;</div>
                                <div className="pl-4 text-[#FFFFFF]/80">return <span className="text-purple-400">buildAmazing</span>(team);</div>
                                <div className="text-blue-400">{`}`}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>            {/* Features Section */}
            <section id="features" className="py-20 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-xl sm:text-2xl font-medium mb-4">Powerful Features</h2>
                        <p className="text-lg text-[#FFFFFF]/70 max-w-2xl mx-auto">
                            Everything you need for modern collaborative development
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:border-white/30 transition-all duration-300 group cursor-pointer"
                                onMouseEnter={() => setActiveFeature(index)}
                            >
                                <div className="text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-medium mb-3 text-white">{feature.title}</h3>
                                <p className="text-[#FFFFFF]/70 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Additional Features Grid */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-2">Live Preview</h4>
                            <p className="text-sm text-[#FFFFFF]/70">Real-time preview for HTML/CSS/JavaScript projects</p>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-2">Terminal Integration</h4>
                            <p className="text-sm text-[#FFFFFF]/70">Execute shell commands and view output</p>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-2">File Management</h4>
                            <p className="text-sm text-[#FFFFFF]/70">Full file/folder system with project organization</p>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-2">In-Editor Chat</h4>
                            <p className="text-sm text-[#FFFFFF]/70">Communicate with team members directly</p>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-2">Code Comments</h4>
                            <p className="text-sm text-[#FFFFFF]/70">Discuss specific code segments with line comments</p>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-2">Role-Based Access</h4>
                            <p className="text-sm text-[#FFFFFF]/70">Owner, Editor, and Viewer permissions</p>
                        </div>
                    </div>
                </div>
            </section>            {/* Technology Stack */}
            <section id="tech" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-xl sm:text-2xl font-medium mb-4">Built with Modern Tech</h2>
                        <p className="text-lg text-[#FFFFFF]/70 max-w-2xl mx-auto">
                            Powered by industry-leading technologies for performance and reliability
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {techStack.map((tech, index) => (
                            <div key={index} className="text-center group">
                                <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:border-white/30 transition-all duration-300 group-hover:scale-105">
                                    <div className="text-white font-medium text-sm">{tech.name}</div>
                                    <div className="text-[#FFFFFF]/60 text-xs mt-1">{tech.category}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>            {/* CTA Section */}
            <section className="py-20 bg-black/20 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-xl sm:text-2xl font-medium mb-6">Ready to Start Coding?</h2>
                    <p className="text-lg text-[#FFFFFF]/70 mb-10 max-w-2xl mx-auto">
                        Join thousands of developers already using InkCode for collaborative development. 
                        Create your first project in seconds.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto px-8 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-medium"
                        >
                            Create Your First Project
                        </button>
                        <button 
                            onClick={() => navigate('/instructions')}
                            className="w-full sm:w-auto px-8 py-3 bg-transparent text-white rounded-lg hover:bg-black/30 transition-colors font-medium border border-white/20"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-3 mb-4 md:mb-0">
                            <img src="/Logo-2.png" alt="InkCode Logo" className="w-8 h-8" />
                            <span className="text-lg font-medium">InkCode</span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-[#FFFFFF]/70">
                            <span>© 2024 InkCode. All rights reserved.</span>
                            <button 
                                onClick={() => navigate('/instructions')}
                                className="hover:text-white transition-colors"
                            >
                                Documentation
                            </button>
                        </div>
                    </div>                </div>
            </footer>
            </div>
        </div>
    );
}

export default Home;