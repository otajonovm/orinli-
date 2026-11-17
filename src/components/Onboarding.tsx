import React from 'react';
import { BookPlus, FileText, Sparkles, ShieldCheck, ArrowRight, Layers, Globe } from 'lucide-react';

interface OnboardingProps {
  onUploadClick: () => void;
  onPasteClick: () => void;
  onSampleClick: () => void;
  isLoadingSample?: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  onUploadClick,
  onPasteClick,
  onSampleClick,
  isLoadingSample = false,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      <div className="w-full bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#0F1C2E]/5 space-y-8">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#1F7A6B]/10 text-[#1F7A6B] flex items-center justify-center mx-auto">
            <BookPlus className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[#0F1C2E] tracking-tight leading-tight">
            WriteTechAI — avval so‘zlar bazasini tuzamiz
          </h2>
          <p className="text-xs sm:text-base text-[#0F1C2E]/70 leading-relaxed">
            Kitob yuklang yoki matn joylashtiring: AI so‘zlarni bazaga yozadi. Keyin yozish, kollokatsiya va takrorlashdan foydalanasiz. BNC hozircha ulanmagan.
          </p>
        </div>

        {/* 3 Action Options (3-column on desktop, stacked on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Option 1: File Upload */}
          <div
            onClick={onUploadClick}
            className="p-6 rounded-2xl bg-[#0F1C2E] text-white space-y-3 cursor-pointer hover:bg-[#0F1C2E]/90 active:scale-[0.98] transition-all flex flex-col justify-between group shadow-sm"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 text-[#E2A13A] flex items-center justify-center">
                <BookPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Kitob yuklash</h3>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  .TXT, .PDF yoki .EPUB formatidagi kitoblarni avtomatik tahlil qiling.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#E2A13A]">
              <span>Fayl tanlash</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Option 2: Paste Text */}
          <div
            onClick={onPasteClick}
            className="p-6 rounded-2xl bg-[#F6F1E8] border border-[#0F1C2E]/10 space-y-3 cursor-pointer hover:bg-[#F0EAE1] active:scale-[0.98] transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white text-[#1F7A6B] flex items-center justify-center shadow-2xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F1C2E]">Matn joylashtirish</h3>
                <p className="text-xs text-[#0F1C2E]/70 mt-1 leading-relaxed">
                  Kitobdan biror bob yoki qiziqarli parchani nusxalab qo‘ying.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#1F7A6B]">
              <span>Matn kiritish</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Option 3: Ready Sample */}
          <div
            onClick={onSampleClick}
            className={`p-6 rounded-2xl bg-white border border-[#1F7A6B]/30 space-y-3 cursor-pointer hover:border-[#1F7A6B] active:scale-[0.98] transition-all flex flex-col justify-between group ${
              isLoadingSample ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#1F7A6B]/10 text-[#1F7A6B] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#E2A13A]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F1C2E]">Namuna bilan ko‘rish</h3>
                <p className="text-xs text-[#0F1C2E]/70 mt-1 leading-relaxed">
                  Maya hikoyasi bilan dastur qanday ishlashini 1 bosishda sinab ko‘ring.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#1F7A6B]">
              <span>{isLoadingSample ? 'Yuklanmoqda...' : 'Namunani yuklash'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Notes & Privacy Guarantee */}
        <div className="pt-6 border-t border-[#0F1C2E]/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#0F1C2E]/60">
          <p className="text-center sm:text-left">
            Keyin BNC va boshqa xalqaro dasturlarni xuddi shu bazaga ulaymiz.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#1F7A6B] font-semibold shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#1F7A6B]" />
            <span>Kitoblaringiz shu qurilmada qoladi.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
