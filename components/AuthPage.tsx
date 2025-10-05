import React, { useState } from 'react';
import { UserIcon, MailIcon, LockIcon, SpinnerIcon } from './icons';
import { User } from '../types';
import { loginUser, registerUser } from '../services/authApi';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let user;
      if (isLoginView) {
        user = await loginUser(email, password);
      } else {
        user = await registerUser(name, email, password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setPassword('');
    setName('');
    setEmail('');
  };

  return (
    <div 
        className="h-screen w-screen text-white flex items-center justify-center font-sans p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="w-full max-w-md bg-gray-800 bg-opacity-70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-600">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Xylos AI</h1>
          <p className="text-gray-300 mt-2">{isLoginView ? 'Welcome back! Please sign in.' : 'Create your account to get started.'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginView && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-3 text-white focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
          )}
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MailIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-3 text-white focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-3 text-white focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 text-base font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="w-5 h-5 mr-3" />
                Processing...
              </>
            ) : (
              isLoginView ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={toggleView} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;