import React, { useState, useEffect } from 'react';

interface AutomotiveLoaderProps {
  headline?: string;
  subtext?: string;
  punchlines?: string[];
  fullscreen?: boolean;
}

export const AutomotiveLoader: React.FC<AutomotiveLoaderProps> = ({
  headline = 'PREPARING YOUR SITE',
  subtext,
  punchlines = [
    'CALIBRATING VEHICLE TELEMETRY...',
    'SYNCHRONIZING SECURE ADJUDICATION MATRIX...',
    'CALIBRATING OPENCV CANNY EDGE SENSORS...',
    'ENGAGING SPARKGUARD NEURAL LINK...',
    'PREPARING HIGH-PERFORMANCE COCKPIT...'
  ],
  fullscreen = true,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [punchIndex, setPunchIndex] = useState(0);

  // Dynamic sequential side indicator wave (pops up one block by one block)
  useEffect(() => {
    const barInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 7); // 0 to 6
    }, 190);

    return () => clearInterval(barInterval);
  }, []);

  // Rotate punch lines
  useEffect(() => {
    const punchInterval = setInterval(() => {
      setPunchIndex((prev) => (prev + 1) % punchlines.length);
    }, 1800);

    return () => clearInterval(punchInterval);
  }, [punchlines.length]);

  const content = (
    <div className="flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto select-none">
      
      {/* 1. BIG, BOLD, HIGH-TECH AUTOMOTIVE PUNCH WORDS */}
      <h1 className="font-orbitron font-black italic text-3xl sm:text-5xl md:text-6xl tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E7EAF5] to-[#38bdf8] drop-shadow-[0_0_35px_rgba(56,189,248,0.7)] animate-in fade-in zoom-in-95 duration-500">
        {headline}
      </h1>

      {/* 2. ROTATING SUB-PUNCHLINE TICKER */}
      <div className="h-9 flex items-center justify-center mt-3 mb-9">
        <p className="font-rajdhani font-extrabold text-sm sm:text-base tracking-[0.3em] text-[#38bdf8] uppercase flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8] animate-ping" />
          <span>{subtext || punchlines[punchIndex]}</span>
        </p>
      </div>

      {/* 3. SMALL SEQUENTIAL SIDE INDICATOR BARS (MODELED AFTER USER'S IMAGE 6) */}
      {/* Recessed aerodynamic pod housing */}
      <div className="relative p-2.5 sm:p-3 rounded-2xl bg-[#090a16] border border-[#292D54] shadow-[inset_0_4px_12px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        
        {/* Subtle illuminated edge glow */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#2563eb]/30 via-[#38bdf8]/40 to-[#2563eb]/30 blur-sm -z-10" />

        {/* The 6 side-indicator capsule slats */}
        <div className="flex items-end justify-center space-x-2 sm:space-x-3 h-14 sm:h-16 px-1">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isLit = activeStep >= index && activeStep > 0;
            const isCurrent = activeStep === index + 1;

            return (
              <div
                key={index}
                className="relative flex flex-col items-center justify-start transition-all duration-150 ease-out"
                style={{
                  transform: isLit ? 'translateY(-4px) scale(1.08)' : 'translateY(0) scale(1)',
                }}
              >
                {/* Slat Body (Small Side Indicator Shape) */}
                <div
                  className={`w-3 sm:w-4 rounded-full transition-all duration-200 overflow-hidden relative ${
                    isLit 
                      ? 'h-11 sm:h-14 shadow-[0_0_18px_rgba(56,189,248,0.9),0_0_30px_rgba(37,99,235,0.6)]' 
                      : 'h-9 sm:h-11 opacity-25'
                  }`}
                  style={{
                    background: isLit
                      ? index === 5 
                        ? 'linear-gradient(180deg, #ffffff 0%, #93c5fd 40%, #2563eb 100%)'
                        : isCurrent
                        ? 'linear-gradient(180deg, #ffffff 0%, #38bdf8 60%, #0284c7 100%)'
                        : 'linear-gradient(180deg, #93c5fd 0%, #38bdf8 60%, #1d4ed8 100%)'
                      : 'linear-gradient(180deg, #1b1e38 0%, #101224 100%)',
                    border: isLit ? '1px solid rgba(255,255,255,0.85)' : '1px solid #1e2242',
                  }}
                >
                  {/* Glossy liquid glass lens highlight at top of capsule */}
                  <div 
                    className={`w-[60%] mx-auto h-3 rounded-full mt-0.5 transition-opacity ${
                      isLit ? 'bg-white/90 shadow-[0_0_6px_#ffffff]' : 'bg-white/10'
                    }`} 
                  />
                  
                  {/* Internal LED core */}
                  {isLit && (
                    <div className="absolute inset-x-0 bottom-1 h-2/3 bg-gradient-to-t from-transparent via-[#38bdf8]/40 to-white/60 blur-[1px]" />
                  )}
                </div>

                {/* Slat index subtle indicator dot */}
                <div 
                  className={`w-1 h-1 rounded-full mt-1.5 transition-all duration-200 ${
                    isLit ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]' : 'bg-[#292D54]'
                  }`} 
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Telemetry Indicator Caption */}
      <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-[#747EAD] mt-6 uppercase tracking-[0.25em]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
        <span>SPARKGUARD SYSTEM DIAGNOSTICS: SYNCHRONIZING</span>
      </div>

    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#060713] flex items-center justify-center overflow-hidden">
        {/* Background glow and subtle speed accents */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#2563eb]/20 via-[#38bdf8]/15 to-transparent blur-[140px] pointer-events-none" />
        {/* Neon blue border vignette matching Image 4 */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 60px 15px rgba(37,99,235,0.45), inset 0 0 120px 40px rgba(15,23,42,0.85)'
          }}
        />
        {content}
      </div>
    );
  }

  return content;
};
