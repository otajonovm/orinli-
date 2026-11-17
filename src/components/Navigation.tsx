import React from 'react';
import {
  Home,
  PenLine,
  Search,
  BookOpen,
  TrendingUp,
  Layers,
  Settings,
} from 'lucide-react';

export type TabType =
  | 'home'
  | 'write'
  | 'collocations'
  | 'phrasal'
  | 'words'
  | 'progress'
  | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  dueCount?: number;
}

const MOBILE_TABS: Array<{
  id: TabType;
  label: string;
  icon: React.ElementType;
}> = [
  { id: 'home', label: 'Bosh', icon: Home },
  { id: 'write', label: 'Yozish', icon: PenLine },
  { id: 'collocations', label: 'Kollok.', icon: Search },
  { id: 'phrasal', label: 'Fe’llar', icon: Layers },
  { id: 'words', label: 'So‘zlar', icon: BookOpen },
];

export const SIDEBAR_TABS: Array<{
  id: TabType;
  label: string;
  icon: React.ElementType;
}> = [
  { id: 'home', label: 'Bosh sahifa', icon: Home },
  { id: 'write', label: 'Yozish', icon: PenLine },
  { id: 'collocations', label: 'Kollokatsiya', icon: Search },
  { id: 'phrasal', label: 'Phrasal fe’llar', icon: Layers },
  { id: 'words', label: 'So‘zlar / Kitoblar', icon: BookOpen },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'settings', label: 'Sozlamalar', icon: Settings },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  dueCount = 0,
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F6F1E8]/95 backdrop-blur-md border-t border-[#0F1C2E]/10"
      aria-label="Asosiy navigatsiya"
    >
      <div className="max-w-lg mx-auto grid grid-cols-5 items-center h-16 px-0.5">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all active:scale-95 ${
                isActive ? 'text-[#1F7A6B]' : 'text-[#0F1C2E]/55 hover:text-[#0F1C2E]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`}
                />
                {tab.id === 'words' && dueCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E2A13A] text-white text-[9px] font-bold flex items-center justify-center">
                    {dueCount > 99 ? '99+' : dueCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-[64px] ${
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

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  dueCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  dueCount = 0,
}) => {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-[#0F1C2E]/10 bg-white/60 min-h-[calc(100vh-57px)] sticky top-[57px]">
      <nav className="p-3 space-y-1" aria-label="Yon panel">
        {SIDEBAR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#0F1C2E] text-white'
                  : 'text-[#0F1C2E]/70 hover:bg-[#F6F1E8] hover:text-[#0F1C2E]'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="truncate flex-1 text-left">{tab.label}</span>
              {tab.id === 'words' && dueCount > 0 && (
                <span
                  className={`min-w-[18px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    isActive ? 'bg-[#E2A13A] text-white' : 'bg-[#E2A13A]/20 text-[#0F1C2E]'
                  }`}
                >
                  {dueCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
