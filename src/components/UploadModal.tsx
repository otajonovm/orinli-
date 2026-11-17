import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { ExtractionResult } from '../types';
import { SAMPLE_TEXT } from '../data/wordDatabase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (result: ExtractionResult, textSnippet: string) => void;
  initialMode?: 'upload' | 'paste';
  totalWordsInLibrary: number;
  onStartLearning: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  initialMode = 'upload',
  totalWordsInLibrary,
  onStartLearning,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>(initialMode);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [bookTitle, setBookTitle] = useState('');

  // Result state
  const [result, setResult] = useState<{
    bookTitle: string;
    newWordsCount: number;
    totalWordsCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setResult(null);
    setErrorMsg(null);
    setIsProcessing(false);
    setPastedText('');
    setBookTitle('');
  };

  const processText = async (text: string, title?: string) => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/extract-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          title: title || 'Kitobingiz',
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        console.error('[Upload] extract-words HTTP xato:', response.status, errBody);
        throw new Error('Serverda xatolik yuz berdi');
      }

      const data: ExtractionResult = await response.json();

      if (data._meta?.error) {
        console.error(
          '[Upload] Kitob tahlili xatosi (dev sabab):',
          data._meta.error,
          '| manba:',
          data._meta.source
        );
      } else {
        console.info('[Upload] Tahlil manbasi:', data._meta?.source || 'noma’lum');
      }

      if (data.warningUz && (!data.words || data.words.length === 0)) {
        setErrorMsg(data.warningUz);
        setIsProcessing(false);
        return;
      }

      const assignedTitle = title || data.title || 'Mening kitobim';
      data.title = assignedTitle;

      onImportComplete(data, text.slice(0, 25000));

      setResult({
        bookTitle: assignedTitle,
        newWordsCount: data.words.length,
        totalWordsCount: totalWordsInLibrary + data.words.length,
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(
        'Faylni o‘qish yoki tahlil qilishda xatolik yuz berdi. Iltimos, kitobdan bir bobni to‘g‘ridan-to‘g‘ri nusxalab, "Matnni joylashtirish" bo‘limiga qo‘ying.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = async (file: File) => {
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    setBookTitle(fileName);

    try {
      if (file.name.endsWith('.txt')) {
        const text = await file.text();
        if (!text.trim()) {
          setErrorMsg('Fayl bo‘sh ekan. Iltimos, matnli fayl tanlang.');
          return;
        }
        await processText(text, fileName);
      } else if (file.name.endsWith('.epub') || file.name.endsWith('.pdf')) {
        // Attempt to read text or fallback safely to user prompt
        try {
          const text = await file.text();
          // Extract basic printable ASCII/text strings if available
          const cleanText = text.replace(/[^\x20-\x7E\n\r]/g, ' ').replace(/\s+/g, ' ');
          if (cleanText.length > 200) {
            await processText(cleanText, fileName);
          } else {
            setErrorMsg(
              'PDF/EPUB formatidan toza matn ajratib olinmadi. Iltimos, kitobning biror sahifasi yoki bobini nusxalab, "Matnni joylashtirish" orqali qo‘ying.'
            );
          }
        } catch {
          setErrorMsg(
            'Ushbu formatni ochishda qiyinchilik bo‘ldi. Iltimos, kitobingizdan matn nusxasini oling va shu yerga joylashtiring.'
          );
        }
      } else {
        // Generic text read attempt
        const text = await file.text();
        if (text && text.trim().length > 50) {
          await processText(text, fileName);
        } else {
          setErrorMsg('Iltimos, .txt, .pdf yoki .epub fayl yuklang.');
        }
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(
        'Faylni yuklashda muammo bo‘ldi. Iltimos, bir bobni nusxalab, "Matnni joylashtirish" orqali qo‘ying.'
      );
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setErrorMsg('Iltimos, matn kiriting.');
      return;
    }
    await processText(pastedText, bookTitle.trim() || 'Joylashtirilgan matn');
  };

  const loadSample = async () => {
    setPastedText(SAMPLE_TEXT);
    setBookTitle('Maya va To‘g‘ri So‘z Tanlovi');
    await processText(SAMPLE_TEXT, 'Maya va To‘g‘ri So‘z Tanlovi');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1C2E]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F6F1E8] w-full max-w-lg sm:max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#0F1C2E]/10 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#0F1C2E]/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F1C2E] tracking-tight">
            Kitobni bazaga qo‘shish
          </h2>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 rounded-full text-[#0F1C2E]/50 hover:text-[#0F1C2E] hover:bg-[#0F1C2E]/5 transition-colors"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Result Card */}
          {result ? (
            <div className="bg-white rounded-2xl p-6 text-center space-y-4 border border-[#0F1C2E]/5 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-[#1F7A6B]/15 text-[#1F7A6B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#0F1C2E]">{result.bookTitle}</h3>
                <p className="text-xs text-[#0F1C2E]/60 mt-1">
                  Avval kitobning bosh qismidan so‘zlar olindi.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="bg-[#F6F1E8] rounded-xl p-3 text-center">
                  <span className="text-xs text-[#0F1C2E]/60 block font-medium">Bazaga qo‘shildi</span>
                  <span className="text-xl font-extrabold text-[#1F7A6B] tabular-nums">
                    +{result.newWordsCount} ta
                  </span>
                </div>
                <div className="bg-[#F6F1E8] rounded-xl p-3 text-center">
                  <span className="text-xs text-[#0F1C2E]/60 block font-medium">Kutubxonada jami</span>
                  <span className="text-xl font-extrabold text-[#0F1C2E] tabular-nums">
                    {result.totalWordsCount} ta
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    handleReset();
                    onClose();
                    onStartLearning();
                  }}
                  className="w-full h-12 rounded-xl bg-[#0F1C2E] text-white font-semibold text-sm hover:bg-[#0F1C2E]/90 active:scale-[0.98] transition-all shadow-sm"
                >
                  O‘rganishni boshlash
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-2 text-xs font-semibold text-[#0F1C2E]/70 hover:text-[#0F1C2E]"
                >
                  Yana boshqa kitob yuklash
                </button>
              </div>
            </div>
          ) : isProcessing ? (
            /* Processing State */
            <div className="bg-white rounded-2xl p-8 text-center space-y-4 border border-[#0F1C2E]/5">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#1F7A6B] animate-spin" />
                <Sparkles className="w-4 h-4 text-[#E2A13A] absolute top-1 right-1" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#0F1C2E]">
                  AI kitobingizni bazaga yozayapti…
                </h3>
                <p className="text-xs text-[#0F1C2E]/60">
                  Kerakli so‘zlar, kontekst va ma’nolar ajratib olinmoqda.
                </p>
              </div>
              <div className="text-[11px] text-[#1F7A6B] font-medium bg-[#1F7A6B]/10 py-1.5 px-3 rounded-lg inline-block">
                Bir necha soniya kuting
              </div>
            </div>
          ) : (
            /* Upload / Paste Tabs */
            <>
              {/* Tabs */}
              <div className="grid grid-cols-2 p-1 bg-[#0F1C2E]/5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    setErrorMsg(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    activeTab === 'upload'
                      ? 'bg-white text-[#0F1C2E] shadow-xs'
                      : 'text-[#0F1C2E]/60 hover:text-[#0F1C2E]'
                  }`}
                >
                  Fayl yuklash
                </button>
                <button
                  onClick={() => {
                    setActiveTab('paste');
                    setErrorMsg(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    activeTab === 'paste'
                      ? 'bg-white text-[#0F1C2E] shadow-xs'
                      : 'text-[#0F1C2E]/60 hover:text-[#0F1C2E]'
                  }`}
                >
                  Matn joylashtirish
                </button>
              </div>

              {errorMsg && (
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{errorMsg}</p>
                    <button
                      onClick={() => setActiveTab('paste')}
                      className="mt-1.5 underline font-semibold text-amber-950 block"
                    >
                      Matnni to‘g‘ridan-to‘g‘ri joylashtirish
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'upload' ? (
                /* File Picker / Dropzone */
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#1F7A6B] bg-[#1F7A6B]/5'
                        : 'border-[#0F1C2E]/15 bg-white hover:border-[#1F7A6B]/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf,.epub"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFile(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="w-12 h-12 rounded-xl bg-[#F6F1E8] text-[#1F7A6B] flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#0F1C2E]">
                      Faylni bu yerga tashlang yoki tanlang
                    </p>
                    <p className="text-xs text-[#0F1C2E]/60 mt-1">
                      .TXT, .PDF, .EPUB (avvalgi 25 000 belgi olinadi)
                    </p>
                  </div>

                  <button
                    onClick={loadSample}
                    className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#0F1C2E]/10 text-xs font-semibold text-[#1F7A6B] flex items-center justify-center gap-1.5 hover:bg-[#F6F1E8] transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E2A13A]" />
                    Tayyor namuna bilan sinab ko‘rish (Maya hikoyasi)
                  </button>
                </div>
              ) : (
                /* Paste Form */
                <form onSubmit={handlePasteSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1C2E] mb-1">
                      Kitob yoki bob sarlavhasi (ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="Masalan: The Great Gatsby — 1-bob"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[#0F1C2E]/15 text-xs text-[#0F1C2E] focus:outline-none focus:ring-2 focus:ring-[#1F7A6B]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-[#0F1C2E]">
                        Inglizcha matnni joylashtiring
                      </label>
                      <span className="text-[10px] text-[#0F1C2E]/50 tabular-nums">
                        {pastedText.length} belgi
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Kitobingizdan biror parcha yoki bob matnini shu yerga qo‘ying..."
                      className="w-full p-3 bg-white rounded-xl border border-[#0F1C2E]/15 text-xs text-[#0F1C2E] focus:outline-none focus:ring-2 focus:ring-[#1F7A6B] resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPastedText(SAMPLE_TEXT)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#0F1C2E]/10 text-xs font-medium text-[#0F1C2E]/70 hover:text-[#0F1C2E]"
                    >
                      Namunani qo‘yish
                    </button>
                    <button
                      type="submit"
                      disabled={!pastedText.trim()}
                      className="flex-1 py-2 rounded-xl bg-[#0F1C2E] text-white font-semibold text-xs disabled:opacity-50 hover:bg-[#0F1C2E]/90 active:scale-[0.98] transition-all"
                    >
                      Bazaga tahlil qilish
                    </button>
                  </div>
                </form>
              )}

              {/* Privacy Notice */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-[#0F1C2E]/50">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A6B]" />
                  Kitoblaringiz shu qurilmada qoladi.
                </span>
                <span>BNC: keyin ulanadi</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
