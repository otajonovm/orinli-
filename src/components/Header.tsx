import React from 'react';
import { Flame, Settings } from 'lucide-react';
import { TabType } from './Navigation';

interface HeaderProps {
  streak: number;
  xp: number;
  onOpenSettings: () => void;
  onGoHome?: () => void;
  bncConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  xp,
  onOpenSettings,
  onGoHome,
  bncConnected = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F6F1E8]/95 backdrop-blur-md border-b border-[#0F1C2E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onGoHome}
            className="text-lg sm:text-xl font-black tracking-tight text-[#0F1C2E] select-none hover:opacity-90 transition-opacity truncate"
          >
            WriteTech<span className="text-[#1F7A6B]">AI</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1F7A6B]/15 text-[#1F7A6B] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A6B]" />
              Kitoblar
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg font-semibold ${
                bncConnected
                  ? 'bg-[#1F7A6B]/15 text-[#1F7A6B]'
                  : 'bg-[#0F1C2E]/5 text-[#0F1C2E]/55'
              }`}
            >
              {bncConnected ? 'BNC: ulangan' : 'BNC: ulanmagan'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#0F1C2E]/5 text-xs font-bold text-[#0F1C2E]">
            <span className="tabular-nums">{xp}</span>
            <span className="text-[#E2A13A]">XP</span>
          </div>

          {streak > 0 && (
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#E2A13A]/15 text-[#E2A13A] text-xs font-bold"
              title={`${streak} kunlik ketma-ketlik`}
            >
              <Flame className="w-3.5 h-3.5 fill-[#E2A13A]" />
              <span>{streak}</span>
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className="md:hidden p-2 rounded-xl text-[#0F1C2E]/70 hover:bg-[#0F1C2E]/5"
            aria-label="Sozlamalar"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

// Keep TabType export path happy for any leftover imports
export type { TabType };
