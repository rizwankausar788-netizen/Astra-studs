import React from 'react';
import { useApp } from '../context/AppContext';
import { NAV_ITEMS } from './Sidebar';
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
  X,
} from 'lucide-react';

export const MobileNavDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { activeTab, setActiveTab } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/70 backdrop-blur-md">
      <div className="bg-[#12121A] border-t border-white/15 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-sm font-bold text-white tracking-wide">Astra Prep Navigation</span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-medium transition-all min-h-[70px] ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                    : 'bg-white/[0.03] border-white/5 text-gray-300 hover:bg-white/[0.08]'
                }`}
              >
                <Icon className={`h-5 w-5 mb-1.5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="mt-1 text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const MobileBottomBar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  // Pick top 5 quick actions for bottom bar
  const quickItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'plan', label: 'Plan', icon: CalendarClock },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquareCode },
    { id: 'quiz', label: 'Quiz', icon: CheckCircle2 },
    { id: 'flashcards', label: 'Cards', icon: Layers },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
      {quickItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
              isActive ? 'text-blue-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'scale-110 text-blue-400' : ''}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
