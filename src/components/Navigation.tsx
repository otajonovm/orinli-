import React from 'react';
import { Home, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';

export type TabType = 'home' | 'books' | 'learn' | 'progress';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  wordsToLearnCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  wordsToLearnCount = 0,
}) => {
  const tabs: Array<{ id: TabType; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'home', label: 'Bosh sahifa', icon: Home },
    { id: 'books', label: 'Kitoblarim', icon: BookOpen },
    { id: 'learn', label: 'O‘rganish', icon: GraduationCap, badge: wordsToLearnCount },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F6F1E8]/95 backdrop-blur-md border-t border-[#0F1C2E]/10"
      aria-label="Mobil asosiy navigatsiya"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all active:scale-95 ${
                isActive ? 'text-[#1F7A6B]' : 'text-[#0F1C2E]/60 hover:text-[#0F1C2E]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E2A13A] text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] tracking-tight mt-1 truncate ${
                  isActive ? 'font-bold text-[#1F7A6B]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
