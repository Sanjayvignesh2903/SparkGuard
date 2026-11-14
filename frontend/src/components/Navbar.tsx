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
    <header className="border-b border-[#747EAD]/30 bg-[#15162B]/95 backdrop-blur-xl sticky top-0 z-40 shadow-2xl transition-colors w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Official SparkGuard Brand & Floating S-Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 select-none shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#202447] border border-[#747EAD]/40 p-1 flex items-center justify-center floating-icon-badge shadow-xl shrink-0">
            <SparkGuardMark size={20} className="icon-shadow sm:hidden" />
            <SparkGuardMark size={24} className="icon-shadow hidden sm:block" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-orbitron font-extrabold text-base sm:text-lg tracking-wider text-[#E7EAF5]">
                SparkGuard
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase bg-[#202447] text-[#38bdf8] border border-[#747EAD]/40 px-2 py-0.5 rounded-full font-bold shadow-sm hidden xs:inline-block">
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
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Dark Role Badge */}
            <div className="dark-pill flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-1 sm:py-1.5 max-w-[130px] xs:max-w-[180px] sm:max-w-none">
              {role === 'ADJUSTER' ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-[#38bdf8] icon-shadow shrink-0" />
                  <span className="text-xs font-semibold text-[#38bdf8] hidden md:inline">Claims Adjuster</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 icon-shadow shrink-0" />
                  <span className="text-xs font-semibold text-emerald-300 hidden md:inline">Policyholder</span>
                </>
              )}
              <span className="text-[#747EAD] text-xs hidden md:inline">•</span>
              <span className="text-xs text-[#E7EAF5] font-medium font-mono truncate">{user.username}</span>
            </div>

            {/* Distinct Orange/Red Glowing Logout Button */}
            <button
              onClick={logout}
              className="group flex items-center space-x-1 text-xs font-rajdhani font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-orange-500 border border-red-400/60 hover:border-red-300 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-[0_0_18px_rgba(239,68,68,0.5)] hover:shadow-[0_0_26px_rgba(239,68,68,0.8)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform icon-shadow shrink-0" />
              <span className="hidden xs:inline">LOGOUT</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
