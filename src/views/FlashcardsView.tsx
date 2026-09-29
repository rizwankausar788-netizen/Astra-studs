import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MathRenderer } from '../components/MathRenderer';
import { Flashcard } from '../types';
import {
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  Plus,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const {
    flashcards,
    updateFlashcardReview,
    addFlashcards,
    preferences,
    showToast,
    triggerConfetti,
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // AI Deck generator modal
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [genSubject, setGenSubject] = useState(preferences.subjects[0] || 'Maths');
  const [genTopic, setGenTopic] = useState('Core Theorems & Derivations');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredCards = flashcards.filter(
    (card) => selectedSubject === 'all' || card.subject === selectedSubject
  );

  const currentCard = filteredCards[currentIndex];

  const masteredCount = filteredCards.filter((c) => c.repetitionStage === 'mastered').length;
  const learningCount = filteredCards.filter((c) => c.repetitionStage !== 'mastered').length;

  // Keyboard navigation: Space to flip, 1-4 for ratings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGenModalOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRate('again');
        else if (e.key === '2') handleRate('hard');
        else if (e.key === '3') handleRate('good');
        else if (e.key === '4') handleRate('easy');
      } else {
        if (e.key === 'ArrowRight') handleNext();
        else if (e.key === 'ArrowLeft') handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, isGenModalOpen, filteredCards]);

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    updateFlashcardReview(currentCard.id, rating);
    if (rating === 'easy') triggerConfetti();

    // Advance to next card
    setIsFlipped(false);
    if (currentIndex + 1 < filteredCards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
      showToast('Deck cycle completed! Spaced intervals updated.', 'success');
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    showToast(`Generating flashcards on ${genTopic}...`, 'info');

    try {
      const res = await fetch('/api/gemini/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: genSubject,
          topic: genTopic,
          count: 6,
        }),
      });

      const data = await res.json();
      if (data.flashcards && data.flashcards.length > 0) {
        const mapped: Flashcard[] = data.flashcards.map((f: any) => ({
          ...f,
          repetitionStage: 'new',
          intervalDays: 1,
        }));
        addFlashcards(mapped);
        setIsGenModalOpen(false);
        setCurrentIndex(0);
        setIsFlipped(false);
        showToast(`Added ${mapped.length} new flashcards!`, 'success');
      } else {
        throw new Error('No flashcards returned');
      }
    } catch {
      showToast('Using curated subject deck.', 'info');
      setIsGenModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header & Subject Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Spaced Repetition
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {masteredCount} Mastered • {learningCount} In Review
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Active Recall Flashcards
          </h1>
        </div>

        <button
          onClick={() => setIsGenModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Generate AI Deck</span>
        </button>
      </div>

      {/* Subject Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setSelectedSubject('all');
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            selectedSubject === 'all'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          All Subjects ({flashcards.length})
        </button>
        {preferences.subjects.map((sub) => {
          const count = flashcards.filter((c) => c.subject === sub).length;
          return (
            <button
              key={sub}
              onClick={() => {
                setSelectedSubject(sub);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedSubject === sub
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {sub} ({count})
            </button>
          );
        })}
      </div>

      {/* Progress & Card Index Tracker */}
      <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
        <span>
          Card {currentIndex + 1} of {filteredCards.length}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-semibold">{masteredCount} Mastered</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">{learningCount} Due</span>
        </div>
      </div>

      {/* 3D Interactive Flip Card */}
      {currentCard ? (
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative min-h-[340px] sm:min-h-[380px] w-full cursor-pointer select-none [perspective:1000px]"
        >
          <div
            className={`relative h-full w-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            }`}
          >
            {/* FRONT OF CARD */}
            <div className="absolute inset-0 flex flex-col justify-between p-7 rounded-3xl bg-gradient-to-b from-[#161628] to-[#0E0E1B] border border-white/15 shadow-2xl [backface-visibility:hidden]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold px-2.5 py-1 rounded-xl bg-violet-500/20 text-violet-300">
                  {currentCard.subject} • {currentCard.topic}
                </span>
                <span className="text-[11px] text-gray-400 uppercase font-mono">
                  Stage: {currentCard.repetitionStage}
                </span>
              </div>

              <div className="my-auto py-4 text-center space-y-3">
                <span className="text-[11px] uppercase tracking-widest text-indigo-400 font-bold block">
                  Question / Concept Prompt
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white max-w-xl mx-auto leading-relaxed">
                  <MathRenderer content={currentCard.front} />
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-3 border-t border-white/10">
                <span>Click card or press [Space] to flip</span>
                <span className="flex items-center gap-1 text-violet-400 font-medium">
                  <RotateCw className="h-3 w-3" /> Flip for Answer
                </span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="absolute inset-0 flex flex-col justify-between p-7 rounded-3xl bg-gradient-to-b from-[#1C1635] via-[#141224] to-[#0A0A0F] border border-violet-500/30 shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold px-2.5 py-1 rounded-xl bg-violet-500/20 text-violet-300">
                  Solution & Derivation
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  Interval: {currentCard.intervalDays}d
                </span>
              </div>

              <div className="my-auto py-2 text-left space-y-3 overflow-y-auto max-h-[220px]">
                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  <MathRenderer content={currentCard.back} />
                </div>

                {currentCard.keyTakeaway && (
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-violet-500/20 text-xs text-indigo-300 font-mono flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Key Takeaway: {currentCard.keyTakeaway}</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-gray-400 pt-2 border-t border-white/10 text-center font-mono">
                Rate your recall below to schedule next review
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
          <p className="text-white font-semibold">No flashcards found for this filter.</p>
        </div>
      )}

      {/* Spaced Repetition Rating Buttons (Visible when flipped) */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2.5 pt-2 animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={() => handleRate('again')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all cursor-pointer"
          >
            <span className="text-xs font-bold">Again [1]</span>
            <span className="text-[10px] text-rose-400 font-mono">&lt; 1 day</span>
          </button>

          <button
            onClick={() => handleRate('hard')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all cursor-pointer"
          >
            <span className="text-xs font-bold">Hard [2]</span>
            <span className="text-[10px] text-amber-400 font-mono">+1.2x</span>
          </button>

          <button
            onClick={() => handleRate('good')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 transition-all cursor-pointer"
          >
            <span className="text-xs font-bold">Good [3]</span>
            <span className="text-[10px] text-blue-400 font-mono">+1.8x</span>
          </button>

          <button
            onClick={() => handleRate('easy')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all cursor-pointer"
          >
            <span className="text-xs font-bold">Easy [4]</span>
            <span className="text-[10px] text-emerald-400 font-mono">+2.5x</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => setIsFlipped(true)}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-xs font-bold text-white shadow-lg cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Show Answer</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Generate AI Deck Modal */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#12121E] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                <h3 className="text-base font-bold text-white">Generate Flashcard Deck</h3>
              </div>
              <button
                onClick={() => setIsGenModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleGenerateDeck} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Subject</label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  className="w-full bg-[#181828] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-violet-500"
                >
                  {preferences.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Topic / Formula Group</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="E.g. Electromagnetic Induction, Organic Mechanisms..."
                  className="w-full bg-[#181828] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-violet-500"
                />
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
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isGenerating ? 'Generating Deck...' : 'Create Flashcards'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
