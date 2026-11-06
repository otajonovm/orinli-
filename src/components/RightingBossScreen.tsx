import React, { useState } from 'react';
import {
  Volume2,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Zap,
  Lock,
  Medal,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RightingBossScreenProps {
  onBack: () => void;
  onPassedBoss: () => void;
  isUnlocked: boolean;
}

interface BossQuestion {
  questionUz: string;
  options: string[];
  answerIndex: number;
  explainUz: string;
}

const BOSS_QUESTIONS: BossQuestion[] = [
  {
    questionUz: '"The new law is a step towards righting an old injustice." Ushbu gapda "righting" nimani bildiradi?',
    options: [
      'Eski adolatsizlikni to‘g‘rilash va tuzatish',
      'Yangi qonunni qog‘ozga yozish',
      'O‘ng tomondan qonun qabul qilish',
      'Eski kitobni chop etish'
    ],
    answerIndex: 0,
    explainUz: 'Bu yerda "righting an injustice" — adolatsizlikni bartaraf qilish, to‘g‘rilash ma’nosida.'
  },
  {
    questionUz: '"Righting a wrong takes time and honesty." Mazkur jumlada qaysi ma’no ifodalangan?',
    options: [
      'Xatoni tan olib, uni to‘g‘rilash vaqt va halollik talab qiladi',
      'Xato xat yozish uchun vaqt kerak',
      'O‘ng qo‘l bilan xato qilish oson',
      'Hech qachon xato qilmaslik kerak'
    ],
    answerIndex: 0,
    explainUz: '"Righting a wrong" — xato yoki nohaqlikni to‘g‘rilash.'
  },
  {
    questionUz: '"The crew worked all night on the righting of the boat." Bu gapda "righting" qaysi ma’noda?',
    options: [
      'Ag‘darilgan qayiqni qayta tiklash, o‘z holatiga keltirish',
      'Qayiq nomini yozib qo‘yish',
      'Qayiqda xat yozish',
      'Qayiqni o‘ng qirg‘oqqa haydash'
    ],
    answerIndex: 0,
    explainUz: 'Jismoniy ma’noda: "righting" biror narsani dastlabki vertikal / to‘g‘ri holatiga tiklash demakdir.'
  },
  {
    questionUz: '"A cat’s righting reflex helps it land on its feet." Ushbu tabiiy hodisa nimani anglatadi?',
    options: [
      'Mushukning havoda tanasini to‘g‘rilab, oyoqlariga tushish refleksi',
      'Mushukning yozuv yozish qobiliyati',
      'Mushukning faqat o‘ng tomonga sakrashi',
      'Mushukning xatoni kechirish refleksi'
    ],
    answerIndex: 0,
    explainUz: 'Biologiyada "righting reflex" — jonzotning muvozanatni va tik holatini tiklash instinkti.'
  },
  {
    questionUz: 'Qaysi gapda "writing" (yozish) so‘zi o‘rnida "righting" ishlatilsa, xato hisoblanadi?',
    options: [
      'She is writing a novel about her travels.',
      'He spent hours righting the overturned chair.',
      'The court was dedicated to righting the historic wrongs.',
      'The gymnast displayed an impressive righting reflex.'
    ],
    answerIndex: 0,
    explainUz: 'Roman yoki matn yaratishda faqat "writing" (W harfi bilan) qo‘llanadi!'
  },
  {
    questionUz: '"Righting" va "writing" so‘zlarining talaffuzi haqida qaysi fikr mutlaqo to‘g‘ri?',
    options: [
      'Ikkisi ham /ˈraɪ.tɪŋ/ deb bir xil talaffuz qilinadi (omofonlar)',
      '"Righting" so‘zida R harfi aytilmaydi',
      '"Writing" so‘zida W harfi baland ovozda /w/ deb aytiladi',
      'Ular mutlaqo boshqa-boshqa talaffuz qilinadi'
    ],
    answerIndex: 0,
    explainUz: 'Ular omofondir: ingliz tilida "writing" dagi W tovushi aytilmaydi, ikkisi ham bir xil /ˈraɪ.tɪŋ/ deb aytiladi.'
  }
];

export const RightingBossScreen: React.FC<RightingBossScreenProps> = ({
  onBack,
  onPassedBoss,
  isUnlocked,
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('righting');
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentQ = BOSS_QUESTIONS[currentQIndex];

  const handleCheck = () => {
    if (selectedOpt === null) return;
    const isCorrect = selectedOpt === currentQ.answerIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    setChecked(true);
  };

  const handleNext = () => {
    if (currentQIndex < BOSS_QUESTIONS.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOpt(null);
      setChecked(false);
    } else {
      setIsFinished(true);
      if (score >= 4) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        onPassedBoss();
      }
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedOpt(null);
    setChecked(false);
    setScore(0);
    setIsFinished(false);
  };

  if (!isUnlocked) {
    return (
      <div className="flex-1 px-4 sm:px-6 py-12 max-w-xl mx-auto w-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#0F1C2E]/5 text-[#0F1C2E]/40 flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-[#0F1C2E]">Dars hali qulflangan</h3>
        <p className="text-sm text-[#0F1C2E]/60 max-w-md leading-relaxed">
          Ushbu boss-darsini ochish uchun WordDatabase’dan kamida 8 ta so‘zni o‘zlashtiring yoki kutubxonangizga "righting" / "writing" so‘zlari bor kitobni yuklang.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl bg-[#0F1C2E] text-white text-xs font-bold hover:bg-[#0F1C2E]/90 transition-all"
        >
          Ortga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-[#0F1C2E]/70 hover:text-[#0F1C2E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bosh sahifaga qaytish</span>
        </button>
        <span className="text-xs font-bold text-[#E2A13A] uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-4 h-4" />
          Boss-Darsi
        </span>
      </div>

      {/* Responsive Grid: Left info & examples, Right quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Hero & Explanations (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#0F1C2E] text-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#E2A13A] uppercase tracking-wider">
                  Omofonlar siri
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <h2 className="text-3xl font-black tracking-tight">RIGHTING va writing</h2>
                  <button
                    onClick={playAudio}
                    className="p-1.5 rounded-full text-[#E2A13A] hover:bg-white/10 active:scale-95 transition-all"
                    title="Talaffuz: /ˈraɪ.tɪŋ/"
                    aria-label="Talaffuz"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-white/60 font-mono mt-0.5">/ˈraɪ.tɪŋ/ — ikkisi ham bir xil eshitiladi</p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#E2A13A]/20 text-[#E2A13A] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            {/* Core Differences */}
            <div className="space-y-3 pt-2 border-t border-white/10 text-xs sm:text-sm">
              <div className="bg-white/10 p-4 rounded-2xl space-y-1">
                <span className="font-bold text-[#E2A13A] block">1. RIGHTING:</span>
                <p className="text-white/85 leading-relaxed">
                  (1) Xatoni yoki adolatsizlikni tuzatish
                  <br />
                  (2) Qulagan yoki qiyshaygan narsani dastlabki tik holatiga qaytarish
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl space-y-1">
                <span className="font-bold text-white/95 block">2. WRITING:</span>
                <p className="text-white/75 leading-relaxed">
                  Yozish / yozma matn yaratish (harflar bilan qog‘ozga tushirish)
                </p>
              </div>
            </div>

            {/* Prompt Authentic Examples */}
            <div className="text-xs text-white/80 space-y-2 bg-black/25 p-4 rounded-2xl font-mono">
              <span className="text-[#E2A13A] font-bold block text-xs">Haqiqiy namunalar:</span>
              <p className="leading-relaxed">• The new law is a step towards righting an old injustice.</p>
              <p className="leading-relaxed">• Righting a wrong takes time and honesty.</p>
              <p className="leading-relaxed">• The crew worked all night on the righting of the boat.</p>
              <p className="leading-relaxed">• A cat’s righting reflex helps it land on its feet.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Quiz & Live Progress (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-5">
          {!isFinished ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#0F1C2E]/5 shadow-xs space-y-5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#0F1C2E]/60">
                <span>
                  Savol {currentQIndex + 1} / {BOSS_QUESTIONS.length}
                </span>
                <span className="tabular-nums font-bold text-[#1F7A6B]">
                  Ball: {score} ta to‘g‘ri
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold text-[#0F1C2E] leading-relaxed">
                {currentQ.questionUz}
              </p>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOpt === idx;
                  let style = 'bg-[#F6F1E8] border-[#0F1C2E]/10 text-[#0F1C2E] hover:border-[#1F7A6B]/50';

                  if (checked) {
                    if (idx === currentQ.answerIndex) {
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isSelected) {
                      style = 'bg-rose-50 border-rose-300 text-rose-950 line-through';
                    } else {
                      style = 'bg-white/50 border-slate-200 text-slate-400';
                    }
                  } else if (isSelected) {
                    style = 'bg-[#0F1C2E] text-white border-[#0F1C2E]';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={checked}
                      onClick={() => setSelectedOpt(idx)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${style}`}
                    >
                      <span className="font-bold mr-1.5">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {checked && (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm space-y-1 ${
                    selectedOpt === currentQ.answerIndex
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                      : 'bg-amber-50 text-amber-950 border border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {selectedOpt === currentQ.answerIndex ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>To‘g‘ri!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span>Xato</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed">{currentQ.explainUz}</p>
                </div>
              )}

              <div className="pt-2">
                {!checked ? (
                  <button
                    onClick={handleCheck}
                    disabled={selectedOpt === null}
                    className="w-full h-12 sm:h-13 rounded-2xl bg-[#0F1C2E] text-white font-bold text-sm sm:text-base disabled:opacity-40 hover:bg-[#0F1C2E]/90 active:scale-[0.98] transition-all"
                  >
                    Javobni tekshirish
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full h-12 sm:h-13 rounded-2xl bg-[#1F7A6B] text-white font-bold text-sm sm:text-base hover:bg-[#185e52] active:scale-[0.98] transition-all"
                  >
                    {currentQIndex < BOSS_QUESTIONS.length - 1 ? 'Keyingi savol' : 'Natijani ko‘rish'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Result Screen */
            <div className="bg-white rounded-3xl p-6 sm:p-8 text-center space-y-5 border border-[#0F1C2E]/5 shadow-xs">
              <div
                className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto ${
                  score >= 5 ? 'bg-amber-100 text-[#E2A13A]' : 'bg-[#0F1C2E]/5 text-[#0F1C2E]/40'
                }`}
              >
                <Trophy className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-[#0F1C2E]">
                  {score >= 5 ? 'Tabriklaymiz! Boss mag‘lub etildi!' : 'Yaxshi urinish!'}
                </h3>
                <p className="text-xs sm:text-sm text-[#0F1C2E]/60">
                  Natija: 6 tadan {score} ta to‘g‘ri javob
                </p>
              </div>

              {score >= 5 ? (
                <div className="bg-[#1F7A6B]/10 rounded-2xl p-5 border border-[#1F7A6B]/20 space-y-1.5 text-center">
                  <span className="text-xs font-bold text-[#1F7A6B] block">
                    Yangi nishon qo‘lga kiritildi!
                  </span>
                  <div className="flex items-center justify-center gap-2 text-base font-black text-[#0F1C2E]">
                    <Medal className="w-5 h-5 text-[#E2A13A]" />
                    <span>"Omofon ovchisi"</span>
                  </div>
                  <p className="text-xs text-[#0F1C2E]/70 pt-1">
                    Siz "righting" va "writing" so‘zlarining nozik farqini to‘liq o‘zlashtirdingiz.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-2xl p-4 text-xs text-amber-950 space-y-1 text-left">
                  <span className="font-bold">Eslatma:</span>
                  <p>
                    "Omofon ovchisi" nishoni uchun kamida 5 ta savolga to‘g‘ri javob berish lozim. Yuqoridagi misollarni yana bir ko‘zdan kechirib, qayta urinib ko‘ring.
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-2">
                {score < 5 ? (
                  <button
                    onClick={handleRestart}
                    className="w-full h-12 rounded-2xl bg-[#0F1C2E] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0F1C2E]/90"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Qayta sinab ko‘rish
                  </button>
                ) : (
                  <button
                    onClick={onBack}
                    className="w-full h-12 rounded-2xl bg-[#1F7A6B] text-white font-bold text-sm hover:bg-[#185e52]"
                  >
                    Bosh sahifaga qaytish
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
