import React from "react";

interface PatternProps {
  variant: "topography" | "scrolling-lines";
}

export function BackgroundPattern({ variant }: PatternProps) {
  if (variant === "topography") {
    return (
      <div id="concentric-topo" className="relative w-full h-full overflow-hidden flex items-center justify-center min-h-[300px]">
        {/* Render concentric, shifting circles resembling a topography map */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs rounded-3xl border border-slate-700/50 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

          {/* Interactive SVG Topography Lines */}
          <svg className="absolute w-full h-full opacity-30 text-cyan-400/60" viewBox="0 0 500 500" stroke="currentColor" fill="none" strokeWidth="1.5">
            {/* Primary ridge */}
            <path d="M 120 250 A 130 130 0 1 1 380 250 A 130 130 0 1 1 120 250" />
            <path d="M 140 250 A 110 110 0 1 1 360 250 A 110 110 0 1 1 140 250" strokeWidth="1" />
            <path d="M 160 250 A 90 90 0 1 1 340 250 A 90 90 0 1 1 160 250" />
            <path d="M 180 250 A 70 70 0 1 1 320 250 A 70 70 0 1 1 180 250" strokeWidth="1" />
            <path d="M 200 250 A 50 50 0 1 1 300 250 A 50 50 0 1 1 200 250" />
            <path d="M 220 250 A 30 30 0 1 1 280 250 A 30 30 0 1 1 220 250" />
            <path d="M 235 250 A 15 15 0 1 1 265 250 A 15 15 0 1 1 235 250" />

            {/* Secondary minor ridge */}
            <path d="M 330 380 A 60 60 0 1 1 450 380 A 60 60 0 1 1 330 380" />
            <path d="M 350 380 A 40 40 0 1 1 430 380 A 40 40 0 1 1 350 380" />
            <path d="M 370 380 A 20 20 0 1 1 410 380 A 20 20 0 1 1 370 380" strokeWidth="2" />
          </svg>

          {/* Typography label integrated gracefully */}
          <div className="absolute bottom-6 right-6 font-display font-medium text-xs tracking-widest text-cyan-400 uppercase bg-slate-950/80 px-3 py-1 border border-cyan-500/20 rounded-full flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Learn Every Code
          </div>
        </div>
      </div>
    );
  }

  // Scrolling continuous line background for the Auth screen (as requested)
  return (
    <div id="scrolling-lines" className="relative w-full h-[350px] md:h-full min-h-[300px] bg-slate-950 rounded-2xl md:rounded-r-none border border-slate-800 md:border-r-0 overflow-hidden flex flex-col justify-end p-8">
      {/* Dynamic line matrix that scrolls continuously up */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-[500%] text-cyan-500/40 scrolling-line-bg" viewBox="0 0 100 500" preserveAspectRatio="none">
          <line x1="0" y1="20" x2="100" y2="40" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="60" x2="100" y2="80" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="100" x2="100" y2="120" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="140" x2="100" y2="160" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="180" x2="100" y2="200" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="220" x2="100" y2="240" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="260" x2="100" y2="280" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="300" x2="100" y2="320" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="340" x2="100" y2="360" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="380" x2="100" y2="400" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="420" x2="100" y2="440" stroke="currentColor" strokeWidth="0.2" />
          <line x1="0" y1="460" x2="100" y2="480" stroke="currentColor" strokeWidth="0.2" />
        </svg>
      </div>

      {/* Decorative Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10" />

      {/* Code cards stacked to match notebooks "img 1, img 2, img 3" */}
      <div className="relative z-10 space-y-4">
        <div className="bg-slate-900/80 border border-slate-700/40 p-4 rounded-xl shadow-xl transform rotate-[-1deg] translate-y-2 backdrop-blur-md">
          <div className="flex gap-1.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <p className="font-mono text-[10px] text-cyan-400">// img 3: Secure JWT Cache Engine</p>
          <p className="font-mono text-xs text-slate-300 mt-1">const token = localStorage.getItem("JWT-TOKEN");</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/40 p-4 rounded-xl shadow-xl transform rotate-[2deg] translate-x-2 translate-y-1 backdrop-blur-md">
          <div className="flex gap-1.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <p className="font-mono text-[10px] text-purple-400">// img 2: Serverless NodeMailer API</p>
          <p className="font-mono text-xs text-slate-300 mt-1">await sendOTP(email, generateSixDigitOTP());</p>
        </div>

        <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-xl shadow-2xl transform rotate-[-2deg] -translate-x-1 backdrop-blur-md">
          <div className="flex gap-1.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="font-mono text-[10px] text-emerald-400">// img 1: MongoDB Cache Synchronization</p>
          <p className="font-mono text-xs text-cyan-300 mt-1">if (cache.has(username)) return cache.get(username);</p>
        </div>

        <div className="pt-4">
          <span className="text-cyan-400 font-display text-xs tracking-wider uppercase font-semibold">Continuous Scroll Up</span>
          <p className="text-slate-400 text-xs mt-1">Authenticates client-sessions with real-time feedback loops.</p>
        </div>
      </div>
    </div>
  );
}
