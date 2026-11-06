import React from 'react';
import { Play, Sparkles, BookPlus, Trophy, Lock, Unlock, ArrowRight, BookOpen, Target, Zap, Award, Flame } from 'lucide-react';
import { BookRecord, UserProgress, WordRecord } from '../types';
import { checkRightingBossUnlock } from '../data/wordDatabase';

interface HomeScreenProps {
  wordsDb: Record<string, WordRecord>;
  books: BookRecord[];
  progress: UserProgress;
  onStartLearning: () => void;
  onOpenRightingBoss: () => void;
  onOpenUpload: () => void;
  onOpenBooksTab: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  wordsDb,
  books,
  progress,
  onStartLearning,
  onOpenRightingBoss,
  onOpenUpload,
  onOpenBooksTab,
}) => {
  const wordsList = Object.values(wordsDb);
  const totalWords = wordsList.length;
  const learnedWords = wordsList.filter((w) => w.mastery >= 1).length;

  const bossStatus = checkRightingBossUnlock(wordsDb);

  // Daily quest progress
  const dailyLearned = progress.dailyQuest?.wordsLearned || 0;
  const dailyReviewed = progress.dailyQuest?.wordsReviewed || 0;
  const dailyLearnedGoal = 5;
  const dailyReviewedGoal = 3;
  const dailyCompleted = dailyLearned >= dailyLearnedGoal && dailyReviewed >= dailyReviewedGoal;

  // Last studied or next suggested word
  const nextWord =
    (progress.lastStudiedLemma && wordsDb[progress.lastStudiedLemma]) ||
    wordsList.find((w) => w.mastery === 0) ||
    wordsList[0];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Top Welcome Strip */}
      <div className="bg-white rounded-3xl p-6 border border-[#0F1C2E]/5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1F7A6B] uppercase tracking-wider block">
            Kutubxona asosidagi ta’lim
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F1C2E] tracking-tight mt-0.5">
            Xush kelibsiz!
          </h2>
          <p className="text-xs sm:text-sm text-[#0F1C2E]/60 mt-1">
            Kitoblaringizdan tuzilgan haqiqiy ingliz tili bazasi bilan shug‘ullaning.
          </p>
        </div>

        <div className="flex items-center gap-6 self-start sm:self-auto bg-[#F6F1E8]/70 px-5 py-3 rounded-2xl border border-[#0F1C2E]/5">
          <div>
            <span className="text-[11px] font-bold text-[#0F1C2E]/50 block uppercase">
              Tajriba
            </span>
            <div className="text-2xl font-black text-[#0F1C2E] tabular-nums">
              {progress.xp}
              <span className="text-xs font-bold text-[#E2A13A] ml-1">XP</span>
            </div>
          </div>
          <div className="w-px h-8 bg-[#0F1C2E]/10" />
          <div>
            <span className="text-[11px] font-bold text-[#0F1C2E]/50 block uppercase">
              Ketma-ketlik
            </span>
            <div className="text-2xl font-black text-[#0F1C2E] tabular-nums flex items-center gap-1">
              <Flame className="w-5 h-5 fill-[#E2A13A] text-[#E2A13A]" />
              <span>{progress.streak}</span>
              <span className="text-xs font-normal text-[#0F1C2E]/60">kun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid (Desktop 2-column, Mobile 1-column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Primary Learning & Daily Quests) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Daily Quest Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#0F1C2E]/5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E2A13A]/15 text-[#E2A13A] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F1C2E]">Bugungi kunlik maqsad</h3>
                  <p className="text-xs text-[#0F1C2E]/60">5 ta yangi so‘z + 3 ta takrorlash</p>
                </div>
              </div>
              {dailyCompleted && (
                <span className="text-xs font-bold text-[#1F7A6B] bg-[#1F7A6B]/10 px-3 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Bajarildi!
                </span>
              )}
            </div>

            {/* Progress bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#F6F1E8]/70 border border-[#0F1C2E]/5 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#0F1C2E]/70">
                  <span>Yangi so‘zlar</span>
                  <span className="tabular-nums font-bold text-[#1F7A6B]">
                    {dailyLearned} / {dailyLearnedGoal}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white overflow-hidden border border-[#0F1C2E]/5">
                  <div
                    className="h-full bg-[#1F7A6B] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (dailyLearned / dailyLearnedGoal) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6F1E8]/70 border border-[#0F1C2E]/5 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#0F1C2E]/70">
                  <span>Takrorlash</span>
                  <span className="tabular-nums font-bold text-[#E2A13A]">
                    {dailyReviewed} / {dailyReviewedGoal}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white overflow-hidden border border-[#0F1C2E]/5">
                  <div
                    className="h-full bg-[#E2A13A] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (dailyReviewed / dailyReviewedGoal) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Continue Learning Primary Card */}
          {nextWord ? (
            <div className="bg-[#0F1C2E] text-white rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#E2A13A] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  {progress.lastStudiedLemma ? 'Darsni davom ettirish' : 'O‘rganish navbati'}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/80 font-medium">
                  {learnedWords} / {totalWords} o‘rganildi
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2.5">
                  <h3 className="text-3xl font-black tracking-tight">{nextWord.lemma}</h3>
                  <span className="text-xs text-white/60 font-semibold">({nextWord.pos})</span>
                </div>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed font-medium">
                  {nextWord.meaningUz}
                </p>
                {nextWord.examples && nextWord.examples[0] && (
                  <p className="text-xs text-white/60 italic bg-white/5 p-3 rounded-xl border border-white/10">
                    "{nextWord.examples[0].text}"
                  </p>
                )}
              </div>

              <button
                onClick={onStartLearning}
                className="w-full h-13 rounded-2xl bg-[#1F7A6B] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#185e52] active:scale-[0.98] transition-all shadow-md"
              >
                <Play className="w-4 h-4 fill-white" />
                O‘rganishni boshlash
              </button>
            </div>
          ) : null}
        </div>

        {/* Right Column (RIGHTING Boss Lesson & Library Status) */}
        <div className="lg:col-span-5 space-y-6">
          {/* RIGHTING Boss Lesson Card */}
          <div
            onClick={onOpenRightingBoss}
            className={`rounded-3xl p-6 border transition-all cursor-pointer shadow-xs ${
              bossStatus.unlocked
                ? 'bg-gradient-to-br from-white to-[#F6F1E8] border-[#E2A13A]/50 hover:shadow-md'
                : 'bg-white border-[#0F1C2E]/10 opacity-90'
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
                  {bossStatus.unlocked ? (
                    <Unlock className="w-6 h-6 text-[#E2A13A]" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E2A13A]">
                      Maxsus boss-darsi
                    </span>
                    <span className="text-[11px] text-[#0F1C2E]/50 font-mono">/ˈraɪ.tɪŋ/</span>
                  </div>
                  <h4 className="text-lg font-bold text-[#0F1C2E]">
                    RIGHTING va writing
                  </h4>
                </div>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-bold tabular-nums ${
                  bossStatus.unlocked
                    ? 'bg-[#1F7A6B]/15 text-[#1F7A6B]'
                    : 'bg-[#0F1C2E]/5 text-[#0F1C2E]/60'
                }`}
              >
                {bossStatus.unlocked ? 'Ochiq' : `${bossStatus.learnedCount}/${bossStatus.targetCount}`}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#0F1C2E]/70 mt-3 leading-relaxed">
              {bossStatus.reasonUz}
            </p>

            <div className="mt-4 pt-3.5 border-t border-[#0F1C2E]/5 flex items-center justify-between text-xs font-semibold">
              <span className="text-[#0F1C2E]/70 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#E2A13A]" />
                "Omofon ovchisi" nishoni
              </span>
              <span className="text-[#1F7A6B] flex items-center gap-1">
                {bossStatus.unlocked ? 'Sinovga o‘tish' : 'Qulf holati'}
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Library Summary Strip */}
          <div className="bg-white rounded-3xl p-6 border border-[#0F1C2E]/5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1F7A6B]/10 text-[#1F7A6B] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#0F1C2E]">Kutubxona bazangiz</h4>
              </div>
              <button
                onClick={onOpenBooksTab}
                className="text-xs font-semibold text-[#1F7A6B] hover:underline"
              >
                Barchasi ({books.length})
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#F6F1E8] rounded-2xl">
                <span className="text-[#0F1C2E]/60 block font-medium">Yuklangan manbalar</span>
                <span className="text-xl font-bold text-[#0F1C2E] tabular-nums">
                  {books.length} ta kitob
                </span>
              </div>
              <div className="p-3.5 bg-[#F6F1E8] rounded-2xl">
                <span className="text-[#0F1C2E]/60 block font-medium">Baza so‘zlari</span>
                <span className="text-xl font-bold text-[#1F7A6B] tabular-nums">
                  {totalWords} ta so‘z
                </span>
              </div>
            </div>

            <button
              onClick={onOpenUpload}
              className="w-full h-11 px-4 rounded-2xl bg-[#F6F1E8] text-[#0F1C2E] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#F0EAE1] transition-all"
            >
              <BookPlus className="w-4 h-4 text-[#1F7A6B]" />
              Yana yangi kitob qo‘shish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
