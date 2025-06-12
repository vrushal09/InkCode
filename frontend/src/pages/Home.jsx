import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Home() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);const features = [
        {
            title: "Multi-Language Support",
            description: "Execute code in 10+ programming languages with intelligent autocomplete and syntax highlighting for 20+ languages.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            )
        },
        {
            title: "Real-Time Collaboration",
            description: "Work together with live cursors, in-editor chat, and line comments. See teammates' edits in real-time.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            title: "AI Assistant",
            description: "Built-in AI for code analysis, bug detection, documentation generation, and intelligent code suggestions.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        },
        {
            title: "Live Preview",
            description: "Real-time preview for HTML/CSS/JavaScript projects with terminal integration and file management.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )
        }
    ];    return (
        <div className="min-h-screen bg-[#000000] text-[#FFFFFF] relative overflow-hidden">
            {/* Grid Background */}
            <div className="fixed inset-0 z-0">
                <div 
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                        animation: 'gridFloat 30s ease-in-out infinite'
                    }}
                ></div>
            </div>

            <style jsx>{`
                @keyframes gridFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-10px, -10px) scale(1.02); }
                }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                
                .animate-slide-in {
                    animation: slideIn 0.6s ease-out forwards;
                }
                
                .animate-scale-in {
                    animation: scaleIn 0.5s ease-out forwards;
                }
                
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
            `}</style>

            {/* Navigation */}
            <nav className="border-b border-[#242424] bg-[#000000]/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 animate-slide-in">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <img src="/Logo-2.png" alt="InkCode Logo" className="w-8 h-8 transition-transform hover:scale-110" />
                            <span className="text-xl font-medium text-[#FFFFFF]">InkCode</span>
                        </div>
                          {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-[#FFFFFF]/60 hover:text-[#FFFFFF] transition-all duration-300 text-sm hover:scale-105">Features</a>
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="px-4 py-2 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#FFFFFF]/90 transition-all duration-300 text-sm font-medium hover:scale-105 hover:shadow-lg"
                            >
                                Start Building
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-[#FFFFFF] hover:text-[#FFFFFF]/80 transition-all duration-300 p-2 hover:scale-110"
                            >
                                <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {mobileMenuOpen && (                        <div className="md:hidden animate-fade-in-up">
                            <div className="px-2 pt-2 pb-3 space-y-1 bg-[#000000]/90 border-t border-[#242424]">
                                <a href="#features" className="block px-3 py-2 text-[#FFFFFF]/60 hover:text-[#FFFFFF] transition-all duration-300 text-sm hover:translate-x-2">Features</a>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full text-left px-3 py-2 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#FFFFFF]/90 transition-all duration-300 text-sm font-medium mt-2 hover:scale-105"
                                >
                                    Start Building
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>            {/* Hero Section */}
            <section className="pt-32 pb-20 relative z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight mb-6 text-[#FFFFFF] transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        Your complete platform for collaborative coding.
                    </h1>
                    
                    <p className={`text-xl text-[#FFFFFF]/70 max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-200 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        InkCode provides the developer tools and cloud infrastructure to build, scale, 
                        and secure faster, more collaborative development experiences.
                    </p>
                    
                    <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 delay-400 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="group px-8 py-4 bg-[#FFFFFF] text-[#000000] rounded-lg hover:bg-[#FFFFFF]/90 transition-all duration-300 font-medium hover:scale-105 hover:shadow-xl transform"
                        >
                            <span className="flex items-center">
                                Start Building
                                <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </button>
                        <button 
                            onClick={() => navigate('/instructions')}
                            className="px-8 py-4 text-[#FFFFFF] border border-[#242424] rounded-lg hover:border-[#FFFFFF]/30 transition-all duration-300 font-medium hover:scale-105 hover:bg-[#FFFFFF]/5"
                        >
                            View Documentation
                        </button>
                    </div>
                </div>
            </section>            {/* Features Grid */}
            <section id="features" className="py-24 border-t border-[#242424] relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {features.map((feature, index) => (
                            <div key={index} className={`space-y-4 group animate-scale-in delay-${(index + 1) * 100}`}>
                                <div className="w-12 h-12 bg-[#FFFFFF] text-[#000000] rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-medium text-[#FFFFFF] transition-colors group-hover:text-[#FFFFFF]/90">
                                    {feature.title}
                                </h3>
                                <p className="text-[#FFFFFF]/70 leading-relaxed transition-all duration-300 group-hover:text-[#FFFFFF]/80 group-hover:translate-x-1">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>            {/* Technology Stack Section */}
            <section className="py-24 bg-[#0A0A0A] border-t border-[#242424] relative z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-medium mb-6 text-[#FFFFFF] animate-fade-in-up delay-100">Built with modern technology</h2>
                    <p className="text-lg text-[#FFFFFF]/70 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200">
                        React frontend with TailwindCSS, Express.js backend, Firebase for real-time collaboration, 
                        and AI integration with Google Gemini Pro.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="bg-[#000000] border border-[#242424] rounded-lg p-6 text-center transition-all duration-300 hover:border-[#FFFFFF]/20 hover:scale-105 hover:bg-[#0A0A0A] group animate-scale-in delay-100">
                            <div className="text-2xl font-medium text-[#FFFFFF] mb-1 transition-colors group-hover:text-[#FFFFFF]/90">20+</div>
                            <div className="text-sm text-[#FFFFFF]/60">Programming Languages</div>
                        </div>
                        <div className="bg-[#000000] border border-[#242424] rounded-lg p-6 text-center transition-all duration-300 hover:border-[#FFFFFF]/20 hover:scale-105 hover:bg-[#0A0A0A] group animate-scale-in delay-200">
                            <div className="text-2xl font-medium text-[#FFFFFF] mb-1 transition-colors group-hover:text-[#FFFFFF]/90">10+</div>
                            <div className="text-sm text-[#FFFFFF]/60">Execution Runtimes</div>
                        </div>
                        <div className="bg-[#000000] border border-[#242424] rounded-lg p-6 text-center transition-all duration-300 hover:border-[#FFFFFF]/20 hover:scale-105 hover:bg-[#0A0A0A] group animate-scale-in delay-300">
                            <div className="text-2xl font-medium text-[#FFFFFF] mb-1 transition-colors group-hover:text-[#FFFFFF]/90">Real-time</div>
                            <div className="text-sm text-[#FFFFFF]/60">Collaboration</div>
                        </div>
                        <div className="bg-[#000000] border border-[#242424] rounded-lg p-6 text-center transition-all duration-300 hover:border-[#FFFFFF]/20 hover:scale-105 hover:bg-[#0A0A0A] group animate-scale-in delay-400">
                            <div className="text-2xl font-medium text-[#FFFFFF] mb-1 transition-colors group-hover:text-[#FFFFFF]/90">AI-Powered</div>
                            <div className="text-sm text-[#FFFFFF]/60">Code Assistant</div>
                        </div>
                    </div>
                </div>
            </section>            {/* CTA Section */}
            <section className="py-24 border-t border-[#242424] relative z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-medium mb-6 text-[#FFFFFF] animate-fade-in-up">Ready to start coding?</h2>
                    <p className="text-xl text-[#FFFFFF]/70 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-100">
                        Join thousands of developers building amazing projects with InkCode's collaborative platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-200">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-3 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#FFFFFF]/90 transition-all duration-300 font-medium hover:scale-105 hover:shadow-lg"
                        >
                            Start Building
                        </button>
                        <button 
                            onClick={() => navigate('/instructions')}
                            className="px-8 py-3 text-[#FFFFFF] border border-[#242424] rounded-md hover:border-[#FFFFFF]/30 transition-all duration-300 font-medium hover:scale-105 hover:bg-[#FFFFFF]/5"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#242424] py-16 bg-[#0A0A0A] relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-3 mb-4 md:mb-0 group">
                            <img src="/Logo-2.png" alt="InkCode Logo" className="w-8 h-8 transition-transform group-hover:scale-110" />
                            <span className="text-xl font-medium text-[#FFFFFF]">InkCode</span>
                        </div>                        <div className="flex items-center space-x-6 text-sm text-[#FFFFFF]/60">
                            <span>© 2024 InkCode</span>
                            <div className="flex space-x-4">
                                <a href="https://github.com/vrushal09" className="hover:text-[#FFFFFF] transition-all duration-300 hover:scale-105">GitHub</a>
                                <a href="/instructions" className="hover:text-[#FFFFFF] transition-all duration-300 hover:scale-105">Documentation</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;