import React from "react";
import { GraduationCap, LogOut, Code, User as UserIcon, LayoutDashboard, HelpCircle } from "lucide-react";
import { User } from "../types";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: any) => void;
  user: User | null;
  onLogout: () => void;
  onOpenAboutModal?: () => void;
  onOpenPricingModal?: () => void;
  onOpenFeaturesModal?: () => void;
  onOpenStudentInfoTab?: () => void;
  onOpenReachusTab?: () => void;
}

export function Header({
  currentView,
  onNavigate,
  user,
  onLogout,
  onOpenAboutModal,
  onOpenPricingModal,
  onOpenFeaturesModal,
  onOpenStudentInfoTab,
  onOpenReachusTab
}: HeaderProps) {
  
  const isAdmin = user?.email === "ritika@admin.tech";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Name with play button style as hand-drawn in mockup */}
        <div 
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="brand-logo"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 transform group-hover:scale-105 transition-transform duration-200">
            {/* Draw a gorgeous code icon with the overlap effect matching the mockup drawing */}
            <Code className="w-5 h-5 text-white stroke-[2.5]" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                Ritika's
              </span>
              <span className="bg-cyan-500 text-[10px] text-slate-950 font-mono font-bold px-1.5 py-0.5 rounded leading-none">
                TECH HUB
              </span>
            </div>
            <p className="text-[10px] text-slate-400/80 font-mono tracking-widest leading-none mt-0.5 uppercase hidden sm:block">
              Learn Every Code
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Links based on page/view state */}
        <nav className="flex items-center gap-1 sm:gap-4 font-medium text-xs sm:text-sm text-slate-300">
          {currentView === "landing" ? (
            <>
              <button 
                onClick={onOpenAboutModal}
                className="hover:text-cyan-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/60 transition-colors"
              >
                About
              </button>
              <button 
                onClick={onOpenPricingModal}
                className="hover:text-cyan-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/60 transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={onOpenFeaturesModal}
                className="hover:text-cyan-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/60 transition-colors pointer-events-auto"
              >
                Features
              </button>
            </>
          ) : user ? (
            <>
              {isAdmin ? (
                <span className="text-amber-400 font-mono bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Admin Mode
                </span>
              ) : (
                <>
                  <button 
                    onClick={onOpenReachusTab}
                    className="hover:text-cyan-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/60 transition-colors flex items-center gap-1"
                  >
                    <span>Reachus Updates</span>
                  </button>
                  <button 
                    onClick={onOpenStudentInfoTab}
                    className="hover:text-cyan-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/60 transition-colors flex items-center gap-1"
                  >
                    <span>StudentInfo</span>
                  </button>
                </>
              )}
            </>
          ) : null}
        </nav>

        {/* Session Action: Authentication state indicators */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-full pl-3 pr-2.5 py-1"
                title={`Logged in as ${user.email}`}
              >
                {/* User Info Avatar in the page header */}
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold border border-cyan-500/30">
                  {user.studentInfo?.studentName ? user.studentInfo.studentName[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <span className="text-xs text-slate-300 font-mono hidden md:inline-block max-w-[120px] truncate">
                  {user.studentInfo?.studentName || user.email.split("@")[0]}
                </span>
                
                {/* Dashboard Shortcut link */}
                <button
                  onClick={() => {
                    if (isAdmin) {
                      onNavigate("admin");
                    } else if (user.classSelection) {
                      onNavigate("student");
                    } else {
                      onNavigate("qs");
                    }
                  }}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 p-1 rounded-full transition-colors ml-1"
                  title="Go to Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Secure Session Sign Out */}
              <button
                onClick={onLogout}
                className="bg-slate-900/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 p-2 rounded-xl border border-slate-800 hover:border-rose-900/50 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate("auth")}
              className="relative px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs tracking-wide shadow-md hover:shadow-cyan-500/20 active:scale-95 transition-all text-center cursor-pointer"
              id="header-signin-btn"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
