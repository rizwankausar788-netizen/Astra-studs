import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MathRenderer } from '../components/MathRenderer';
import { MockExam } from '../types';
import {
  FileCheck2,
  Clock,
  Flag,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Award,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';

export const MockExamView: React.FC = () => {
  const { mockExams, saveMockExamResult, setActiveTab, showToast, triggerConfetti } = useApp();

  const currentMock = mockExams[0];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60); // 45 minutes
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);

  // Countdown timer for exam hall simulation
  useEffect(() => {
    if (isSubmitted || isPaused) return;

    if (timeLeftSeconds <= 0) {
      handleFinalSubmit();
      showToast('Exam time expired! Auto-submitted.', 'info');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds, isPaused, isSubmitted]);

  if (!currentMock || !currentMock.questions || currentMock.questions.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
        <p className="text-white font-semibold">No mock exam available.</p>
      </div>
    );
  }

  const currentQuestion = currentMock.questions[currentIndex];

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIdx }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleFinalSubmit = () => {
    setIsSubmitted(true);
    setIsConfirmSubmitOpen(false);

    // Calculate score
    let correctCount = 0;
    currentMock.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / currentMock.questions.length) * 100);

    const completedExam: MockExam = {
      ...currentMock,
      userAnswers,
      flaggedQuestionIds: flaggedIds,
      score: scorePercentage,
      completedAt: new Date().toISOString(),
    };

    saveMockExamResult(completedExam);
    triggerConfetti();
    showToast(`Mock exam submitted! Final score: ${scorePercentage}%`, 'success');
  };

  const answeredCount = Object.keys(userAnswers).length;
  const totalCount = currentMock.questions.length;

  // Post-exam result review view
  if (isSubmitted) {
    let correctCount = 0;
    currentMock.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) correctCount += 1;
    });
    const percentage = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Score Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-violet-900/40 border border-blue-500/30 p-8 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 text-blue-400 mb-2">
            <Award className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Mock Exam Simulation Results</h2>
          <p className="text-sm text-gray-300">
            {currentMock.title} • Completed under closed-book simulated conditions
          </p>

          <div className="flex items-center justify-center gap-8 py-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 min-w-[130px]">
              <span className="text-4xl font-extrabold font-mono text-blue-400 block">
                {percentage}%
              </span>
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Score</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 min-w-[130px]">
              <span className="text-4xl font-extrabold font-mono text-emerald-400 block">
                {correctCount}/{totalCount}
              </span>
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Correct</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 min-w-[130px]">
              <span className="text-4xl font-extrabold font-mono text-purple-400 block">
                {formatTimer(45 * 60 - timeLeftSeconds)}
              </span>
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Time Spent</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setUserAnswers({});
                setFlaggedIds([]);
                setTimeLeftSeconds(45 * 60);
                setCurrentIndex(0);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retake Exam</span>
            </button>
            <button
              onClick={() => setActiveTab('tutor')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-bold text-white shadow-lg cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Review Missed Concepts with AI</span>
            </button>
          </div>
        </div>

        {/* Question-by-Question Detailed Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Full Exam Question Breakdown</h3>
          <div className="space-y-4">
            {currentMock.questions.map((q, idx) => {
              const selected = userAnswers[q.id];
              const isCorrect = selected === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-950/10 border-emerald-500/20'
                      : 'bg-rose-950/10 border-rose-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold font-mono text-gray-300">
                      Question {idx + 1} • {q.subject}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isCorrect ? 'Correct (+1 mark)' : 'Incorrect (0 marks)'}
                    </span>
                  </div>

                  <div className="py-3 text-sm font-semibold text-white">
                    <MathRenderer content={q.question} />
                  </div>

                  <div className="space-y-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const wasSelected = selected === oIdx;
                      const isTargetCorrect = oIdx === q.correctIndex;
                      let badge = '';
                      if (isTargetCorrect) badge = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200';
                      else if (wasSelected && !isTargetCorrect) badge = 'bg-rose-500/20 border-rose-500/50 text-rose-200';
                      else badge = 'bg-white/[0.02] border-white/5 text-gray-400';

                      return (
                        <div key={oIdx} className={`p-3 rounded-xl border flex items-center justify-between ${badge}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                            <MathRenderer content={opt} />
                          </div>
                          {isTargetCorrect && <span className="text-[10px] font-bold uppercase">Correct Answer</span>}
                          {wasSelected && !isTargetCorrect && <span className="text-[10px] font-bold uppercase">Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-gray-300 space-y-2">
                    <span className="font-bold text-indigo-300 block">Explanation:</span>
                    <MathRenderer content={q.explanation} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Exam Hall View
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
      {/* Left 8 cols: Active Question Canvas */}
      <div className="lg:col-span-8 space-y-6">
        {/* Top Timer & Header */}
        <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Exam Mode Active
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {currentMock.title}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Closed-book simulation • Question {currentIndex + 1} of {totalCount}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>

            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono font-extrabold text-sm border ${
                timeLeftSeconds < 300
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-white/5 border-white/10 text-white'
              }`}
            >
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Question Canvas Card */}
        <div className="rounded-3xl bg-gradient-to-b from-[#141424] to-[#0D0D17] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
            <span className="font-mono font-bold text-blue-400">
              {currentQuestion.subject} • {currentQuestion.topic}
            </span>

            <button
              onClick={() => toggleFlag(currentQuestion.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                flaggedIds.includes(currentQuestion.id)
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              <span>{flaggedIds.includes(currentQuestion.id) ? 'Flagged for Review' : 'Flag Question'}</span>
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            <MathRenderer content={currentQuestion.question} />
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = userAnswers[currentQuestion.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06] text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-gray-300 border border-white/10'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="text-xs sm:text-sm font-medium">
                      <MathRenderer content={opt} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 disabled:opacity-30 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous Question</span>
            </button>

            {currentIndex + 1 < totalCount ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsConfirmSubmitOpen(true)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit Exam</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right 4 cols: Question Navigation Matrix & Status */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Question Matrix</h3>
            <span className="text-xs text-gray-400 font-mono">
              {answeredCount}/{totalCount} Answered
            </span>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-5 gap-2">
            {currentMock.questions.map((q, idx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isFlagged = flaggedIds.includes(q.id);
              const isCurrent = currentIndex === idx;

              let style = 'bg-white/5 text-gray-400 border-white/10';
              if (isCurrent) style = 'ring-2 ring-blue-500 bg-blue-600 text-white font-bold';
              else if (isFlagged) style = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
              else if (isAnswered) style = 'bg-blue-900/40 text-blue-300 border-blue-500/40 font-semibold';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl border flex items-center justify-center text-xs font-mono transition-all cursor-pointer ${style}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-900/40 border border-blue-500/40" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-amber-500/20 border border-amber-500/40" />
              <span>Flagged for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-white/5 border border-white/10" />
              <span>Unanswered</span>
            </div>
          </div>

          <button
            onClick={() => setIsConfirmSubmitOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Finish & Submit Exam</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#12121E] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
              <h3 className="text-base font-bold text-white">Submit Mock Exam?</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              You have answered <span className="font-bold text-white">{answeredCount}</span> out of{' '}
              <span className="font-bold text-white">{totalCount}</span> questions.
              {totalCount - answeredCount > 0 && (
                <span className="text-amber-400 block mt-1">
                  Warning: You have {totalCount - answeredCount} unanswered questions remaining.
                </span>
              )}
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white"
              >
                Return to Exam
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs cursor-pointer"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
