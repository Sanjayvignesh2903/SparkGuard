import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { SparkGuardLogo, SparkGuardMark } from './SparkGuardLogo';
import { AutomotiveLoader } from './AutomotiveLoader';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  FileText,
  UserPlus
} from 'lucide-react';

interface SparkGuardProps {
  onLoginSuccess?: () => void;
}

export const SparkGuard: React.FC<SparkGuardProps> = ({ onLoginSuccess }) => {
  const { login, register, setDemoUser } = useAuth();

  const [screen, setScreen] = useState<'intro' | 'login'>('intro');
  const [introOpacity, setIntroOpacity] = useState(false);

  // Auth Mode: 'signin' or 'register'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Login Form States
  const [selectedRole, setSelectedRole] = useState<UserRole>('POLICYHOLDER');
  const [username, setUsername] = useState('policyholder_priya');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Claim@123');
  const [policyNumber, setPolicyNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Intro Sequence: hold then fade smoothly into Login
  useEffect(() => {
    if (screen !== 'intro') return;

    const fadeTimer = setTimeout(() => {
      setIntroOpacity(true);
    }, 120);

    const transitionTimer = setTimeout(() => {
      setIntroOpacity(false);
      setTimeout(() => {
        setScreen('login');
      }, 700);
    }, 4200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(transitionTimer);
    };
  }, [screen]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (authMode === 'signin') {
      if (role === 'ADJUSTER') {
        setUsername('adjuster_raj');
        setPassword('Adjuster@123');
      } else {
        setUsername('policyholder_priya');
        setPassword('Claim@123');
      }
    }
  };

  const handleModeSwitch = (mode: 'signin' | 'register') => {
    setAuthMode(mode);
    setErrorMessage(null);
    if (mode === 'register') {
      setUsername('');
      setPassword('');
      setEmail('');
      setPolicyNumber('');
      setPhoneNumber('');
    } else {
      if (selectedRole === 'ADJUSTER') {
        setUsername('adjuster_raj');
        setPassword('Adjuster@123');
      } else {
        setUsername('policyholder_priya');
        setPassword('Claim@123');
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(username, password);
      setTimeout(() => {
        setIsLoading(false);
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    } catch (err: any) {
      console.warn('Fallback login activated:', err);
      setDemoUser(selectedRole);
      setTimeout(() => {
        setIsLoading(false);
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Please enter a username.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        policy_number: policyNumber.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined
      });
      setTimeout(() => {
        setIsLoading(false);
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleInstantDemo = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      setDemoUser(role);
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    }, 700);
  };

  return (
    <div className="relative min-h-screen w-full select-none font-sans overflow-hidden">
      
      {/* ============================================================== */}
      {/* 1. CINEMATIC INTRO: UNIFIED SEAMLESS FLOW FROM BULB TO END    */}
      {/* ============================================================== */}
      {screen === 'intro' && (
        <div className="fixed inset-0 z-50 bg-[#000000] flex items-center justify-center overflow-hidden">
          
          <div 
            className={`relative w-full max-w-2xl h-full max-h-[96vh] flex flex-col items-center justify-center transition-all duration-1000 ease-out ${
              introOpacity ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {/* Single Unified Car & Continuous Headlight Beam (flows from bulb to end as one uninterrupted projection) */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src="/car_seamless_flow.png"
                alt="SparkGuard Supercar & Continuous Headlight Beams"
                className="w-full h-auto max-h-[92vh] object-contain select-none pointer-events-none drop-shadow-[0_0_35px_rgba(255,255,255,0.12)]"
              />

              {/* Logo Placed in the Upper Illuminated Beam Area */}
              <div className="absolute top-[23%] sm:top-[25%] left-0 right-0 flex flex-col items-center text-center px-4 pointer-events-none z-20">
                <SparkGuardLogo size="xl" showTagline={true} />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. AUTOMOTIVE LOADING POP-UP                                   */}
      {/* ============================================================== */}
      {isLoading && (
        <AutomotiveLoader
          headline="PREPARING YOUR SITE"
          punchlines={[
            'SYNCHRONIZING VEHICLE TELEMETRY...',
            'AUTHENTICATING OPERATOR CREDENTIALS...',
            'CALIBRATING CANNY EDGE VISION MATRIX...',
            'ENTERING COCKPIT CONTROL CENTER...'
          ]}
        />
      )}

      {/* ============================================================== */}
      {/* 3. LOGIN PAGE: FLOATING DARK BOX ON #454C83 STATIC BACKGROUND */}
      {/* ============================================================== */}
      {screen === 'login' && !isLoading && (
        <div className="relative min-h-screen w-full bg-[#454C83] flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-700">
          
          {/* Thin Framing Border Around Login Page Viewport in Palette Grade (desktop only) */}
          <div className="fixed inset-3 sm:inset-5 pointer-events-none border border-[#747EAD]/30 rounded-[32px] z-10 hidden sm:block" />

          {/* Subtle ambient lighting behind floating dark card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-br from-[#747EAD]/25 via-[#292D54]/30 to-transparent blur-[90px] sm:blur-[140px] pointer-events-none" />

          {/* Floating Dark Box with Thin Palette-Grade Hairline Border */}
          <div className="floating-dark-box thin-grade-border relative z-30 w-full max-w-md p-5 sm:p-9 overflow-hidden">
            
            {/* Top illuminated cyan trim */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#38bdf8] via-[#747EAD] to-[#ef4444]" />

            {/* Header: Official SparkGuard Logo */}
            <div className="text-center mb-6 pt-2 flex flex-col items-center">
              <SparkGuardLogo size="lg" showTagline={true} />
            </div>

            {/* Mode Switcher Tabs: SIGN IN vs CREATE ACCOUNT */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#15162B] border border-[#747EAD]/30 rounded-full mb-5 shadow-inner">
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className={`py-2 px-3 rounded-full font-rajdhani font-bold text-xs tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
                  authMode === 'signin'
                    ? 'dark-pill-active text-white'
                    : 'text-[#747EAD] hover:text-[#E7EAF5]'
                }`}
              >
                <Lock className="w-3.5 h-3.5 icon-shadow" />
                <span>SIGN IN</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className={`py-2 px-3 rounded-full font-rajdhani font-bold text-xs tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
                  authMode === 'register'
                    ? 'dark-pill-active text-white'
                    : 'text-[#747EAD] hover:text-[#E7EAF5]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 icon-shadow" />
                <span>CREATE ACCOUNT</span>
              </button>
            </div>

            {/* Dark Pill Role Switcher */}
            <div className="bg-[#15162B] p-1.5 rounded-full border border-[#747EAD]/30 flex items-center justify-between gap-1 mb-5 shadow-inner">
              <button
                type="button"
                onClick={() => handleRoleSelect('POLICYHOLDER')}
                className={`flex-1 py-2 px-3 rounded-full font-rajdhani font-bold text-xs tracking-wider transition-all flex items-center justify-center space-x-2 ${
                  selectedRole === 'POLICYHOLDER'
                    ? 'dark-pill-active'
                    : 'text-[#747EAD] hover:text-[#E7EAF5]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedRole === 'POLICYHOLDER' ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]' : 'bg-[#454C83]'}`} />
                <span>POLICYHOLDER</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('ADJUSTER')}
                className={`flex-1 py-2 px-3 rounded-full font-rajdhani font-bold text-xs tracking-wider transition-all flex items-center justify-center space-x-2 ${
                  selectedRole === 'ADJUSTER'
                    ? 'dark-pill-active'
                    : 'text-[#747EAD] hover:text-[#E7EAF5]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedRole === 'ADJUSTER' ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]' : 'bg-[#454C83]'}`} />
                <span>CLAIMS ADJUSTER</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-[18px] bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5 icon-shadow" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => handleInstantDemo(selectedRole)}
                      className="block mt-1 underline text-red-300 font-semibold"
                    >
                      Click to launch instant demo session →
                    </button>
                  )}
                </div>
              </div>
            )}

            {authMode === 'signin' ? (
              /* ================= SIGN IN FORM ================= */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Username Input with Floating Icon */}
                <div>
                  <label className="block font-rajdhani font-bold text-xs tracking-wider text-[#B1B9D8] uppercase mb-1.5">
                    User Account / ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#747EAD]">
                      <User className="w-4 h-4 icon-shadow" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#15162B] border border-[#747EAD]/30 rounded-full pl-10 pr-4 py-3 text-sm text-[#E7EAF5] placeholder-[#747EAD] focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/30 transition-all font-mono shadow-inner"
                      placeholder="e.g. policyholder_priya"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    </div>
                  </div>
                </div>

                {/* Password Input with Floating Icon */}
                <div>
                  <label className="block font-rajdhani font-bold text-xs tracking-wider text-[#B1B9D8] uppercase mb-1.5">
                    Security Passkey
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#747EAD]">
                      <Lock className="w-4 h-4 icon-shadow" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#15162B] border border-[#747EAD]/30 rounded-full pl-10 pr-10 py-3 text-sm text-[#E7EAF5] placeholder-[#747EAD] focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/30 transition-all font-mono shadow-inner"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#747EAD] hover:text-[#E7EAF5]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 icon-shadow" /> : <Eye className="w-4 h-4 icon-shadow" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs font-rajdhani text-[#B1B9D8] pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="rounded bg-[#15162B] border-[#454C83] text-[#38bdf8] focus:ring-0" 
                    />
                    <span>Remember Session</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('register')}
                    className="text-[#38bdf8] hover:underline font-semibold"
                  >
                    Need an account?
                  </button>
                </div>

                {/* Dark Pill Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="dark-pill-active group relative w-full overflow-hidden mt-3 py-3.5 px-4 rounded-full font-rajdhani font-bold tracking-wider text-sm text-white flex items-center justify-center space-x-2 disabled:opacity-75 shadow-xl"
                >
                  <Zap className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform icon-shadow" />
                  <span>SECURE SIGN IN</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform icon-shadow" />
                </button>
              </form>
            ) : (
              /* ================= CREATE ACCOUNT / REGISTER FORM ================= */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                
                {/* Username Input */}
                <div>
                  <label className="block font-rajdhani font-bold text-xs tracking-wider text-[#B1B9D8] uppercase mb-1">
                    Choose Username <span className="text-[#38bdf8]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#747EAD]">
                      <User className="w-4 h-4 icon-shadow" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#15162B] border border-[#747EAD]/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-[#E7EAF5] placeholder-[#747EAD] focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/30 transition-all font-mono shadow-inner"
                      placeholder="e.g. rahul_verma"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block font-rajdhani font-bold text-xs tracking-wider text-[#B1B9D8] uppercase mb-1">
                    Email Address <span className="text-[#38bdf8]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#747EAD]">
                      <Mail className="w-4 h-4 icon-shadow" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#15162B] border border-[#747EAD]/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-[#E7EAF5] placeholder-[#747EAD] focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/30 transition-all font-mono shadow-inner"
                      placeholder="rahul@example.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block font-rajdhani font-bold text-xs tracking-wider text-[#B1B9D8] uppercase mb-1">
                    Create Password (min 6 chars) <span className="text-[#38bdf8]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#747EAD]">
                      <Lock className="w-4 h-4 icon-shadow" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#15162B] border border-[#747EAD]/30 rounded-full pl-10 pr-10 py-2.5 text-sm text-[#E7EAF5] placeholder-[#747EAD] focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/30 transition-all font-mono shadow-inner"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#747EAD] hover:text-[#E7EAF5]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 icon-shadow" /> : <Eye className="w-4 h-4 icon-shadow" />}
                    </button>
                  </div>
                </div>

                {/* Policy Number (for policyholder) */}
                {selectedRole === 'POLICYHOLDER' && (
                  <div>
                    <label className="block font-rajdhani font-bold text-xs tracking-wider text-[#B1B9D8] uppercase mb-1">
                      Vehicle Policy Number <span className="text-[#747EAD] text-[10px] lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#747EAD]">
                        <FileText className="w-4 h-4 icon-shadow" />
                      </div>
                      <input
                        type="text"
                        value={policyNumber}
                        onChange={(e) => setPolicyNumber(e.target.value)}
                        className="w-full bg-[#15162B] border border-[#747EAD]/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-[#E7EAF5] placeholder-[#747EAD] focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/30 transition-all font-mono shadow-inner"
                        placeholder="e.g. POL-DL-2026-98765 (Auto-generated if blank)"
                      />
                    </div>
                  </div>
                )}

                {/* Phone Number */}
                <div>
                  <label className="block font-rajdhani font-bold text-xs tracking-wider text-[#B1B9D8] uppercase mb-1">
                    Mobile Phone Number <span className="text-[#747EAD] text-[10px] lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#747EAD]">
                      <Phone className="w-4 h-4 icon-shadow" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-[#15162B] border border-[#747EAD]/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-[#E7EAF5] placeholder-[#747EAD] focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/30 transition-all font-mono shadow-inner"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Dark Pill Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="dark-pill-active group relative w-full overflow-hidden mt-4 py-3.5 px-4 rounded-full font-rajdhani font-bold tracking-wider text-sm text-white flex items-center justify-center space-x-2 disabled:opacity-75 shadow-xl"
                >
                  <UserPlus className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform icon-shadow" />
                  <span>REGISTER & ENTER PORTAL</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform icon-shadow" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('signin')}
                    className="text-xs font-rajdhani text-[#B1B9D8] hover:text-[#38bdf8] transition-colors"
                  >
                    Already have an account? <span className="underline font-bold text-[#38bdf8]">Sign In here →</span>
                  </button>
                </div>
              </form>
            )}

            {/* Instant Demo Launchers */}
            <div className="mt-6 pt-5 border-t border-[#747EAD]/25">
              <div className="flex items-center space-x-1.5 text-xs font-rajdhani font-bold tracking-wider text-[#747EAD] mb-3 justify-center uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#38bdf8] icon-shadow" />
                <span>Instant 1-Click Demo Login:</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleInstantDemo('POLICYHOLDER')}
                  className="dark-pill py-2.5 px-3 rounded-full text-[11px] font-rajdhani font-bold text-[#E7EAF5] transition-all text-center flex items-center justify-center space-x-1.5"
                >
                  <SparkGuardMark size={14} className="icon-shadow" />
                  <span>Policyholder Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInstantDemo('ADJUSTER')}
                  className="dark-pill py-2.5 px-3 rounded-full text-[11px] font-rajdhani font-bold text-[#E7EAF5] transition-all text-center flex items-center justify-center space-x-1.5"
                >
                  <SparkGuardMark size={14} className="icon-shadow" />
                  <span>Adjuster Hub</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
