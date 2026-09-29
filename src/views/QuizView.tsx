import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MathRenderer } from '../components/MathRenderer';
import { QuizQuestion } from '../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Flame,
  Award,
  ChevronRight,
  Sliders,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const QuizView: React.FC = () => {
  const {
    quizQuestions,
    setQuizQuestions,
    recordQuizScore,
    triggerConfetti,
    preferences,
    showToast,
    setActiveTab,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  // Custom AI Quiz Generator modal state
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [genSubject, setGenSubject] = useState(preferences.subjects[0] || 'Maths');
  const [genTopic, setGenTopic] = useState('Differential Calculus & Optimization');
  const [genDifficulty, setGenDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentQuestion = quizQuestions[currentIndex];

  // Timer per question (60 seconds)
  useEffect(() => {
    if (quizFinished || isAnswerSubmitted) return;

    if (secondsLeft <= 0) {
      // Time is up, auto submit with no selection
      setIsAnswerSubmitted(true);
      showToast('Time expired for this question!', 'info');
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isAnswerSubmitted, quizFinished, showToast]);

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      triggerConfetti();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setSecondsLeft(60);
    } else {
      // Complete quiz
      setQuizFinished(true);
      const finalScore = score + (selectedOption === currentQuestion.correctIndex ? 1 : 0);
      const finalPercentage = Math.round((finalScore / quizQuestions.length) * 100);
      recordQuizScore(currentQuestion.subject, currentQuestion.topic, finalPercentage);
      triggerConfetti();
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setSecondsLeft(60);
  };

  const handleGenerateCustomQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    showToast(`Generating ${genDifficulty} quiz on ${genTopic}...`, 'info');

    try {
      const res = await fetch('/api/gemini/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: genSubject,
          topic: genTopic,
          difficulty: genDifficulty,
          count: 5,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions);
        handleRestartQuiz();
        setIsGenModalOpen(false);
        showToast(`Loaded ${data.questions.length} new exam questions!`, 'success');
      } else {
        throw new Error('No questions returned');
      }
    } catch {
      showToast('Loaded standard syllabus diagnostic quiz.', 'info');
      handleRestartQuiz();
      setIsGenModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
        <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No active quiz questions found</h2>
        <button
          onClick={handleRestartQuiz}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Reset Default Quiz
        </button>
      </div>
    );
  }

  // Quiz Finished Summary View
  if (quizFinished) {
    const finalScore = score;
    const percentage = Math.round((finalScore / quizQuestions.length) * 100);
    const passed = percentage >= 75;

    return (
      <div className="max-w-2xl mx-auto rounded-3xl bg-gradient-to-b from-[#141424] to-[#0A0A0F] border border-white/15 p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
        <div className="inline-flex p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Award className="h-12 w-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
            Quiz Completed
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            {passed ? 'Outstanding Performance!' : 'Good Effort! Review Needed.'}
          </h2>
          <p className="text-sm text-gray-300">
            You scored <span className="font-bold text-white">{finalScore}</span> out of{' '}
            <span className="font-bold text-white">{quizQuestions.length}</span> questions.
          </p>
        </div>

        {/* Score Ring / Pill */}
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center min-w-[140px]">
            <span className="text-4xl font-extrabold font-mono text-blue-400 block">
              {percentage}%
            </span>
            <span className="text-[11px] text-gray-400 uppercase font-semibold">Mastery</span>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center min-w-[140px]">
            <span className="text-4xl font-extrabold font-mono text-emerald-400 block">
              +{finalScore * 20}
            </span>
            <span className="text-[11px] text-gray-400 uppercase font-semibold">XP Gained</span>
          </div>
        </div>

        <p className="text-xs text-indigo-300 max-w-md mx-auto leading-relaxed">
          {percentage >= 90
            ? `Fantastic! You're on track for an ${preferences.targetGrade} in this topic.`
            : 'We recommend reviewing the step-by-step explanations and asking the AI Tutor to clarify steps.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={handleRestartQuiz}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={() => setIsGenModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate New AI Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('tutor')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
          >
            <span>Review with AI Tutor</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Quiz Header: Progress & Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 font-mono">
            {currentQuestion.subject} • {currentQuestion.topic}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            Question {currentIndex + 1} of {quizQuestions.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Question Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
              secondsLeft <= 10
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                : 'bg-white/5 border-white/10 text-gray-300'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{secondsLeft}s left</span>
          </div>

          {/* AI Generator trigger button */}
          <button
            onClick={() => setIsGenModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Custom Topic</span>
          </button>
        </div>

        {/* Progress Bar across questions */}
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#141424] to-[#0D0D17] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span className="uppercase tracking-wider">Difficulty: {currentQuestion.difficulty}</span>
            <span>Score: {score} Correct</span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            <MathRenderer content={currentQuestion.question} />
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let buttonStyle = 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-gray-200';
            if (isAnswerSubmitted) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-md shadow-emerald-500/10';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-200 shadow-md shadow-rose-500/10';
              } else {
                buttonStyle = 'bg-white/[0.01] border-white/5 opacity-50 text-gray-400';
              }
            } else if (isSelected) {
              buttonStyle = 'bg-blue-600/20 border-blue-500/60 text-white shadow-md shadow-blue-500/10';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswerSubmitted}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${buttonStyle}`}
              >
                <div className="flex items-center gap-3.5 flex-1 pr-3">
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

                {isAnswerSubmitted && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="h-5 w-5 text-rose-400" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Step-by-Step Explanation Drawer (Shown after answer submission) */}
        {isAnswerSubmitted && (
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Detailed Solution & Derivation
              </span>
            </div>

            <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              <MathRenderer content={currentQuestion.explanation} />
            </div>

            {currentQuestion.stepByStep && currentQuestion.stepByStep.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Step-by-Step Breakdown:
                </span>
                <div className="space-y-1.5">
                  {currentQuestion.stepByStep.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs text-gray-300 font-mono"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-xs text-gray-400 font-mono">
            {isAnswerSubmitted ? (
              selectedOption === currentQuestion.correctIndex ? (
                <span className="text-emerald-400 font-bold">✓ Correct Answer!</span>
              ) : (
                <span className="text-rose-400 font-bold">✕ Incorrect. Study explanation above.</span>
              )
            ) : (
              <span>Select the best answer and click Submit</span>
            )}
          </div>

          {!isAnswerSubmitted ? (
            <button
              onClick={handleConfirmAnswer}
              disabled={selectedOption === null}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 disabled:opacity-40 cursor-pointer"
            >
              <span>Submit Answer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 cursor-pointer"
            >
              <span>{currentIndex + 1 === quizQuestions.length ? 'Finish Quiz' : 'Next Question'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Custom Quiz Generator Modal */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#12121E] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Generate AI Quiz</h3>
              </div>
              <button
                onClick={() => setIsGenModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleGenerateCustomQuiz} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Subject</label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  className="w-full bg-[#181828] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  {preferences.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Target Topic or Chapter</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="E.g. Le Chatelier's Principle, Projectile Motion..."
                  className="w-full bg-[#181828] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Difficulty Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setGenDifficulty(d)}
                      className={`p-2 rounded-xl capitalize font-semibold border transition-all ${
                        genDifficulty === d
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-white/5 text-gray-400 border-white/5'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsGenModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isGenerating ? 'Generating Quiz...' : 'Create Quiz'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
