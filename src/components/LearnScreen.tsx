import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookMarked,
  HelpCircle,
  X,
  Loader2,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { WordRecord } from '../types';

interface LearnScreenProps {
  wordsDb: Record<string, WordRecord>;
  onWordAnswered: (lemma: string, isCorrect: boolean) => void;
  onOpenUpload: () => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  wordsDb,
  onWordAnswered,
  onOpenUpload,
}) => {
  const words = Object.values(wordsDb);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Check quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // AI Helper Sheet state
  const [isHelperOpen, setIsHelperOpen] = useState(false);
  const [helperLoading, setHelperLoading] = useState(false);
  const [helperResponse, setHelperResponse] = useState<string | null>(null);
  const [helperPromptType, setHelperPromptType] = useState<string | null>(null);

  // Reset quiz states when moving to next word
  useEffect(() => {
    setSelectedOption(null);
    setIsChecked(false);
    setIsCorrect(false);
    setHelperResponse(null);
    setHelperPromptType(null);
  }, [currentIndex]);

  if (words.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-[#1F7A6B]/10 text-[#1F7A6B] flex items-center justify-center mb-4">
          <BookMarked className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#0F1C2E]">Bazada so‘zlar yo‘q</h3>
        <p className="text-xs text-[#0F1C2E]/60 max-w-xs mt-1">
          Darslarni boshlash uchun avval bitta kitob yoki matn yuklab, bazani shakllantiring.
        </p>
        <button
          onClick={onOpenUpload}
          className="mt-5 px-5 py-3 rounded-2xl bg-[#0F1C2E] text-white font-semibold text-xs shadow-sm hover:bg-[#0F1C2E]/90"
        >
          Kitob yuklash
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex % words.length];

  // Speech pronunciation
  const playAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentWord.lemma);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === currentWord.check.answerIndex;
    setIsCorrect(correct);
    setIsChecked(true);
    onWordAnswered(currentWord.lemma, correct);
  };

  const handleNextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // AI Helper trigger
  const requestAiHelp = async (type: 'simplify' | 'another_example' | 'quiz_me') => {
    setHelperPromptType(type);
    setHelperLoading(true);
    setHelperResponse(null);

    try {
      const response = await fetch('/api/word-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: currentWord,
          questionType: type,
        }),
      });

      if (!response.ok) {
        throw new Error('AI yordamchi javob bera olmadi');
      }

      const data = await response.json();
      setHelperResponse(data.responseUz);
    } catch {
      // Fallback
      if (type === 'simplify') {
        setHelperResponse(
          `"${currentWord.lemma}" so‘zini o‘zbekcha eng sodda tushunish: ${currentWord.meaningUz} Kitobingizdagi misol orqali uning asl o‘rnini ko‘rishingiz mumkin.`
        );
      } else if (type === 'another_example') {
        setHelperResponse(
          `Qo‘shimcha misol: "Always pay attention to ${currentWord.lemma} when reading." (O‘qiyotganda doim ${currentWord.lemma} ga e’tibor bering).`
        );
      } else {
        setHelperResponse(
          `Tezkor savol: "${currentWord.lemma}" so‘zini o‘zingiz bir jumlada ishlata olasizmi? Bu xotirada eng mustahkam saqlanish usulidir.`
        );
      }
    } finally {
      setHelperLoading(false);
    }
  };

  // Highlight word in excerpt
  const renderExcerpt = (text: string, lemma: string) => {
    const parts = text.split(new RegExp(`(\\b${lemma}\\w*\\b)`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase().startsWith(lemma.toLowerCase()) ? (
            <span
              key={i}
              className="bg-[#E2A13A]/25 text-[#0F1C2E] font-bold px-1 py-0.5 rounded-md"
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const masteryLabels = ['Yangi', 'Boshlang‘ich', 'O‘rta', 'Mustahkam'];
  const masteryColors = ['bg-slate-200', 'bg-amber-400', 'bg-teal-500', 'bg-emerald-600'];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Top Header Strip: Progress Bar and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#0F1C2E]/5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold text-[#0F1C2E] tabular-nums">
            So‘z {currentIndex + 1} / {words.length}
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-2.5 h-2.5 rounded-full ${
                  currentWord.mastery >= level ? masteryColors[currentWord.mastery] : 'bg-[#0F1C2E]/10'
                }`}
                title={`O‘zlashtirish darajasi: ${masteryLabels[currentWord.mastery]}`}
              />
            ))}
            <span className="text-xs text-[#0F1C2E]/50 font-medium ml-1">
              ({masteryLabels[currentWord.mastery]})
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsHelperOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-[#1F7A6B]/10 text-[#1F7A6B] hover:bg-[#1F7A6B]/20 transition-colors font-bold text-xs self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-[#E2A13A]" />
          <span>AI Yordamchi</span>
        </button>
      </div>

      {/* Main Responsive Layout (Desktop 2-column, Mobile 1-column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Word Definition & Book Context (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#0F1C2E]/5 shadow-xs space-y-5">
            {/* Word, POS, Band & Pronunciation */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-3xl sm:text-4xl font-black text-[#0F1C2E] tracking-tight">
                    {currentWord.lemma}
                  </h2>
                  <button
                    onClick={playAudio}
                    className="p-2 rounded-full text-[#1F7A6B] hover:bg-[#1F7A6B]/10 active:scale-95 transition-all"
                    title="Talaffuzni tinglash"
                    aria-label="Talaffuz"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-[#0F1C2E]/60">
                  <span className="font-bold text-[#1F7A6B]">{currentWord.pos}</span>
                  <span>·</span>
                  <span className="font-semibold">{currentWord.band} so‘z</span>
                  <span>·</span>
                  <span className="italic text-[#0F1C2E]/70">{currentWord.glossEn}</span>
                </div>
              </div>

              {currentWord.isEasilyConfused && (
                <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold">
                  Omofon diqqat
                </span>
              )}
            </div>

            {/* Simple Uzbek Meaning */}
            <div className="p-5 rounded-2xl bg-[#F6F1E8]/80 border border-[#0F1C2E]/5">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#0F1C2E]/50 block mb-1">
                Asl ma’nosi
              </span>
              <p className="text-base sm:text-lg font-bold text-[#0F1C2E] leading-snug">
                {currentWord.meaningUz}
              </p>
            </div>

            {/* Excerpt labeled "Kitobingizdan" */}
            {currentWord.examples && currentWord.examples[0] && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1F7A6B] flex items-center gap-1.5">
                    <BookMarked className="w-4 h-4" />
                    Kitobingizdan
                  </span>
                  <span className="text-xs text-[#0F1C2E]/50 truncate max-w-[200px]">
                    {currentWord.examples[0].sourceName}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F6F1E8] border border-[#0F1C2E]/5 text-xs sm:text-sm text-[#0F1C2E] leading-relaxed italic">
                  "{renderExcerpt(currentWord.examples[0].text, currentWord.lemma)}"
                </div>
              </div>
            )}

            {/* Nega kerak? (Why useful) */}
            {currentWord.whyUseful && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-[#0F1C2E]/50 block uppercase tracking-wider">
                  Nega kerak?
                </span>
                <p className="text-xs sm:text-sm text-[#0F1C2E]/80 leading-relaxed font-medium">
                  {currentWord.whyUseful}
                </p>
              </div>
            )}

            {/* Collocations */}
            {currentWord.collocations && currentWord.collocations.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-[#0F1C2E]/50 block uppercase tracking-wider">
                  Kollokatsiyalar (birga keluvchi iboralar):
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentWord.collocations.map((col, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-[#F6F1E8] text-xs font-semibold text-[#0F1C2E]"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Quiz & Desktop AI Assistance (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quiz Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#0F1C2E]/5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E2A13A]/15 text-[#E2A13A] flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#0F1C2E] uppercase tracking-wider">
                Sinov savoli
              </h4>
            </div>

            <p className="text-sm font-semibold text-[#0F1C2E] leading-relaxed">
              {currentWord.check.questionUz}
            </p>

            {/* Options */}
            <div className="space-y-2.5">
              {currentWord.check.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let btnStyle = 'bg-[#F6F1E8] border-[#0F1C2E]/10 text-[#0F1C2E] hover:border-[#1F7A6B]/50';

                if (isChecked) {
                  if (idx === currentWord.check.answerIndex) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-400 text-rose-950 line-through';
                  } else {
                    btnStyle = 'bg-white/60 border-slate-200 text-slate-400';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-[#0F1C2E] text-white border-[#0F1C2E] shadow-xs';
                }

                return (
                  <button
                    key={idx}
                    disabled={isChecked}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all active:scale-[0.99] ${btnStyle}`}
                  >
                    <span className="inline-block w-5 font-bold mr-1.5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback Area */}
            {isChecked && (
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm space-y-1.5 animate-in zoom-in-95 duration-200 ${
                  isCorrect
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Tasdiqlandi! +15 XP</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span>Yana urinib ko‘ring</span>
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed pt-0.5">
                  {currentWord.check.explainUz}
                </p>
              </div>
            )}

            {/* Action Button: Tekshirish vs Keyingi */}
            <div className="pt-2">
              {!isChecked ? (
                <button
                  onClick={handleCheck}
                  disabled={selectedOption === null}
                  className="w-full h-12 sm:h-13 rounded-2xl bg-[#0F1C2E] text-white font-bold text-sm sm:text-base disabled:opacity-40 hover:bg-[#0F1C2E]/90 active:scale-[0.98] transition-all shadow-xs"
                >
                  Tekshirish
                </button>
              ) : (
                <button
                  onClick={handleNextWord}
                  className="w-full h-12 sm:h-13 rounded-2xl bg-[#1F7A6B] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#185e52] active:scale-[0.98] transition-all shadow-md"
                >
                  <span>Keyingi so‘z</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Helper Bottom Sheet / Modal */}
      {isHelperOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F1C2E]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#F6F1E8] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#0F1C2E]/10 animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle & Header */}
            <div className="pt-3 pb-3 px-5 sm:px-6 flex flex-col items-center border-b border-[#0F1C2E]/5 bg-white">
              <div className="sm:hidden w-10 h-1 bg-[#0F1C2E]/20 rounded-full mb-3" />
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E2A13A]/15 text-[#E2A13A] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0F1C2E]">
                    AI Yordamchi: "{currentWord.lemma}"
                  </h3>
                </div>
                <button
                  onClick={() => setIsHelperOpen(false)}
                  className="p-1.5 rounded-full text-[#0F1C2E]/50 hover:text-[#0F1C2E] hover:bg-[#0F1C2E]/5"
                  aria-label="Yopish"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Triggers */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#0F1C2E]/60 uppercase tracking-wider block">
                  Nimani bilmoqchisiz?
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => requestAiHelp('simplify')}
                    disabled={helperLoading}
                    className={`p-3.5 rounded-2xl text-left text-xs sm:text-sm font-semibold border transition-all flex items-center gap-2.5 ${
                      helperPromptType === 'simplify'
                        ? 'bg-[#1F7A6B] text-white border-[#1F7A6B]'
                        : 'bg-white border-[#0F1C2E]/10 text-[#0F1C2E] hover:border-[#1F7A6B]/50'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4 text-[#E2A13A] shrink-0" />
                    <span>Yana soddaroq tushuntir</span>
                  </button>
                  <button
                    onClick={() => requestAiHelp('another_example')}
                    disabled={helperLoading}
                    className={`p-3.5 rounded-2xl text-left text-xs sm:text-sm font-semibold border transition-all flex items-center gap-2.5 ${
                      helperPromptType === 'another_example'
                        ? 'bg-[#1F7A6B] text-white border-[#1F7A6B]'
                        : 'bg-white border-[#0F1C2E]/10 text-[#0F1C2E] hover:border-[#1F7A6B]/50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-[#1F7A6B] shrink-0" />
                    <span>Boshqa misol ber</span>
                  </button>
                  <button
                    onClick={() => requestAiHelp('quiz_me')}
                    disabled={helperLoading}
                    className={`p-3.5 rounded-2xl text-left text-xs sm:text-sm font-semibold border transition-all flex items-center gap-2.5 ${
                      helperPromptType === 'quiz_me'
                        ? 'bg-[#1F7A6B] text-white border-[#1F7A6B]'
                        : 'bg-white border-[#0F1C2E]/10 text-[#0F1C2E] hover:border-[#1F7A6B]/50'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-[#E2A13A] shrink-0" />
                    <span>Meni tekshir</span>
                  </button>
                </div>
              </div>

              {/* Helper Answer Output */}
              {helperLoading && (
                <div className="bg-white rounded-2xl p-5 text-center space-y-2 border border-[#0F1C2E]/5">
                  <Loader2 className="w-6 h-6 text-[#1F7A6B] animate-spin mx-auto" />
                  <p className="text-xs font-medium text-[#0F1C2E]/60">
                    O‘zbek tilida tushuntirish tayyorlanmoqda...
                  </p>
                </div>
              )}

              {helperResponse && (
                <div className="bg-white rounded-2xl p-4.5 border border-[#0F1C2E]/5 space-y-2 animate-in zoom-in-95 duration-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F7A6B] block">
                    AI Javobi:
                  </span>
                  <p className="text-xs sm:text-sm text-[#0F1C2E] leading-relaxed whitespace-pre-line font-medium">
                    {helperResponse}
                  </p>
                </div>
              )}

              <button
                onClick={() => setIsHelperOpen(false)}
                className="w-full h-12 rounded-2xl bg-[#0F1C2E] text-white text-xs sm:text-sm font-bold hover:bg-[#0F1C2E]/90"
              >
                Tushunarli, darsga qaytish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
