import React from 'react';
import { Settings, Flame, Home, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { TabType } from './Navigation';

interface HeaderProps {
  streak: number;
  onOpenSettings: () => void;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  wordsToLearnCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  onOpenSettings,
  activeTab,
  onTabChange,
  wordsToLearnCount = 0,
}) => {
  const navTabs: Array<{ id: TabType; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'home', label: 'Bosh sahifa', icon: Home },
    { id: 'books', label: 'Kitoblarim', icon: BookOpen },
    { id: 'learn', label: 'O‘rganish', icon: GraduationCap, badge: wordsToLearnCount },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F6F1E8]/95 backdrop-blur-md border-b border-[#0F1C2E]/10 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTabChange?.('home')}
            className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F1C2E] select-none hover:opacity-90 transition-opacity"
          >
            Orinli
          </button>

          {/* Status Indicators */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1F7A6B]/15 text-[#1F7A6B] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A6B]"></span>
              Baza: Kitoblar
            </span>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-[#0F1C2E]/5 text-[#0F1C2E]/60">
              BNC: keyin
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (hidden on mobile, visible on md+) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center gap-1 bg-white/70 p-1 rounded-2xl border border-[#0F1C2E]/5">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0F1C2E] text-white shadow-xs'
                      : 'text-[#0F1C2E]/70 hover:text-[#0F1C2E] hover:bg-[#F6F1E8]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`min-w-[18px] h-4.5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isActive ? 'bg-[#E2A13A] text-white' : 'bg-[#0F1C2E]/10 text-[#0F1C2E]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Action Zone */}
        <div className="flex items-center gap-2.5">
          {streak > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E2A13A]/15 text-[#E2A13A] text-xs font-bold"
              title={`${streak} kunlik ketma-ketlik`}
            >
              <Flame className="w-4 h-4 fill-[#E2A13A]" />
              <span>{streak} kun</span>
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-[#0F1C2E]/70 hover:text-[#0F1C2E] hover:bg-[#0F1C2E]/5 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
            aria-label="Sozlamalar"
          >
            <Settings className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Sozlamalar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
