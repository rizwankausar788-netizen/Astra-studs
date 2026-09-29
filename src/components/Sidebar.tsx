import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CalendarClock,
  MessageSquareCode,
  CheckCircle2,
  Layers,
  FileCheck2,
  Film,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'plan', label: 'Study Plan', icon: CalendarClock, badge: 'Live' },
  { id: 'tutor', label: 'AI Tutor Chat', icon: MessageSquareCode, badge: 'A+' },
  { id: 'quiz', label: 'Quiz Mode', icon: CheckCircle2, badge: null },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, badge: 'Spaced' },
  { id: 'mock-exam', label: 'Mock Exam', icon: FileCheck2, badge: 'Timed' },
  { id: 'concept-video', label: 'Concept Video', icon: Film, badge: 'Veo' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, badge: null },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, preferences, studyPlan } = useApp();

  const completedCount = studyPlan.dailyTasks.filter((t) => t.completed).length;
  const totalCount = studyPlan.dailyTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-[#0A0A0F]/90 backdrop-blur-2xl p-4 shrink-0 min-h-[calc(100vh-4rem)] justify-between">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-sm shadow-blue-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      item.badge === 'Veo'
                        ? 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/40 animate-pulse'
                        : isActive
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Subjects Quick List */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Active Subjects
            </p>
            <span className="text-[10px] text-blue-400 font-mono">
              {preferences.subjects.length} active
            </span>
          </div>
          <div className="space-y-1">
            {preferences.subjects.map((sub) => (
              <div
                key={sub}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-gray-300 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span className="truncate max-w-[120px]">{sub}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {sub === 'Maths' ? '88%' : sub === 'Physics' ? '74%' : '82%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Progress Card */}
      <div className="mt-6 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Prep Mastery
          </span>
          <span className="font-bold text-blue-400 font-mono">{progressPercent}%</span>
        </div>

        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-[11px] text-gray-400">
          {completedCount} of {totalCount} core syllabus milestones completed.
        </p>

        <button
          onClick={() => setActiveTab('plan')}
          className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 pt-1 border-t border-white/5 cursor-pointer"
        >
          <span>View Day Schedule</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </aside>
  );
};
