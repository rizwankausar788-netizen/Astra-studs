import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AVAILABLE_SUBJECTS } from '../data/initialData';
import { TargetGrade, LearningStyle, UploadedMaterial } from '../types';
import {
  Calendar,
  GraduationCap,
  UploadCloud,
  FileText,
  Image,
  BookOpen,
  Sparkles,
  Eye,
  Headphones,
  FileEdit,
  Activity,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    preferences,
    updatePreferences,
    materials,
    addMaterial,
    removeMaterial,
    regeneratePlan,
    isGeneratingPlan,
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Local form state initialized from preferences
  const [examDate, setExamDate] = useState(preferences.examDate);
  const [targetGrade, setTargetGrade] = useState<TargetGrade>(preferences.targetGrade);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(preferences.subjects);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(preferences.learningStyle);
  const [dailyHours, setDailyHours] = useState<number>(preferences.dailyGoalHours);

  // File upload drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadNote, setUploadNote] = useState('');

  if (!isOnboardingOpen) return null;

  // Calculate days difference
  const daysDiff = Math.max(
    1,
    Math.round((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  const toggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== subId));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/');
      const newMat: UploadedMaterial = {
        id: `mat-${Date.now()}-${i}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: isImg ? 'image' : 'pdf',
        uploadDate: 'Just now',
        topicsDetected: [
          'Core Syllabus Concepts',
          'Exam High-Yield Formulas',
          'Past Question Review',
        ],
        snippet: `Uploaded ${file.name} successfully parsed for study plan context.`,
      };
      addMaterial(newMat);
    }
  };

  const handleAddNote = () => {
    if (!uploadNote.trim()) return;
    const newMat: UploadedMaterial = {
      id: `note-${Date.now()}`,
      name: `Study Note: ${uploadNote.slice(0, 24)}...`,
      size: '12 KB',
      type: 'note',
      uploadDate: 'Just now',
      topicsDetected: ['Custom User Note', 'Syllabus Focus', 'High-Priority Drill'],
      snippet: uploadNote,
    };
    addMaterial(newMat);
    setUploadNote('');
  };

  const handleFinish = async () => {
    updatePreferences({
      examDate,
      targetGrade,
      subjects: selectedSubjects,
      learningStyle,
      dailyGoalHours: dailyHours,
      onboardingCompleted: true,
    });

    await regeneratePlan();
    setIsOnboardingOpen(false);
  };

  const GRADE_OPTIONS: { grade: TargetGrade; label: string; desc: string; color: string }[] = [
    { grade: 'A+', label: 'A+ (95-100%)', desc: 'Elite Mastery: Perfect past-paper recall, edge cases & deep synthesis', color: 'from-blue-500 to-indigo-600' },
    { grade: 'A', label: 'A (85-94%)', desc: 'Comprehensive understanding with strong time-management & speed', color: 'from-indigo-500 to-violet-600' },
    { grade: 'B+', label: 'B+ (75-84%)', desc: 'High-frequency exam questions and core theorem derivations', color: 'from-violet-500 to-purple-600' },
    { grade: 'B', label: 'B (65-74%)', desc: 'Fundamental concepts, standard problem archetypes & formula memory', color: 'from-emerald-500 to-teal-600' },
    { grade: 'C', label: 'C (50-64%)', desc: 'Rapid catch-up on must-pass syllabus topics and key formulas', color: 'from-amber-500 to-orange-600' },
  ];

  const LEARNING_STYLES: { id: LearningStyle; title: string; desc: string; icon: any }[] = [
    {
      id: 'visual',
      title: 'Visual Learner',
      desc: 'Diagrams, mind maps, video animations, and color-coded equations.',
      icon: Eye,
    },
    {
      id: 'auditory',
      title: 'Auditory Learner',
      desc: 'Spoken AI tutor explanations, audio summaries, and vocal recall.',
      icon: Headphones,
    },
    {
      id: 'reading/writing',
      title: 'Reading & Writing',
      desc: 'Dense study guides, step-by-step written derivations, and structured summaries.',
      icon: FileEdit,
    },
    {
      id: 'kinesthetic',
      title: 'Kinesthetic (Active)',
      desc: 'Interactive quizzes, flashcards, timed mock test simulations, and problem drills.',
      icon: Activity,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0E0E17] border border-white/15 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header & Progress */}
        <div className="space-y-4 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Customize Your Exam Preparation Plan
                </h2>
                <p className="text-xs text-gray-400">
                  Step {currentStep} of {totalSteps}:{' '}
                  {currentStep === 1
                    ? 'Target Exam Date'
                    : currentStep === 2
                    ? 'Target Grade & Ambition'
                    : currentStep === 3
                    ? 'Study Materials'
                    : currentStep === 4
                    ? 'Selected Subjects'
                    : 'Learning Preferences'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOnboardingOpen(false)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="py-6 overflow-y-auto space-y-6 flex-1 pr-1">
          {/* STEP 1: Exam Date */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">When is your exam date?</h3>
                <p className="text-xs text-gray-400">
                  Astra will construct an inverted milestone timetable counting down to exam day.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <label className="block text-xs font-semibold text-gray-300">
                  Select Exam Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Countdown banner */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-violet-900/30 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-blue-400" />
                    <div>
                      <span className="text-xs text-gray-300 font-medium">Time Remaining:</span>
                      <p className="text-lg font-bold text-white font-mono">
                        {daysDiff} Days Until Exam
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {daysDiff > 30 ? 'Comprehensive Pace' : daysDiff > 14 ? 'Accelerated Sprint' : 'High-Yield Blitz'}
                  </span>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Daily Study Target: <span className="text-blue-400 font-mono">{dailyHours} Hours/Day</span>
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
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>1h (Light)</span>
                    <span>3.5h (Recommended)</span>
                    <span>8h (Intensive)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Target Grade */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">What is your target grade?</h3>
                <p className="text-xs text-gray-400">
                  Higher targets allocate more time to multi-concept synthesis and edge-case question drills.
                </p>
              </div>

              <div className="space-y-2.5">
                {GRADE_OPTIONS.map((opt) => {
                  const isSelected = targetGrade === opt.grade;
                  return (
                    <button
                      key={opt.grade}
                      onClick={() => setTargetGrade(opt.grade)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500/60 shadow-lg shadow-blue-500/10'
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-base font-mono ${
                            isSelected
                              ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                              : 'bg-white/5 text-gray-300 border border-white/10'
                          }`}
                        >
                          {opt.grade}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{opt.label}</p>
                          <p className="text-xs text-gray-400">{opt.desc}</p>
                        </div>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Upload Study Materials */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Upload Your Study Materials</h3>
                <p className="text-xs text-gray-400">
                  Drop lecture slides, syllabus PDFs, handwritten notes, or past papers for AI topic extraction.
                </p>
              </div>

              {/* Drag and drop zone */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) {
                    const fakeEvent = {
                      target: { files: e.dataTransfer.files },
                    } as any;
                    handleFileUpload(fakeEvent);
                  }
                }}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                    : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*,.txt,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-white">
                  Click to upload or drag & drop files
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports PDFs, PNG/JPG notes, lecture slides, and syllabus outlines (max 25MB)
                </p>
              </label>

              {/* Quick Note Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or paste topic list / syllabus notes..."
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  className="flex-1 bg-[#161622] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Add Note
                </button>
              </div>

              {/* Uploaded Materials List */}
              <div className="space-y-2 max-h-44 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-300">
                  Active Materials ({materials.length}):
                </p>
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {m.type === 'pdf' ? (
                        <FileText className="h-4 w-4 text-rose-400 shrink-0" />
                      ) : m.type === 'image' ? (
                        <Image className="h-4 w-4 text-blue-400 shrink-0" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="font-medium text-white truncate max-w-[280px]">{m.name}</p>
                        <p className="text-[10px] text-gray-400">
                          {m.size} • {m.topicsDetected.length} topics detected
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeMaterial(m.id)}
                      className="p-1 text-gray-500 hover:text-rose-400 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Select Subjects */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Select Your Exam Subjects</h3>
                <p className="text-xs text-gray-400">
                  Pick the subjects included in your upcoming exam series.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {AVAILABLE_SUBJECTS.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500/50 text-white'
                          : 'bg-white/[0.02] border-white/10 text-gray-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            isSelected ? 'bg-blue-400 shadow-sm shadow-blue-400' : 'bg-gray-600'
                          }`}
                        />
                        <span className="text-xs font-semibold">{sub.name}</span>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-blue-400" />
                Select at least one subject. Astra balances your daily schedule across all selected subjects.
              </p>
            </div>
          )}

          {/* STEP 5: Learning Preferences */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Your Learning Preference</h3>
                <p className="text-xs text-gray-400">
                  Astra adapts task formats (podcasts, interactive drills, visual diagrams, or summaries) to your style.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LEARNING_STYLES.map((style) => {
                  const Icon = style.icon;
                  const isSelected = learningStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setLearningStyle(style.id)}
                      className={`flex flex-col p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-gradient-to-b from-blue-600/20 to-violet-600/20 border-blue-500/60 shadow-lg shadow-blue-500/10'
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`p-2 rounded-xl ${
                            isSelected
                              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                              : 'bg-white/5 text-gray-400'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-white/20'
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5" />}
                        </div>
                      </div>

                      <p className="text-xs font-bold text-white mb-1">{style.title}</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{style.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isGeneratingPlan}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingPlan ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-blue-300" />
                  <span>Generate My Study Plan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
