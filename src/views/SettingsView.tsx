import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TargetGrade, LearningStyle } from '../types';
import {
  Settings,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Sliders,
  Calendar,
  GraduationCap,
  CloudCheck,
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    loginGoogle,
    loginGuest,
    logout,
    cloudSyncStatus,
    preferences,
    updatePreferences,
    setIsOnboardingOpen,
    showToast,
  } = useApp();

  const [examDate, setExamDate] = useState(preferences.examDate);
  const [targetGrade, setTargetGrade] = useState<TargetGrade>(preferences.targetGrade);
  const [dailyHours, setDailyHours] = useState(preferences.dailyGoalHours);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(preferences.learningStyle);

  const handleSave = () => {
    updatePreferences({
      examDate,
      targetGrade,
      dailyGoalHours: dailyHours,
      learningStyle,
    });
    showToast('Settings saved and synchronized!', 'success');
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset your local study plan and quiz history to defaults?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings & Account
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Manage your exam profile, Firebase Authentication, and Firestore sync preferences.
        </p>
      </div>

      {/* 1. Firebase Authentication & Cloud Storage Status */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Firebase Auth & Firestore Sync
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-semibold">
            {cloudSyncStatus === 'synced' ? '● Synced to Cloud' : '● Local Offline Storage'}
          </span>
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/30 border border-white/10">
            <div className="flex items-center gap-3.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-500/50"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-white">{user.displayName || 'Authenticated Scholar'}</p>
                <p className="text-xs text-gray-400">{user.email || 'UID: ' + user.uid.slice(0, 12)}</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  Firestore Database Connected: crested-guru-467810-s2
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/30 border border-white/10">
            <div>
              <p className="text-sm font-bold text-white">Not signed in with Firebase</p>
              <p className="text-xs text-gray-400">
                Sign in with Google to enable multi-device sync, cloud study history, and persistent backup.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loginGuest}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-medium cursor-pointer"
              >
                Guest Mode
              </button>
              <button
                onClick={loginGoogle}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Exam Parameters Form */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Exam Profile & Target Grade
            </h2>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            Launch Setup Wizard
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              <span>Exam Date</span>
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-[#141422] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
              <span>Target Grade</span>
            </label>
            <select
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value as TargetGrade)}
              className="w-full bg-[#141422] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="A+">A+ (95 - 100%) Elite</option>
              <option value="A">A (85 - 94%) Distinction</option>
              <option value="B+">B+ (75 - 84%) High Merit</option>
              <option value="B">B (65 - 74%) Merit</option>
              <option value="C">C (50 - 64%) Pass</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>Daily Study Target: {dailyHours} Hours/Day</span>
            <span className="text-blue-400 font-mono">{dailyHours * 7}h weekly</span>
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="0.5"
            value={dailyHours}
            onChange={(e) => setDailyHours(parseFloat(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* 3. Danger Zone / Reset */}
      <div className="rounded-3xl bg-rose-950/10 border border-rose-500/20 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Reset Study Plan & History
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Clear all cached daily tasks, quiz score trends, and local progress.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset All</span>
        </button>
      </div>
    </div>
  );
};
