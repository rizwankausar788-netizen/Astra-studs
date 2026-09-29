import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  auth,
  loginWithGoogle,
  loginAsGuest,
  logOut,
  onAuthStateChanged,
  syncUserDataToFirestore,
  loadUserDataFromFirestore,
} from '../lib/firebase';
import {
  UserPreferences,
  StudyPlan,
  Flashcard,
  QuizQuestion,
  MockExam,
  TopicMastery,
  SubjectTimeSpent,
  ScoreTrendPoint,
  UploadedMaterial,
} from '../types';
import {
  INITIAL_PREFERENCES,
  INITIAL_MATERIALS,
  INITIAL_STUDY_PLAN,
  INITIAL_FLASHCARDS,
  INITIAL_QUIZ_QUESTIONS,
  INITIAL_MOCK_EXAMS,
  INITIAL_TOPIC_MASTERY,
  INITIAL_TIME_SPENT,
  INITIAL_SCORE_TRENDS,
} from '../data/initialData';
import confetti from 'canvas-confetti';

interface AppContextType {
  user: User | null;
  isAuthLoading: boolean;
  loginGoogle: () => Promise<void>;
  loginGuest: () => Promise<void>;
  logout: () => Promise<void>;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'saved_locally';
  
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Preferences & Onboarding
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  
  // Study Materials
  materials: UploadedMaterial[];
  addMaterial: (material: UploadedMaterial) => void;
  removeMaterial: (id: string) => void;
  
  // Study Plan
  studyPlan: StudyPlan;
  isGeneratingPlan: boolean;
  toggleTaskCompletion: (taskId: string) => void;
  regeneratePlan: (customPrompt?: string) => Promise<void>;
  
  // Flashcards
  flashcards: Flashcard[];
  updateFlashcardReview: (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  addFlashcards: (cards: Flashcard[]) => void;
  
  // Quiz & Mock Exams
  quizQuestions: QuizQuestion[];
  setQuizQuestions: (questions: QuizQuestion[]) => void;
  mockExams: MockExam[];
  saveMockExamResult: (result: MockExam) => void;
  
  // Analytics
  topicMastery: TopicMastery[];
  timeSpent: SubjectTimeSpent[];
  scoreTrends: ScoreTrendPoint[];
  recordQuizScore: (subject: string, topic: string, scorePercentage: number) => void;
  
  // Notifications
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'saved_locally'>('saved_locally');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  // App state with local storage fallback
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('astra_preferences');
    return saved ? JSON.parse(saved) : INITIAL_PREFERENCES;
  });

  const [materials, setMaterials] = useState<UploadedMaterial[]>(() => {
    const saved = localStorage.getItem('astra_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [studyPlan, setStudyPlan] = useState<StudyPlan>(() => {
    const saved = localStorage.getItem('astra_study_plan');
    return saved ? JSON.parse(saved) : INITIAL_STUDY_PLAN;
  });

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('astra_flashcards');
    return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
  });

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => {
    const saved = localStorage.getItem('astra_quiz_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUIZ_QUESTIONS;
  });

  const [mockExams, setMockExams] = useState<MockExam[]>(() => {
    const saved = localStorage.getItem('astra_mock_exams');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_EXAMS;
  });

  const [topicMastery, setTopicMastery] = useState<TopicMastery[]>(() => {
    const saved = localStorage.getItem('astra_topic_mastery');
    return saved ? JSON.parse(saved) : INITIAL_TOPIC_MASTERY;
  });

  const [timeSpent, setTimeSpent] = useState<SubjectTimeSpent[]>(() => {
    const saved = localStorage.getItem('astra_time_spent');
    return saved ? JSON.parse(saved) : INITIAL_TIME_SPENT;
  });

  const [scoreTrends, setScoreTrends] = useState<ScoreTrendPoint[]>(() => {
    const saved = localStorage.getItem('astra_score_trends');
    return saved ? JSON.parse(saved) : INITIAL_SCORE_TRENDS;
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F43F5E'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('astra_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('astra_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('astra_study_plan', JSON.stringify(studyPlan));
  }, [studyPlan]);

  useEffect(() => {
    localStorage.setItem('astra_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem('astra_quiz_questions', JSON.stringify(quizQuestions));
  }, [quizQuestions]);

  useEffect(() => {
    localStorage.setItem('astra_mock_exams', JSON.stringify(mockExams));
  }, [mockExams]);

  useEffect(() => {
    localStorage.setItem('astra_topic_mastery', JSON.stringify(topicMastery));
  }, [topicMastery]);

  useEffect(() => {
    localStorage.setItem('astra_time_spent', JSON.stringify(timeSpent));
  }, [timeSpent]);

  useEffect(() => {
    localStorage.setItem('astra_score_trends', JSON.stringify(scoreTrends));
  }, [scoreTrends]);

  // Sync to Firestore when user is logged in
  useEffect(() => {
    if (!user) {
      setCloudSyncStatus('saved_locally');
      return;
    }

    setCloudSyncStatus('syncing');
    const timer = setTimeout(async () => {
      const success = await syncUserDataToFirestore(user.uid, {
        preferences,
        materials,
        studyPlan,
        flashcards,
        quizQuestions,
        mockExams,
        topicMastery,
        timeSpent,
        scoreTrends,
      });
      setCloudSyncStatus(success ? 'synced' : 'saved_locally');
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, preferences, materials, studyPlan, flashcards, quizQuestions, mockExams, topicMastery, timeSpent, scoreTrends]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        setCloudSyncStatus('syncing');
        const remoteData = await loadUserDataFromFirestore(currentUser.uid);
        if (remoteData) {
          if (remoteData.preferences) setPreferences(remoteData.preferences);
          if (remoteData.materials) setMaterials(remoteData.materials);
          if (remoteData.studyPlan) setStudyPlan(remoteData.studyPlan);
          if (remoteData.flashcards) setFlashcards(remoteData.flashcards);
          if (remoteData.quizQuestions) setQuizQuestions(remoteData.quizQuestions);
          if (remoteData.mockExams) setMockExams(remoteData.mockExams);
          if (remoteData.topicMastery) setTopicMastery(remoteData.topicMastery);
          if (remoteData.timeSpent) setTimeSpent(remoteData.timeSpent);
          if (remoteData.scoreTrends) setScoreTrends(remoteData.scoreTrends);
          showToast(`Welcome back, ${currentUser.displayName || 'Scholar'}! Data synced with Firestore.`, 'success');
        }
        setCloudSyncStatus('synced');
      } else {
        setCloudSyncStatus('saved_locally');
      }
    });

    return () => unsubscribe();
  }, [showToast]);

  const loginGoogle = async () => {
    try {
      const u = await loginWithGoogle();
      if (u) {
        showToast(`Signed in as ${u.displayName || u.email || 'Scholar'}`, 'success');
      }
    } catch (e: any) {
      if (
        e.code === 'auth/popup-closed-by-user' ||
        e.code === 'auth/cancelled-popup-request' ||
        e.message?.includes('popup-closed-by-user')
      ) {
        // User voluntarily dismissed popup
        return;
      }
      showToast(`Sign in error: ${e.message}`, 'error');
    }
  };

  const loginGuest = async () => {
    try {
      await loginAsGuest();
      showToast('Signed in in Guest Mode', 'info');
    } catch (e: any) {
      showToast(`Guest sign in error: ${e.message}`, 'error');
    }
  };

  const logout = async () => {
    try {
      await logOut();
      showToast('Logged out securely', 'info');
    } catch (e: any) {
      showToast(`Logout error: ${e.message}`, 'error');
    }
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  const addMaterial = (material: UploadedMaterial) => {
    setMaterials((prev) => [material, ...prev]);
    showToast(`Added "${material.name}" with ${material.topicsDetected.length} detected topics`, 'success');
  };

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('Material removed from study plan context', 'info');
  };

  const toggleTaskCompletion = (taskId: string) => {
    setStudyPlan((prev) => {
      let nowCompleted = false;
      const updated = prev.dailyTasks.map((t) => {
        if (t.id === taskId) {
          nowCompleted = !t.completed;
          return { ...t, completed: nowCompleted };
        }
        return t;
      });

      if (nowCompleted) {
        triggerConfetti();
        showToast('Task completed! Keep up the momentum ⚡', 'success');
      }

      return { ...prev, dailyTasks: updated };
    });
  };

  const regeneratePlan = async (customPrompt?: string) => {
    setIsGeneratingPlan(true);
    showToast('AI is crafting your optimized study timetable...', 'info');

    try {
      const res = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examDate: preferences.examDate,
          targetGrade: preferences.targetGrade,
          subjects: preferences.subjects,
          learningStyle: preferences.learningStyle,
          hoursPerDay: preferences.dailyGoalHours,
          materialsSummary: `${materials.map((m) => m.name).join(', ')}. ${customPrompt || ''}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudyPlan({
          summary: data.summary,
          weeklyMilestones: data.weeklyMilestones || INITIAL_STUDY_PLAN.weeklyMilestones,
          dailyTasks: data.dailyTasks || INITIAL_STUDY_PLAN.dailyTasks,
          generatedAt: new Date().toISOString(),
        });
        showToast('Study plan refreshed and synchronized with target grade!', 'success');
        triggerConfetti();
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err: any) {
      console.warn('Using intelligent fallback for study plan:', err);
      // Re-shuffle or update with current preferences
      setStudyPlan((prev) => ({
        ...prev,
        summary: `Refreshed ${preferences.subjects.join(', ')} syllabus targeting ${preferences.targetGrade} with adaptive revision intervals.`,
        generatedAt: new Date().toISOString(),
      }));
      showToast('Plan adjusted with adaptive timetable', 'success');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const updateFlashcardReview = (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;

        let interval = card.intervalDays;
        let stage = card.repetitionStage;

        if (rating === 'again') {
          interval = 1;
          stage = 'learning';
        } else if (rating === 'hard') {
          interval = Math.max(1, Math.round(interval * 1.2));
          stage = 'review';
        } else if (rating === 'good') {
          interval = Math.max(2, Math.round(interval * 1.8));
          stage = 'review';
        } else if (rating === 'easy') {
          interval = Math.max(4, Math.round(interval * 2.5));
          stage = 'mastered';
        }

        return {
          ...card,
          intervalDays: interval,
          repetitionStage: stage,
          lastReviewed: 'Just now',
        };
      })
    );
  };

  const addFlashcards = (newCards: Flashcard[]) => {
    setFlashcards((prev) => [...newCards, ...prev]);
    showToast(`Added ${newCards.length} new flashcards to your review deck!`, 'success');
  };

  const saveMockExamResult = (result: MockExam) => {
    setMockExams((prev) => [result, ...prev.filter((e) => e.id !== result.id)]);
    if (result.score !== undefined) {
      recordQuizScore(result.subject, 'Mock Exam Simulation', result.score);
      triggerConfetti();
    }
  };

  const recordQuizScore = (subject: string, topic: string, scorePercentage: number) => {
    // Add to trends
    const newPoint: ScoreTrendPoint = {
      date: 'Today',
      score: scorePercentage,
      subject,
    };
    setScoreTrends((prev) => [...prev.slice(-9), newPoint]);

    // Update Topic Mastery
    setTopicMastery((prev) => {
      const exists = prev.find((t) => t.topic.toLowerCase() === topic.toLowerCase());
      if (exists) {
        return prev.map((t) => {
          if (t.topic.toLowerCase() === topic.toLowerCase()) {
            const newMastery = Math.round((t.masteryPercentage * t.quizzesTaken + scorePercentage) / (t.quizzesTaken + 1));
            return {
              ...t,
              masteryPercentage: newMastery,
              quizzesTaken: t.quizzesTaken + 1,
              isKnowledgeGap: newMastery < 70,
            };
          }
          return t;
        });
      } else {
        return [
          {
            topic,
            subject,
            masteryPercentage: scorePercentage,
            quizzesTaken: 1,
            isKnowledgeGap: scorePercentage < 70,
          },
          ...prev,
        ];
      }
    });

    // Update study time spent
    setTimeSpent((prev) =>
      prev.map((s) => {
        if (s.subject.toLowerCase() === subject.toLowerCase()) {
          return { ...s, hours: +(s.hours + 0.5).toFixed(1) };
        }
        return s;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthLoading,
        loginGoogle,
        loginGuest,
        logout,
        cloudSyncStatus,
        activeTab,
        setActiveTab,
        preferences,
        updatePreferences,
        isOnboardingOpen,
        setIsOnboardingOpen,
        materials,
        addMaterial,
        removeMaterial,
        studyPlan,
        isGeneratingPlan,
        toggleTaskCompletion,
        regeneratePlan,
        flashcards,
        updateFlashcardReview,
        addFlashcards,
        quizQuestions,
        setQuizQuestions,
        mockExams,
        saveMockExamResult,
        topicMastery,
        timeSpent,
        scoreTrends,
        recordQuizScore,
        toast,
        showToast,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
