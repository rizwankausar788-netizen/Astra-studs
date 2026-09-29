import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { topicMastery, timeSpent, scoreTrends, preferences, setActiveTab } = useApp();

  const knowledgeGaps = topicMastery.filter((t) => t.isKnowledgeGap || t.masteryPercentage < 70);
  const masteredTopics = topicMastery.filter((t) => t.masteryPercentage >= 85);

  const maxHours = Math.max(...timeSpent.map((t) => t.hours), 15);
  const maxScore = 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Exam Readiness Diagnostic
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Target: {preferences.targetGrade}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Progress & Knowledge Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Real-time mastery tracking across topics, study hours distribution, score trend history, and high-priority revision targets.
          </p>
        </div>
      </div>

      {/* Top 3 Quick Diagnostic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Detected Knowledge Gaps
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-rose-400">
              {knowledgeGaps.length}
            </span>
            <span className="text-xs text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              High Priority
            </span>
          </div>
          <p className="text-xs text-gray-400">Topics below 70% retention threshold</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Mastered A+ Topics
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-emerald-400">
              {masteredTopics.length}
            </span>
            <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              &gt; 85% Exam Ready
            </span>
          </div>
          <p className="text-xs text-gray-400">Solid recall with high confidence</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Total Study Hours
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-blue-400">
              {timeSpent.reduce((a, b) => a + b.hours, 0).toFixed(1)}h
            </span>
            <span className="text-xs text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              Across 4 Subjects
            </span>
          </div>
          <p className="text-xs text-gray-400">Calibrated for {preferences.dailyGoalHours}h daily goal</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 cols: Time Spent per Subject (SVG Bar Chart) */}
        <div className="lg:col-span-6 rounded-3xl bg-white/[0.02] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Time Spent Per Subject (Hours)
              </h2>
            </div>
            <span className="text-xs text-gray-400 font-mono">This Month</span>
          </div>

          <div className="space-y-4 pt-2">
            {timeSpent.map((item) => {
              const widthPct = Math.round((item.hours / maxHours) * 100);
              return (
                <div key={item.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.subject}</span>
                    <span className="font-mono text-gray-300">{item.hours} hours</span>
                  </div>
                  <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 6 cols: Quiz Score Trends (SVG Trend Chart) */}
        <div className="lg:col-span-6 rounded-3xl bg-white/[0.02] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Quiz Score Trajectory (%)
              </h2>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-semibold">+24% Net Gain</span>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="h-44 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

              {/* Area */}
              <polygon
                points="0,85 80,75 160,65 240,55 320,40 400,25 400,120 0,120"
                fill="url(#scoreAreaGradient)"
              />

              {/* Line */}
              <polyline
                points="0,85 80,75 160,65 240,55 320,40 400,25"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {[
                { x: 0, y: 85, label: '68%' },
                { x: 80, y: 75, label: '74%' },
                { x: 160, y: 65, label: '79%' },
                { x: 240, y: 55, label: '84%' },
                { x: 320, y: 40, label: '89%' },
                { x: 400, y: 25, label: '92%' },
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#3B82F6" stroke="#0A0A0F" strokeWidth="2" />
                  <text
                    x={pt.x}
                    y={pt.y - 9}
                    textAnchor="middle"
                    fill="#93C5FD"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-gray-400 font-mono border-t border-white/5 pt-2">
            <span>Diagnostic</span>
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Current (A+ Track)</span>
          </div>
        </div>
      </div>

      {/* KNOWLEDGE GAPS & TOPIC MASTERY HEATMAP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Topic Mastery Heatmap & Knowledge Gaps
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Click any gap to launch targeted AI review
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topicMastery.map((item, idx) => {
            const isGap = item.isKnowledgeGap || item.masteryPercentage < 70;
            return (
              <div
                key={idx}
                className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition-all ${
                  isGap
                    ? 'bg-rose-950/15 border-rose-500/30 hover:border-rose-500/60 shadow-lg shadow-rose-950/20'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono">
                      {item.subject}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white pt-1">{item.topic}</h3>
                  </div>

                  <span
                    className={`font-mono font-extrabold text-lg ${
                      isGap ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {item.masteryPercentage}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isGap
                          ? 'bg-rose-500'
                          : item.masteryPercentage >= 85
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.masteryPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">{item.quizzesTaken} sessions taken</span>
                    {isGap ? (
                      <button
                        onClick={() => setActiveTab('tutor')}
                        className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Fix Gap</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Mastered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
