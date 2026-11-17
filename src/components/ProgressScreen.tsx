import React, { useMemo } from 'react';
import { Award, BookOpen, Flame, PenLine, Settings, Sparkles } from 'lucide-react';
import { BookRecord, SavedCollocation, UserProgress, WordRecord, WritingDraft } from '../types';

interface ProgressScreenProps {
  wordsDb: Record<string, WordRecord>;
  books: BookRecord[];
  progress: UserProgress;
  drafts: WritingDraft[];
  savedCollocations: SavedCollocation[];
  onOpenSettings: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  wordsDb,
  books,
  progress,
  drafts,
  savedCollocations,
  onOpenSettings,
}) => {
  const words = Object.values(wordsDb);
  const mastered = words.filter((w) => w.mastery >= 3).length;
  const learning = words.filter((w) => w.mastery >= 1).length;

  const history = progress.writingHistory || [];
  const avgScores = useMemo(() => {
    if (history.length === 0) {
      return { correctness: 0, clarity: 0, formality: 0, structure: 0, vocabulary: 0 };
    }
    const sum = { correctness: 0, clarity: 0, formality: 0, structure: 0, vocabulary: 0 };
    for (const h of history) {
      sum.correctness += h.scores.correctness;
      sum.clarity += h.scores.clarity;
      sum.formality += h.scores.formality;
      sum.structure += h.scores.structure;
      sum.vocabulary += h.scores.vocabulary;
    }
    const n = history.length;
    return {
      correctness: Math.round(sum.correctness / n),
      clarity: Math.round(sum.clarity / n),
      formality: Math.round(sum.formality / n),
      structure: Math.round(sum.structure / n),
      vocabulary: Math.round(sum.vocabulary / n),
    };
  }, [history]);

  const chartPoints = history.slice(-12);
  const maxScore = 100;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-5 pb-24 md:pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Progress</h2>
          <p className="text-sm text-[#0F1C2E]/60">Yozuv ballari, so‘zlar va nishonlar</p>
        </div>
        <button
          onClick={onOpenSettings}
          className="md:hidden p-2 rounded-xl hover:bg-[#0F1C2E]/5"
          aria-label="Sozlamalar"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={<Flame className="w-4 h-4 text-[#E2A13A]" />} label="Ketma-ketlik" value={`${progress.streak} kun`} />
        <Stat icon={<Sparkles className="w-4 h-4 text-[#E2A13A]" />} label="Tajriba" value={`${progress.xp} XP`} />
        <Stat icon={<BookOpen className="w-4 h-4 text-[#1F7A6B]" />} label="So‘zlar" value={`${learning}/${words.length}`} />
        <Stat icon={<PenLine className="w-4 h-4 text-[#1F7A6B]" />} label="Yozuvlar" value={`${drafts.length}`} />
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-3xl border border-[#0F1C2E]/8 p-5 space-y-3">
        <h3 className="text-sm font-bold">Yozuv ballari (vaqt bo‘yicha)</h3>
        {chartPoints.length === 0 ? (
          <p className="text-xs text-[#0F1C2E]/50">Hali yozuv tekshirilmagan. «Yozish» bo‘limidan boshlang.</p>
        ) : (
          <div className="h-40 relative">
            <svg viewBox="0 0 400 140" className="w-full h-full" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#1F7A6B"
                strokeWidth="3"
                points={chartPoints
                  .map((p, i) => {
                    const x = chartPoints.length === 1 ? 200 : (i / (chartPoints.length - 1)) * 380 + 10;
                    const y = 130 - (p.overallScore / maxScore) * 110;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
              {chartPoints.map((p, i) => {
                const x = chartPoints.length === 1 ? 200 : (i / (chartPoints.length - 1)) * 380 + 10;
                const y = 130 - (p.overallScore / maxScore) * 110;
                return <circle key={i} cx={x} cy={y} r="4" fill="#E2A13A" />;
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Category bars */}
      <div className="bg-white rounded-3xl border border-[#0F1C2E]/8 p-5 space-y-3">
        <h3 className="text-sm font-bold">O‘rtacha kategoriya ballari</h3>
        {(
          [
            ['To‘g‘rilik', avgScores.correctness],
            ['Aniqlik', avgScores.clarity],
            ['Rasmiylik', avgScores.formality],
            ['Tuzilma', avgScores.structure],
            ['Lug‘at', avgScores.vocabulary],
          ] as const
        ).map(([label, val]) => (
          <div key={label} className="space-y-0.5">
            <div className="flex justify-between text-xs font-semibold text-[#0F1C2E]/65">
              <span>{label}</span>
              <span className="tabular-nums">{val}</span>
            </div>
            <div className="h-2 rounded-full bg-[#F6F1E8] overflow-hidden">
              <div className="h-full bg-[#1F7A6B] rounded-full" style={{ width: `${val}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-[#0F1C2E]/8 p-5 space-y-2">
          <h3 className="text-sm font-bold">O‘rganilganlar</h3>
          <p className="text-xs text-[#0F1C2E]/60">
            Mustahkam so‘zlar: <strong>{mastered}</strong>
          </p>
          <p className="text-xs text-[#0F1C2E]/60">
            Kollokatsiyalar: <strong>{savedCollocations.length}</strong>
          </p>
          <p className="text-xs text-[#0F1C2E]/60">
            Kitoblar: <strong>{books.length}</strong>
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#0F1C2E]/8 p-5 space-y-2">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#E2A13A]" />
            Nishonlar
          </h3>
          {progress.badges.length === 0 ? (
            <p className="text-xs text-[#0F1C2E]/50">Hali nishon yo‘q — o‘rganishda davom eting!</p>
          ) : (
            progress.badges.map((b) => (
              <div key={b.id} className="rounded-xl bg-[#F6F1E8] px-3 py-2">
                <div className="text-xs font-bold">{b.title}</div>
                <div className="text-[11px] text-[#0F1C2E]/55">{b.description}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[#0F1C2E]/15 p-4 text-xs text-[#0F1C2E]/50">
        O‘qituvchi ko‘rinishi — keyingi bosqichda. Hozircha faqat shaxsiy progress.
      </div>
    </div>
  );
};

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#0F1C2E]/8 p-3.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#0F1C2E]/45">
        {icon}
        {label}
      </div>
      <div className="text-lg font-black mt-1 tabular-nums">{value}</div>
    </div>
  );
}
