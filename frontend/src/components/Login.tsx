import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Shield, Lock, User, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, setDemoUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('POLICYHOLDER');
  const [username, setUsername] = useState('policyholder_priya');
  const [password, setPassword] = useState('Claim@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'ADJUSTER') {
      setUsername('adjuster_raj');
      setPassword('Adjuster@123');
    } else {
      setUsername('policyholder_priya');
      setPassword('Claim@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(username, password);
    } catch (err: any) {
      console.warn('API authentication error:', err);
      // If backend is not yet started or credentials fail, offer friendly demo bypass
      setErrorMessage(err.message || 'Login failed. You can click "Instant Demo Preview" below.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemo = (role: UserRole) => {
    setDemoUser(role);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[550px] max-h-[550px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[80vw] h-[80vw] max-w-[550px] max-h-[550px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 p-6 sm:p-8 backdrop-blur-xl">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to IntelliClaim</h1>
            <p className="text-sm text-slate-400 mt-1">Multi-Modal AI Vehicle Claim Adjudication</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleRoleTabChange('POLICYHOLDER')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                selectedRole === 'POLICYHOLDER'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🚗 Policyholder</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('ADJUSTER')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                selectedRole === 'ADJUSTER'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🛡️ Claims Adjuster</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => handleInstantDemo(selectedRole)}
                  className="block mt-1.5 underline text-rose-200 font-semibold hover:text-white"
                >
                  Click here to bypass with Demo Session →
                </button>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  placeholder="e.g. policyholder_priya"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all ${
                selectedRole === 'ADJUSTER'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {selectedRole === 'ADJUSTER' ? 'Adjuster' : 'Policyholder'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Section */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-3 justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instant One-Click Demo Mode:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemo('POLICYHOLDER')}
                className="py-2 px-2.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white transition-all text-center"
              >
                Launch Policyholder UI
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemo('ADJUSTER')}
                className="py-2 px-2.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white transition-all text-center"
              >
                Launch Adjuster Center
              </button>
            </div>
          </div>

        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-slate-500 mt-4">
          Powered by OpenCV edge analytics & Groq Llama 3 8B zero-shot forensics.
        </p>
      </div>
    </div>
  );
};

