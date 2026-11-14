import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SparkGuardMark } from './SparkGuardLogo';
import { LogOut, UserCheck, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, role, logout } = useAuth();

  return (
    <header className="border-b border-[#747EAD]/30 bg-[#15162B]/95 backdrop-blur-xl sticky top-0 z-40 shadow-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Official SparkGuard Brand & Floating S-Logo */}
        <div className="flex items-center space-x-3 select-none">
          <div className="w-10 h-10 rounded-2xl bg-[#202447] border border-[#747EAD]/40 p-1 flex items-center justify-center floating-icon-badge shadow-xl">
            <SparkGuardMark size={24} className="icon-shadow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-orbitron font-extrabold text-lg tracking-wider text-[#E7EAF5]">
                SparkGuard
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase bg-[#202447] text-[#38bdf8] border border-[#747EAD]/40 px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                AI GATEWAY
              </span>
            </div>
            <p className="text-[10px] font-rajdhani font-bold tracking-widest text-[#B1B9D8] uppercase hidden sm:block">
              Assess. Approve. Accelerate
            </p>
          </div>
        </div>

        {/* User Info & Actions: Dark Pills on Navbar */}
        {user ? (
          <div className="flex items-center space-x-3">
            {/* Dark Role Badge */}
            <div className="dark-pill flex items-center space-x-2 px-4 py-1.5">
              {role === 'ADJUSTER' ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-[#38bdf8] icon-shadow" />
                  <span className="text-xs font-semibold text-[#38bdf8]">Claims Adjuster</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 icon-shadow" />
                  <span className="text-xs font-semibold text-emerald-300">Policyholder</span>
                </>
              )}
              <span className="text-[#747EAD] text-xs">•</span>
              <span className="text-xs text-[#E7EAF5] font-medium font-mono">{user.username}</span>
            </div>

            {/* Distinct Orange/Red Glowing Logout Button */}
            <button
              onClick={logout}
              className="group flex items-center space-x-1.5 text-xs font-rajdhani font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-orange-500 border border-red-400/60 hover:border-red-300 px-4 py-1.5 rounded-full shadow-[0_0_18px_rgba(239,68,68,0.5)] hover:shadow-[0_0_26px_rgba(239,68,68,0.8)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform icon-shadow" />
              <span>LOGOUT</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
