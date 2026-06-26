import React, { useState } from 'react';
import { X, Mail, Lock, User, School, Sparkles, Key } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
  defaultMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onSuccess, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('IIT Bombay');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const colleges = [
    'IIT Bombay',
    'IIT Delhi',
    'IIT Madras',
    'BITS Pilani',
    'NIT Trichy',
    'Delhi University',
    'VIT Vellore',
    'SRM University',
    'IISc Bangalore'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        onSuccess(data.user, data.token);
        onClose();
      } else if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, college, password, referralCode })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        onSuccess(data.user, data.token);
        onClose();
      } else {
        // Forgot Password Mock response
        if (!email.includes('.edu') && !email.includes('.ac.in')) {
          throw new Error('Please enter a valid educational email.');
        }
        setMessage('A password reset link has been dispatched to your student inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden bg-[#1E293B] border border-slate-800 rounded-2xl shadow-2xl">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          id="auth-close-btn"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 mb-3 border border-violet-500/30">
              <Sparkles size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white text-center">
              {mode === 'login' && 'Welcome Back to CampusLoop'}
              {mode === 'signup' && 'Create Your Student Account'}
              {mode === 'forgot' && 'Reset Student Password'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 text-center">
              {mode === 'login' && 'Log in to trade within your verified university network.'}
              {mode === 'signup' && 'Sign up with your educational email to unlock verified college trade.'}
              {mode === 'forgot' && 'Enter your .edu or student email to receive recovery instructions.'}
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-xs font-medium text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 mb-4 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-lg">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Student Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav.sharma@iitb.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm"
                />
              </div>
              {mode === 'signup' && (
                <p className="text-[11px] text-slate-500 mt-1">Must be a verified educational email (e.g. .edu, .ac.in, .edu.in)</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Select College</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <School size={18} />
                  </span>
                  <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm appearance-none"
                  >
                    {colleges.map((col) => (
                      <option key={col} value={col} className="bg-slate-900">{col}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Referral Code (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Key size={18} />
                  </span>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="ALEX50"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Get an extra 50 starting credits by entering an ambassador code.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-violet-900/20 active:scale-95 transition-all text-sm disabled:opacity-50"
              id="auth-submit-btn"
            >
              {loading ? 'Processing...' : (
                mode === 'login' ? 'Sign In' :
                mode === 'signup' ? 'Create Student Account' : 'Send Recovery Email'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            {mode === 'login' && (
              <p className="text-sm text-slate-400">
                New to CampusLoop?{' '}
                <button onClick={() => setMode('signup')} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  Sign Up
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-sm text-slate-400">
                Already registered?{' '}
                <button onClick={() => setMode('login')} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  Sign In
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button onClick={() => setMode('login')} className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
