import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNavDrawer, MobileBottomBar } from './components/MobileNav';
import { OnboardingModal } from './components/OnboardingModal';
import { DashboardView } from './views/DashboardView';
import { StudyPlanView } from './views/StudyPlanView';
import { AIChatView } from './views/AIChatView';
import { QuizView } from './views/QuizView';
import { FlashcardsView } from './views/FlashcardsView';
import { MockExamView } from './views/MockExamView';
import { ConceptVideoView } from './views/ConceptVideoView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, toast } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'plan':
        return <StudyPlanView />;
      case 'tutor':
        return <AIChatView />;
      case 'quiz':
        return <QuizView />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'mock-exam':
        return <MockExamView />;
      case 'concept-video':
        return <ConceptVideoView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F3F4F6] flex flex-col font-['Geist',sans-serif] selection:bg-blue-600/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
      />

      {/* Main Content Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Onboarding Wizard Modal */}
      <OnboardingModal />

      {/* Mobile Drawer & Bottom Navigation */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
      <MobileBottomBar />

      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/85 border-emerald-500/30 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/85 border-rose-500/30 text-rose-200'
                : 'bg-[#181828]/95 border-blue-500/30 text-blue-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-blue-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
