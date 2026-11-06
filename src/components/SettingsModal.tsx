import React, { useState } from 'react';
import { X, Database, ShieldCheck, Globe, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDatabase: () => void;
  totalWords: number;
  totalBooks: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetDatabase,
  totalWords,
  totalBooks,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1C2E]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F6F1E8] w-full max-w-lg sm:max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#0F1C2E]/10 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#0F1C2E]/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#1F7A6B]" />
            <h2 className="text-base font-bold text-[#0F1C2E]">
              Dastur Sozlamalari va Baza
            </h2>
          </div>
          <button
            onClick={() => {
              setShowConfirmReset(false);
              onClose();
            }}
            className="p-1.5 rounded-full text-[#0F1C2E]/50 hover:text-[#0F1C2E] hover:bg-[#0F1C2E]/5"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Section 1: Data Strategy & BNC Adapter */}
          <div className="bg-white rounded-2xl p-4 border border-[#0F1C2E]/5 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1C2E]/50 block">
              Ma’lumotlar arxitekturasi
            </span>

            {/* Active Database Status */}
            <div className="p-3 rounded-xl bg-[#1F7A6B]/10 border border-[#1F7A6B]/20 flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#1F7A6B] mt-1 shrink-0" />
              <div>
                <p className="font-bold text-[#0F1C2E] text-xs">
                  Asosiy baza: Kitoblar (hozir faol)
                </p>
                <p className="text-[11px] text-[#0F1C2E]/70 mt-0.5 leading-relaxed">
                  Hozirda barcha darslar foydalanuvchi yuklagan kitoblar va matnlardan tuzilgan WordDatabase asosida ishlamoqda ({totalWords} ta so‘z, {totalBooks} ta manba).
                </p>
              </div>
            </div>

            {/* BNC Adapter - Pending */}
            <div className="p-3 rounded-xl bg-[#F6F1E8] border border-[#0F1C2E]/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F1C2E]">
                  BNC: ulanmagan — keyingi bosqich
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#0F1C2E]/10 text-[10px] font-bold text-[#0F1C2E]/60">
                  Rejada
                </span>
              </div>

              {/* Disabled Button Required by Prompt */}
              <button
                disabled
                className="w-full h-10 rounded-xl bg-[#0F1C2E]/15 text-[#0F1C2E]/40 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <span>BNC ni ulash</span>
              </button>

              {/* Exact Helper Text Required by Prompt */}
              <p className="text-[11px] text-[#0F1C2E]/60 leading-relaxed italic">
                BNC ulagach, xalqaro chastota va ruxsat etilgan namunalar shu bazani boyitadi. Dars ekranlari o‘zgarmaydi.
              </p>
            </div>
          </div>

          {/* Section 2: IntegrationsAdapter (Placeholder only as required) */}
          <div className="bg-white rounded-2xl p-4 border border-[#0F1C2E]/5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1C2E]/50 block">
              Xalqaro integratsiyalar (keyingi bosqich)
            </span>
            <p className="text-[#0F1C2E]/70 leading-relaxed text-xs">
              BNC dan keyin kerakli xalqaro dasturlar shu ulagich orqali qo‘shiladi.
            </p>
            <div className="pt-1 flex items-center gap-1 text-[11px] text-[#0F1C2E]/50">
              <Globe className="w-3.5 h-3.5" />
              <span>Tashqi lug‘atlar yoki feyk API lar ulanmagan.</span>
            </div>
          </div>

          {/* Section 3: Privacy & Copyright */}
          <div className="bg-white rounded-2xl p-4 border border-[#0F1C2E]/5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#0F1C2E]">
              <ShieldCheck className="w-4 h-4 text-[#1F7A6B]" />
              <span>Maxfiylik va mualliflik huquqi</span>
            </div>
            <p className="text-[#0F1C2E]/70 leading-relaxed text-xs">
              Kitoblaringiz shu qurilmada qoladi. Darslarda faqat qisqa matn parchalari ("Kitobingizdan") ko‘rsatiladi. To‘liq kitob hech qachon tashqariga uzatilmaydi yoki saqlanmaydi.
            </p>
          </div>

          {/* Section 4: Reset / Clear Database */}
          <div className="bg-white rounded-2xl p-4 border border-[#0F1C2E]/5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1C2E]/50 block">
              Bazani boshqarish
            </span>

            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Bazani tozalash va qayta o‘rnatish
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-900 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Barcha so‘zlar va kitoblarni o‘chirmoqchimisiz?</span>
                </div>
                <p className="text-[11px] text-rose-800">
                  WordDatabase va o‘rganish progressi to‘liq tozalanadi. Siz dasturni yangitdan boshlaysiz.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      onResetDatabase();
                      setShowConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 py-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
                  >
                    Ha, tozalash
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-2 rounded-lg bg-white border border-rose-200 text-rose-900 font-semibold"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
