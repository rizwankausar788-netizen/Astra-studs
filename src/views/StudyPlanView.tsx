import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DailyTask } from '../types';
import {
  CalendarClock,
  Sparkles,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Sliders,
  Filter,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  Layers,
  Headphones,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

export const StudyPlanView: React.FC = () => {
  const {
    studyPlan,
    preferences,
    toggleTaskCompletion,
    regeneratePlan,
    isGeneratingPlan,
    setActiveTab,
  } = useApp();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<string>('all');
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});
  const [adjustPrompt, setAdjustPrompt] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Group daily tasks by dayLabel
  const groupedTasks: Record<string, DailyTask[]> = {};
  studyPlan.dailyTasks.forEach((task) => {
    if (!groupedTasks[task.dayLabel]) {
      groupedTasks[task.dayLabel] = [];
    }
    groupedTasks[task.dayLabel].push(task);
  });

  const toggleDayCollapse = (dayLabel: string) => {
    setCollapsedDays((prev) => ({ ...prev, [dayLabel]: !prev[dayLabel] }));
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await regeneratePlan(adjustPrompt);
    setIsAdjustModalOpen(false);
    setAdjustPrompt('');
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Lesson':
        return <BookOpen className="h-3.5 w-3.5 text-blue-400" />;
      case 'Quiz':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      case 'Flashcards':
        return <Layers className="h-3.5 w-3.5 text-violet-400" />;
      case 'Podcast':
        return <Headphones className="h-3.5 w-3.5 text-amber-400" />;
      case 'Mock Test':
        return <FileCheck2 className="h-3.5 w-3.5 text-rose-400" />;
      default:
        return <BookOpen className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Personalized Syllabus
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Target: {preferences.targetGrade}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Study Plan Timeline
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
            {studyPlan.summary}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5 text-indigo-400" />
            <span>Adjust Plan</span>
          </button>

          <button
            onClick={() => regeneratePlan()}
            disabled={isGeneratingPlan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
            <span>{isGeneratingPlan ? 'Rebalancing...' : 'AI Re-balance'}</span>
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-gray-400 font-medium">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              selectedSubjectFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            All Subjects
          </button>
          {preferences.subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubjectFilter(sub)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedSubjectFilter === sub
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Format Filter Pills */}
        <div className="hidden sm:flex items-center gap-1.5 ml-auto border-l border-white/10 pl-3">
          {['all', 'Lesson', 'Quiz', 'Flashcards', 'Mock Test'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormatFilter(fmt)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedFormatFilter === fmt
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {fmt === 'all' ? 'All Formats' : fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Timeline with Day Cards */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([dayLabel, tasks], dayIndex) => {
          const isCollapsed = collapsedDays[dayLabel];
          const filteredTasks = tasks.filter((t) => {
            const matchesSub = selectedSubjectFilter === 'all' || t.subject === selectedSubjectFilter;
            const matchesFmt = selectedFormatFilter === 'all' || t.format === selectedFormatFilter;
            return matchesSub && matchesFmt;
          });

          if (filteredTasks.length === 0) return null;

          const completedCount = filteredTasks.filter((t) => t.completed).length;
          const totalDayMinutes = filteredTasks.reduce((acc, curr) => acc + curr.durationMin, 0);

          return (
            <div
              key={dayLabel}
              className="rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-lg"
            >
              {/* Day Header Accordion */}
              <div
                onClick={() => toggleDayCollapse(dayLabel)}
                className="flex items-center justify-between p-4 sm:p-5 bg-white/[0.03] hover:bg-white/[0.05] transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      dayIndex === 0
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                        : 'bg-white/5 text-gray-300 border border-white/10'
                    }`}
                  >
                    D{dayIndex + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm sm:text-base">{dayLabel}</span>
                      {dayIndex === 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-mono">
                      {filteredTasks.length} tasks • ~{totalDayMinutes} mins total
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                    <span className={completedCount === filteredTasks.length ? 'text-emerald-400' : 'text-blue-400'}>
                      {completedCount}/{filteredTasks.length} Complete
                    </span>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Task Items inside Day Card */}
              {!isCollapsed && (
                <div className="divide-y divide-white/5 p-2 sm:p-4 space-y-2">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl gap-3 transition-all ${
                        task.completed
                          ? 'bg-white/[0.01] opacity-65'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1">
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
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-mono">
                              {task.subject}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono">
                              {getFormatIcon(task.format)}
                              <span>{task.format}</span>
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                              <Clock className="h-3 w-3" />
                              <span>{task.durationMin} mins</span>
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
                            <p className="text-xs text-indigo-300/90 font-mono leading-relaxed pt-0.5">
                              💡 {task.highYieldTip}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Trigger */}
                      <button
                        onClick={() => {
                          if (task.format === 'Quiz') setActiveTab('quiz');
                          else if (task.format === 'Flashcards') setActiveTab('flashcards');
                          else if (task.format === 'Mock Test') setActiveTab('mock-exam');
                          else setActiveTab('tutor');
                        }}
                        className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
                      >
                        <span>Start Session</span>
                        <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Adjust Plan Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#12121D] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Adjust AI Study Plan</h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Tell Astra how you would like to adjust your study workload. For example: "I have less time this Friday", "Allocate more focus to Organic Chemistry reactions", or "Add more practice quizzes instead of reading".
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <textarea
                rows={4}
                value={adjustPrompt}
                onChange={(e) => setAdjustPrompt(e.target.value)}
                placeholder="E.g., I'm struggling with Calculus integration by parts, please double the practice questions for that topic..."
                className="w-full bg-[#090911] border border-white/15 rounded-2xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
              />

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingPlan}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg hover:brightness-110 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Update Plan with AI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
