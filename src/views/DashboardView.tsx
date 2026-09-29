import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  ArrowRight,
  BookOpen,
  FileCheck2,
  Layers,
  MessageSquareCode,
  Film,
  Calendar,
  ChevronRight,
  Sliders,
  Check,
  AlertTriangle,
  Upload,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    preferences,
    studyPlan,
    materials,
    toggleTaskCompletion,
    setActiveTab,
    setIsOnboardingOpen,
    topicMastery,
  } = useApp();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

  // Overall mastery calculation
  const totalMastery = topicMastery.length > 0
    ? Math.round(topicMastery.reduce((acc, curr) => acc + curr.masteryPercentage, 0) / topicMastery.length)
    : 78;

  // Filter tasks for today
  const todayTasks = studyPlan.dailyTasks.filter((t) => t.dayOffset === 0);
  const completedToday = todayTasks.filter((t) => t.completed).length;

  // Calculate circumference for progress ring
  const ringRadius = 42;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference - (totalMastery / 100) * circumference;

  // Total topics detected across uploaded materials
  const allDetectedTopics = Array.from(new Set(materials.flatMap((m) => m.topicsDetected)));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO SECTION: "Ready for your exam?" & Countdown Clock */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121226] via-[#0E0E1B] to-[#0A0A0F] border border-white/15 p-6 sm:p-8 shadow-2xl">
        {/* Neon Glow Accents */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Message */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs text-blue-300 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Astra Adaptive Prep Engine</span>
              <span className="text-gray-500">•</span>
              <span className="text-indigo-300 font-mono">Target: {preferences.targetGrade}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready for your exam?{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Every hour counts.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
              Your personalized study plan has prioritized{' '}
              <span className="text-white font-medium">{preferences.subjects.join(', ')}</span> based on your{' '}
              <span className="text-blue-400 font-medium">{preferences.learningStyle}</span> learning preference.
            </p>

            {/* Quick action buttons row */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('quiz')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Start Practice Quiz</span>
              </button>

              <button
                onClick={() => setActiveTab('tutor')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <MessageSquareCode className="h-4 w-4 text-purple-400" />
                <span>Ask AI Tutor</span>
              </button>

              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Adjust Parameters</span>
              </button>
            </div>
          </div>

          {/* Right Hero: Countdown Display */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>Exam Date Countdown</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 w-full text-center">
              <div className="p-3 rounded-2xl bg-[#090911] border border-white/10">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] uppercase font-semibold text-gray-400">Days</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#090911] border border-white/10">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-400 block">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-gray-400">Hours</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#090911] border border-white/10">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-300 block">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-gray-400">Mins</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#090911] border border-white/10">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-400 block">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-gray-400">Secs</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between w-full pt-3 border-t border-white/10 text-xs">
              <span className="text-gray-400 font-medium">Target Exam Date:</span>
              <span className="font-semibold text-white font-mono">
                {new Date(preferences.examDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS & PROGRESS SUMMARY ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card A: Overall Mastery Percentage with Animated SVG Ring */}
        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Exam Mastery Level
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-mono">{totalMastery}%</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                +4% this week
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Target {preferences.targetGrade} requires 90%+ in high-yield topics
            </p>
          </div>

          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/10"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={ringRadius}
                stroke="url(#masteryGradient)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                fill="transparent"
              />
              <defs>
                <linearGradient id="masteryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-sm font-bold text-white font-mono">
              {totalMastery}%
            </div>
          </div>
        </div>

        {/* Card B: Uploaded Materials Summary Card */}
        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span>Study Materials</span>
            </div>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <Upload className="h-3 w-3" />
              <span>Add More</span>
            </button>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white font-mono">{materials.length}</span>
            <span className="text-xs text-gray-400">files & notes analyzed</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {allDetectedTopics.slice(0, 4).map((topic, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-mono"
              >
                {topic}
              </span>
            ))}
            {allDetectedTopics.length > 4 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono">
                +{allDetectedTopics.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Card C: Today's Tasks Progress */}
        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>Today's Workload</span>
            </div>
            <span className="text-xs font-semibold text-purple-400 font-mono">
              {completedToday}/{todayTasks.length} Done
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-gray-300">Daily Study Goal:</span>
              <span className="font-bold text-white font-mono">{preferences.dailyGoalHours} Hours</span>
            </div>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: `${todayTasks.length > 0 ? (completedToday / todayTasks.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-gray-400">
            <span>Streak status:</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Flame className="h-3 w-3 fill-amber-400" /> 7 Active Days
            </span>
          </div>
        </div>
      </div>

      {/* 3. AI-GENERATED STUDY PLAN PREVIEW: Today's Tasks & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Tasks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Today's Focus Tasks</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                {todayTasks.length} planned
              </span>
            </div>
            <button
              onClick={() => setActiveTab('plan')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Timeline</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start justify-between p-4 rounded-2xl border transition-all ${
                  task.completed
                    ? 'bg-white/[0.01] border-white/5 opacity-70'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 pr-3">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`mt-0.5 h-5 w-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      task.completed
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-white/30 hover:border-white text-transparent'
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-mono">
                        {task.subject}
                      </span>
                      <span className="text-[11px] text-gray-400">• {task.durationMin} mins</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                        {task.format}
                      </span>
                    </div>

                    <p
                      className={`text-sm font-semibold ${
                        task.completed ? 'line-through text-gray-400' : 'text-white'
                      }`}
                    >
                      {task.topic}
                    </p>

                    {task.highYieldTip && (
                      <p className="text-xs text-indigo-300/90 leading-relaxed font-mono">
                        💡 {task.highYieldTip}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (task.format === 'Quiz') setActiveTab('quiz');
                    else if (task.format === 'Flashcards') setActiveTab('flashcards');
                    else if (task.format === 'Mock Test') setActiveTab('mock-exam');
                    else setActiveTab('tutor');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Weekly Focus & Milestone Roadmap */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Milestone Roadmap</h2>
            <span className="text-xs text-gray-400 font-mono">3-Week Strategy</span>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
            {studyPlan.weeklyMilestones.map((ms, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Timeline vertical bar */}
                {idx < studyPlan.weeklyMilestones.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-white/10" />
                )}

                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    idx === 0
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  W{ms.weekNumber}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">{ms.title}</p>
                    {idx === 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-300">{ms.focus}</p>
                  <p className="text-[11px] font-mono text-indigo-300 pt-0.5">
                    🎯 {ms.milestone}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setActiveTab('flashcards')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-colors text-left group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 group-hover:scale-110 transition-transform">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Review Flashcards</p>
                <p className="text-[10px] text-gray-400">Spaced recall drill</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('mock-exam')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-colors text-left group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Mock Exam</p>
                <p className="text-[10px] text-gray-400">Timed hall simulation</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('concept-video')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-colors text-left group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-fuchsia-600/20 text-fuchsia-400 group-hover:scale-110 transition-transform">
                <Film className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Veo Concept Video</p>
                <p className="text-[10px] text-gray-400">Diagram animation</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-colors text-left group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 group-hover:scale-110 transition-transform">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Knowledge Gaps</p>
                <p className="text-[10px] text-gray-400">Weakness heatmap</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
