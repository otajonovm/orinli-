import React from 'react';
import { Trophy, BookOpen, Flame, Award, Layers, ShieldCheck, Settings, Medal, CheckCircle2 } from 'lucide-react';
import { BookRecord, UserProgress, WordRecord } from '../types';

interface ProgressScreenProps {
  wordsDb: Record<string, WordRecord>;
  books: BookRecord[];
  progress: UserProgress;
  onOpenSettings: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  wordsDb,
  books,
  progress,
  onOpenSettings,
}) => {
  const wordsList = Object.values(wordsDb);
  const totalWords = wordsList.length;

  const masteryCounts = {
    new: wordsList.filter((w) => w.mastery === 0).length,
    level1: wordsList.filter((w) => w.mastery === 1).length,
    level2: wordsList.filter((w) => w.mastery === 2).length,
    level3: wordsList.filter((w) => w.mastery === 3).length,
  };

  const learnedCount = masteryCounts.level1 + masteryCounts.level2 + masteryCounts.level3;
  const masteryPercent = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F1C2E] tracking-tight">
            Shaxsiy Progress
          </h2>
          <p className="text-xs sm:text-sm text-[#0F1C2E]/60 mt-1">
            Kitoblaringiz bazasi bo‘yicha o‘zlashtirish va faollik ko‘rsatkichlari
          </p>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl text-[#0F1C2E]/70 hover:text-[#0F1C2E] hover:bg-white transition-colors"
          aria-label="Sozlamalar"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main KPI Stats Grid (4 columns on desktop, 2 columns on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Words in Database */}
        <div className="bg-white rounded-3xl p-5 border border-[#0F1C2E]/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F1C2E]/50 uppercase tracking-wider block">
              Jami so‘zlar bazasi
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#1F7A6B]/10 text-[#1F7A6B] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0F1C2E] tabular-nums">
            {totalWords}
          </div>
          <span className="text-xs text-[#1F7A6B] font-semibold block">
            {books.length} ta kitob manbasidan
          </span>
        </div>

        {/* Learned Words */}
        <div className="bg-white rounded-3xl p-5 border border-[#0F1C2E]/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F1C2E]/50 uppercase tracking-wider block">
              O‘zlashtirilgan
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1F7A6B] tabular-nums">
            {learnedCount}
          </div>
          <span className="text-xs text-[#0F1C2E]/50 font-medium block">
            {masteryPercent}% umumiy bazadan
          </span>
        </div>

        {/* Total XP */}
        <div className="bg-white rounded-3xl p-5 border border-[#0F1C2E]/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F1C2E]/50 uppercase tracking-wider block">
              Umumiy tajriba
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E2A13A]/15 text-[#E2A13A] flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#E2A13A] tabular-nums">
            {progress.xp}
            <span className="text-xs font-bold text-[#0F1C2E]/60 ml-1">XP</span>
          </div>
          <span className="text-xs text-[#0F1C2E]/50 font-medium block">
            Kontekstni to‘g‘ri anglash
          </span>
        </div>

        {/* Daily Streak */}
        <div className="bg-white rounded-3xl p-5 border border-[#0F1C2E]/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F1C2E]/50 uppercase tracking-wider block">
              Ketma-ketlik
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E2A13A]/15 text-[#E2A13A] flex items-center justify-center">
              <Flame className="w-4 h-4 fill-[#E2A13A]" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0F1C2E] tabular-nums flex items-baseline gap-1.5">
            <span>{progress.streak}</span>
            <span className="text-xs font-semibold text-[#0F1C2E]/60">kun</span>
          </div>
          <span className="text-xs text-[#0F1C2E]/50 font-medium block">
            Doimiy faol o‘rganish
          </span>
        </div>
      </div>

      {/* Responsive 2-Column Split for Mastery and Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mastery Breakdown (0-3) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#0F1C2E]/5 shadow-xs space-y-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F1C2E]">
              O‘zlashtirish bosqichlari (Mastery 0–3)
            </h3>
            <p className="text-xs text-[#0F1C2E]/60 mt-0.5">
              So‘zlarning xotirada qanchalik mustahkam o‘rnashganligi
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Level 3: Mustahkam */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-[#0F1C2E]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  Mustahkam o‘zlashtirilgan (Daraja 3)
                </span>
                <span className="font-bold tabular-nums">{masteryCounts.level3} ta</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#F6F1E8] overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalWords > 0 ? (masteryCounts.level3 / totalWords) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Level 2: O'rta */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-[#0F1C2E]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  O‘rta daraja (Daraja 2)
                </span>
                <span className="font-bold tabular-nums">{masteryCounts.level2} ta</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#F6F1E8] overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalWords > 0 ? (masteryCounts.level2 / totalWords) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Level 1: Boshlang'ich */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-[#0F1C2E]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  Boshlang‘ich (Daraja 1)
                </span>
                <span className="font-bold tabular-nums">{masteryCounts.level1} ta</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#F6F1E8] overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalWords > 0 ? (masteryCounts.level1 / totalWords) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Level 0: Yangi */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-[#0F1C2E]/70">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  Yangi so‘zlar (Daraja 0)
                </span>
                <span className="font-bold tabular-nums">{masteryCounts.new} ta</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#F6F1E8] overflow-hidden">
                <div
                  className="h-full bg-slate-300 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalWords > 0 ? (masteryCounts.new / totalWords) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Badges & Contributing Books */}
        <div className="lg:col-span-6 space-y-6">
          {/* Badges Collection */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#0F1C2E]/5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[#0F1C2E] flex items-center gap-2">
                <Medal className="w-5 h-5 text-[#E2A13A]" />
                Qo‘lga kiritilgan nishonlar
              </h3>
              <span className="text-xs text-[#0F1C2E]/50 font-bold tabular-nums">
                {progress.badges.length} ta
              </span>
            </div>

            {progress.badges.length === 0 ? (
              <p className="text-xs sm:text-sm text-[#0F1C2E]/60 italic py-2">
                Hali nishonlar yo‘q. Kitob yuklang yoki RIGHTING boss-darsini yutib ilk nishoningizni oling!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {progress.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F6F1E8] border border-[#0F1C2E]/5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E2A13A]/20 text-[#E2A13A] flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0F1C2E]">{badge.title}</h4>
                      <p className="text-[11px] text-[#0F1C2E]/70 leading-snug mt-0.5">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Books Contributing to Database */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#0F1C2E]/5 shadow-xs space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-[#0F1C2E] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1F7A6B]" />
              Bazani oziqlantirgan manbalar
            </h3>

            {books.length === 0 ? (
              <p className="text-xs sm:text-sm text-[#0F1C2E]/60 italic">Hozircha kitoblar yo‘q.</p>
            ) : (
              <div className="space-y-2.5">
                {books.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F6F1E8]/70 text-xs sm:text-sm border border-[#0F1C2E]/5"
                  >
                    <span className="font-bold text-[#0F1C2E] truncate max-w-[280px]">
                      {b.title}
                    </span>
                    <span className="text-xs font-bold text-[#1F7A6B] tabular-nums">
                      +{b.wordsExtractedCount} ta so‘z
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
