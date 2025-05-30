import { useState } from 'react';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { toast } from 'react-toastify';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false); // Default to signup
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast.success('Successfully logged in!');
      } else {
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully logged in with Google!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex bg-[#09090f]">
      {/* Left section with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1c1137] to-[#090918] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6633cc] via-[#4c1d95] to-transparent opacity-40"></div>

        {/* Code Editor window */}
        <div className="z-10 max-w-md w-full">
          <div className="bg-[#0c0c14] rounded-lg shadow-xl overflow-hidden border border-gray-800">
            {/* Editor toolbar */}
            <div className="bg-[#15101e] p-2 flex items-center">
              <div className="flex space-x-1.5 mr-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-400">InkCode.js</div>
            </div>
            
            {/* Code content */}
            <div className="p-4 bg-[#0c0c14] font-mono text-sm">
              <pre className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                <span className="text-gray-500">// Welcome to InkCode</span>
                <br />
                <span className="text-violet-400">function</span>
                <span className="text-yellow-300"> collaborate</span>
                <span className="text-white">()</span>
                <span className="text-white"> {`{`}</span>
                <br />
                <span className="pl-4 text-violet-400">const</span>
                <span className="text-white"> project = </span>
                <span className="text-violet-400">new</span>
                <span className="text-yellow-300"> Project</span>
                <span className="text-white">{`({`}</span>
                <br />
                <span className="pl-8 text-green-300">name</span>
                <span className="text-white">: </span>
                <span className="text-orange-300">"Awesome Code"</span>
                <span className="text-white">,</span>
                <br />
                <span className="pl-8 text-green-300">team</span>
                <span className="text-white">: [</span>
                <span className="text-orange-300">"you"</span>
                <span className="text-white">, </span>
                <span className="text-orange-300">"me"</span>
                <span className="text-white">],</span>
                <br />
                <span className="pl-8 text-green-300">features</span>
                <span className="text-white">: [</span>
                <br />
                <span className="pl-12 text-orange-300">"real-time editing"</span>
                <span className="text-white">,</span>
                <br />
                <span className="pl-12 text-orange-300">"code execution"</span>
                <span className="text-white">,</span>
                <br />
                <span className="pl-12 text-orange-300">"instant feedback"</span>
                <br />
                <span className="pl-8 text-white">]</span>
                <br />
                <span className="pl-4 text-white">{`});`}</span>
                <br />
                <br />
                <span className="pl-4 text-violet-400">return</span>
                <span className="text-white"> project.</span>
                <span className="text-yellow-300">start</span>
                <span className="text-white">();</span>
                <br />
                <span className="text-white">{`}`}</span>
              </pre>
            </div>
          </div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-violet-800 opacity-20 blur-xl"></div>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-violet-800 opacity-20 blur-xl"></div>
      </div>

      {/* Right section with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-white mb-2">
            {isLogin ? 'Log In' : 'Sign Up An Account'}
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            {isLogin ? 'Welcome back!' : 'Enter personal data to create your account'}
          </p>

          {/* OAuth buttons - keeping only Google */}
          <div className="flex mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center py-2.5 px-3 border border-gray-800 rounded-md shadow-sm bg-[#111119] text-sm font-medium text-white hover:bg-[#1a1a23] focus:outline-none"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#09090f] text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="block w-full px-3 py-2.5 bg-[#111119] text-white placeholder-gray-500 border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-700 focus:border-violet-700"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="block w-full px-3 py-2.5 bg-[#111119] text-white placeholder-gray-500 border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-700 focus:border-violet-700"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="block w-full px-3 py-2.5 bg-[#111119] text-white placeholder-gray-500 border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-700 focus:border-violet-700 pr-10"
                  placeholder="••••••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-violet-700 hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? (
              <>
                Don't have an account yet?{' '}
                <button onClick={() => setIsLogin(false)} className="text-violet-500 hover:text-violet-400 font-medium focus:outline-none">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setIsLogin(true)} className="text-violet-500 hover:text-violet-400 font-medium focus:outline-none">
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;