import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Flame,
  Clock,
  CloudCheck,
  CloudUpload,
  User as UserIcon,
  LogOut,
  Sliders,
  ChevronDown,
  Menu,
  X,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC<{ onToggleMobileNav?: () => void; isMobileNavOpen?: boolean }> = ({
  onToggleMobileNav,
  isMobileNavOpen,
}) => {
  const {
    user,
    loginGoogle,
    loginGuest,
    logout,
    cloudSyncStatus,
    preferences,
    setIsOnboardingOpen,
    setActiveTab,
  } = useApp();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Live countdown to exam date
  useEffect(() => {
    const calculateCountdown = () => {
      const examTime = new Date(`${preferences.examDate}T09:00:00`).getTime();
      const now = new Date().getTime();
      const diff = examTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [preferences.examDate]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0A0A0F]">
                <Sparkles className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-blue-100 to-indigo-300 bg-clip-text text-transparent">
                  Astra
                </span>
                <span className="text-xs uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Prep
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
                AI Exam Mastery & Study Planner
              </p>
            </div>
          </button>
        </div>

        {/* Center: Exam Countdown Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs">
          <Clock className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span className="text-gray-400">Exam Countdown:</span>
          <div className="flex items-center gap-1 font-mono font-semibold text-white">
            <span className="text-blue-400">{timeLeft.days}d</span>
            <span className="text-gray-500">:</span>
            <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
            <span className="text-gray-500">:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
            <span className="text-gray-500">:</span>
            <span className="text-indigo-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
          </div>
          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Target: {preferences.targetGrade}
          </span>
        </div>

        {/* Right: Actions, Sync, User Profile */}
        <div className="flex items-center gap-3">
          {/* Study streak */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-medium">
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-bounce" />
            <span>7-Day Streak</span>
          </div>

          {/* Cloud Sync Status */}
          <div
            title={`Firestore Status: ${cloudSyncStatus}`}
            className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5"
          >
            {cloudSyncStatus === 'synced' ? (
              <>
                <div className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" />
                <span className="text-emerald-400">Cloud Synced</span>
              </>
            ) : cloudSyncStatus === 'syncing' ? (
              <>
                <CloudUpload className="h-3 w-3 text-blue-400 animate-spin" />
                <span className="text-blue-400">Syncing...</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-gray-500" />
                <span>Local Storage</span>
              </>
            )}
          </div>

          {/* Quick Setup Wizard Button */}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 hover:text-white border border-white/10 transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-indigo-400" />
            <span>Customize Plan</span>
          </button>

          {/* User Auth Dropdown */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 transition-colors"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-blue-500/40"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-gray-200 hidden sm:block max-w-[100px] truncate">
                  {user.displayName || 'Scholar'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
            ) : (
              <button
                onClick={loginGoogle}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Sign in with Google</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#12121A] border border-white/15 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.displayName || 'Scholar'}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email || 'Authenticated'}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Firestore Connected</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Exam Settings & Goals</span>
                </button>

                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                  <span>Re-run Onboarding</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          {onToggleMobileNav && (
            <button
              onClick={onToggleMobileNav}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
