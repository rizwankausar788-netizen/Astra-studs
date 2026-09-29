export type TargetGrade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'Pass';

export type LearningStyle = 'visual' | 'auditory' | 'reading/writing' | 'kinesthetic';

export type TaskFormat = 'Lesson' | 'Quiz' | 'Flashcards' | 'Podcast' | 'Mock Test';

export interface UploadedMaterial {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  topicsDetected: string[];
  snippet?: string;
}

export interface DailyTask {
  id: string;
  dayOffset: number;
  dayLabel: string;
  subject: string;
  topic: string;
  durationMin: number;
  format: TaskFormat;
  completed: boolean;
  highYieldTip?: string;
}

export interface WeeklyMilestone {
  weekNumber: number;
  title: string;
  focus: string;
  milestone: string;
}

export interface StudyPlan {
  summary: string;
  weeklyMilestones: WeeklyMilestone[];
  dailyTasks: DailyTask[];
  generatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  stepByStep?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  keyTakeaway: string;
  subject: string;
  topic: string;
  repetitionStage: 'new' | 'learning' | 'review' | 'mastered';
  intervalDays: number;
  lastReviewed?: string;
}

export interface MockExam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  questions: QuizQuestion[];
  userAnswers: Record<string, number>;
  flaggedQuestionIds: string[];
  score?: number;
  completedAt?: string;
}

export interface TopicMastery {
  topic: string;
  subject: string;
  masteryPercentage: number;
  quizzesTaken: number;
  isKnowledgeGap: boolean;
}

export interface SubjectTimeSpent {
  subject: string;
  hours: number;
  color: string;
}

export interface ScoreTrendPoint {
  date: string;
  score: number;
  subject: string;
}

export interface UserPreferences {
  examDate: string;
  targetGrade: TargetGrade;
  subjects: string[];
  learningStyle: LearningStyle;
  dailyGoalHours: number;
  onboardingCompleted: boolean;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  image?: string;
  groundingSources?: { title: string; url: string }[];
  isHighThinking?: boolean;
}
