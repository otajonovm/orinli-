import React, { useState } from 'react';
import {
  ArrowRight,
  Flame,
  Lock,
  PenLine,
  Search,
  Target,
  Trophy,
  Unlock,
  Zap,
} from 'lucide-react';
import { BookRecord, UserProgress, WordRecord, WritingDraft } from '../types';
import { checkRightingBossUnlock } from '../data/wordDatabase';
import { TabType } from './Navigation';

interface HomeScreenProps {
  wordsDb: Record<string, WordRecord>;
  books: BookRecord[];
  progress: UserProgress;
  drafts: WritingDraft[];
  onNavigate: (tab: TabType) => void;
  onOpenRightingBoss: () => void;
  onContinueDraft?: (id: string) => void;
  onQuickSearch: (word: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  wordsDb,
  books,
  progress,
  drafts,
  onNavigate,
  onOpenRightingBoss,
  onContinueDraft,
  onQuickSearch,
}) => {
  const [q, setQ] = useState('');
  const bossStatus = checkRightingBossUnlock(wordsDb);

  const writings = progress.dailyQuest?.writingsCompleted || 0;
  const collos = progress.dailyQuest?.collocationsSaved || 0;
  const questDone = writings >= 1 && collos >= 5;

  const lastDraft =
    (progress.lastWritingDraftId &&
      drafts.find((d) => d.id === progress.lastWritingDraftId)) ||
    drafts[0];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-10">
      <div className="bg-white rounded-3xl p-6 border border-[#0F1C2E]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1F7A6B] uppercase tracking-wider">
            Texnik va akademik yozuv
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F1C2E] tracking-tight mt-0.5">
            WriteTechAI
          </h2>
          <p className="text-sm text-[#0F1C2E]/60 mt-1">
            O‘zbek tilidagi yordam bilan rasmiy inglizcha yozing.
          </p>
        </div>
        <div className="flex items-center gap-5 bg-[#F6F1E8]/70 px-5 py-3 rounded-2xl border border-[#0F1C2E]/5">
          <div>
            <span className="text-[11px] font-bold text-[#0F1C2E]/50 uppercase">Tajriba</span>
            <div className="text-2xl font-black tabular-nums">
              {progress.xp}
              <span className="text-xs text-[#E2A13A] ml-1">XP</span>
            </div>
          </div>
          <div className="w-px h-8 bg-[#0F1C2E]/10" />
          <div>
            <span className="text-[11px] font-bold text-[#0F1C2E]/50 uppercase">Ketma-ketlik</span>
            <div className="text-2xl font-black flex items-center gap-1">
              <Flame className="w-5 h-5 fill-[#E2A13A] text-[#E2A13A]" />
              {progress.streak}
              <span className="text-xs font-normal text-[#0F1C2E]/55">kun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) onQuickSearch(q.trim());
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1C2E]/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kollokatsiya qidirish: deliver, make, issue…"
            className="w-full h-12 pl-10 pr-3 rounded-2xl bg-white border border-[#0F1C2E]/10 text-sm outline-none focus:border-[#1F7A6B]"
          />
        </div>
        <button
          type="submit"
          className="h-12 px-5 rounded-2xl bg-[#0F1C2E] text-white text-sm font-bold"
        >
          Qidirish
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {/* Daily quest */}
          <div className="bg-white rounded-3xl p-6 border border-[#0F1C2E]/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E2A13A]/15 text-[#E2A13A] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Bugungi kunlik maqsad</h3>
                  <p className="text-xs text-[#0F1C2E]/60">1 ta yozuv + 5 ta kollokatsiya</p>
                </div>
              </div>
              {questDone && (
                <span className="text-xs font-bold text-[#1F7A6B] bg-[#1F7A6B]/10 px-3 py-1 rounded-full">
                  Bajarildi!
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuestBar label="Yozuv" value={writings} goal={1} color="#1F7A6B" />
              <QuestBar label="Kollokatsiya" value={collos} goal={5} color="#E2A13A" />
            </div>
          </div>

          {/* Continue writing */}
          <div className="bg-[#0F1C2E] text-white rounded-3xl p-6 space-y-4">
            <span className="text-xs font-bold text-[#E2A13A] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {lastDraft ? 'Oxirgi vazifani davom ettirish' : 'Yozishni boshlash'}
            </span>
            {lastDraft ? (
              <>
                <p className="text-sm text-white/80 line-clamp-2">
                  {lastDraft.task.situationEn}
                </p>
                <p className="text-xs text-white/50">
                  {lastDraft.lastCheck
                    ? `Oxirgi ball: ${lastDraft.lastCheck.overallScore}`
                    : 'Hali tekshirilmagan'}
                </p>
                <button
                  onClick={() => {
                    onContinueDraft?.(lastDraft.id);
                    onNavigate('write');
                  }}
                  className="w-full h-12 rounded-2xl bg-[#1F7A6B] font-bold text-sm flex items-center justify-center gap-2"
                >
                  <PenLine className="w-4 h-4" />
                  Davom etish
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('write')}
                className="w-full h-12 rounded-2xl bg-[#1F7A6B] font-bold text-sm flex items-center justify-center gap-2"
              >
                <PenLine className="w-4 h-4" />
                Rasmiy xat yozish
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <button
            onClick={onOpenRightingBoss}
            className={`w-full text-left rounded-3xl p-6 border transition-all ${
              bossStatus.unlocked
                ? 'bg-gradient-to-br from-white to-[#F6F1E8] border-[#E2A13A]/50'
                : 'bg-white border-[#0F1C2E]/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    bossStatus.unlocked
                      ? 'bg-[#E2A13A]/20 text-[#E2A13A]'
                      : 'bg-[#0F1C2E]/5 text-[#0F1C2E]/40'
                  }`}
                >
                  {bossStatus.unlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#E2A13A]">
                    Maxsus boss-darsi
                  </span>
                  <h4 className="text-lg font-bold">RIGHTING va writing</h4>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-bold bg-[#0F1C2E]/5">
                {bossStatus.unlocked ? 'Ochiq' : `${bossStatus.learnedCount}/${bossStatus.targetCount}`}
              </span>
            </div>
            <p className="text-xs text-[#0F1C2E]/70 mt-3">{bossStatus.reasonUz}</p>
            <div className="mt-3 pt-3 border-t border-[#0F1C2E]/5 flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#E2A13A]" />
                Omofon ovchisi
              </span>
              <span className="text-[#1F7A6B] flex items-center gap-1">
                O‘tish <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </button>

          <div className="bg-white rounded-3xl p-5 border border-[#0F1C2E]/5 space-y-3">
            <h4 className="font-bold text-sm">Tezkor yo‘llar</h4>
            <QuickLink label="Kollokatsiya qidiruvi" onClick={() => onNavigate('collocations')} />
            <QuickLink label="Phrasal fe’llar" onClick={() => onNavigate('phrasal')} />
            <QuickLink
              label={`So‘zlar bazasi (${Object.keys(wordsDb).length})`}
              onClick={() => onNavigate('words')}
            />
            <QuickLink label={`Kitoblar (${books.length})`} onClick={() => onNavigate('words')} />
            <QuickLink label="Progress" onClick={() => onNavigate('progress')} />
          </div>
        </div>
      </div>
    </div>
  );
};

function QuestBar({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  return (
    <div className="p-3.5 rounded-2xl bg-[#F6F1E8]/70 border border-[#0F1C2E]/5 space-y-1.5">
      <div className="flex justify-between text-xs font-semibold text-[#0F1C2E]/70">
        <span>{label}</span>
        <span className="tabular-nums font-bold" style={{ color }}>
          {Math.min(value, goal)} / {goal}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white overflow-hidden border border-[#0F1C2E]/5">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, (value / goal) * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

function QuickLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between text-sm font-semibold px-3 py-2.5 rounded-xl hover:bg-[#F6F1E8] text-[#0F1C2E]/80"
    >
      {label}
      <ArrowRight className="w-4 h-4 text-[#1F7A6B]" />
    </button>
  );
}
