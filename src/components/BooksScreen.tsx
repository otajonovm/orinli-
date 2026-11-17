import React from 'react';
import { BookOpen, BookPlus, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import { BookRecord, WordRecord } from '../types';

interface BooksScreenProps {
  books: BookRecord[];
  wordsDb: Record<string, WordRecord>;
  onOpenUpload: () => void;
}

export const BooksScreen: React.FC<BooksScreenProps> = ({
  books,
  wordsDb,
  onOpenUpload,
}) => {
  const allWords = Object.values(wordsDb);

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F1C2E] tracking-tight">
            So‘zlar / Kitoblarim
          </h2>
          <p className="text-xs sm:text-sm text-[#0F1C2E]/60 mt-1">
            So‘zlar bazasini boyitgan shaxsiy kitoblar, matnlar va takrorlash
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="h-11 px-4 rounded-2xl bg-[#0F1C2E] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs hover:bg-[#0F1C2E]/90 active:scale-95 transition-all self-start sm:self-auto"
        >
          <BookPlus className="w-4 h-4 text-[#E2A13A]" />
          Kitob qo‘shish
        </button>
      </div>

      {/* Database Context Banner */}
      <div className="bg-[#1F7A6B]/10 rounded-3xl p-5 border border-[#1F7A6B]/20 space-y-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1F7A6B]">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Shaxsiy kitoblar bazasi (hozir faol)</span>
        </div>
        <p className="text-xs sm:text-sm text-[#0F1C2E]/75 leading-relaxed">
          BNC ulanmaguncha har bir yuklangan kitob so‘zlar bazasini boyitadi. Har xil kitobdan olingan qisqa namunalar bir so‘z kartochkasida to‘planadi (≤ 200 belgi).
        </p>
        <p className="text-[11px] sm:text-xs text-[#0F1C2E]/55 italic pt-1">
          * Avval kitobning bosh qismidan so‘zlar olindi. Kitoblaringiz shu qurilmada qoladi.
        </p>
      </div>

      {/* Books Grid (Desktop 3-column / 2-column, Mobile 1-column) */}
      {books.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-[#0F1C2E]/5 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F1E8] text-[#0F1C2E]/40 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#0F1C2E]">Hozircha kitoblar yo‘q</h3>
          <p className="text-xs sm:text-sm text-[#0F1C2E]/60 leading-relaxed">
            Birinchi kitobingizni yuklang va AI so‘zlarni bazaga kiritadi.
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-2 h-11 px-5 rounded-2xl bg-[#0F1C2E] text-white text-xs font-bold hover:bg-[#0F1C2E]/90"
          >
            Kitob yuklash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book) => {
            const bookWords = allWords.filter((w) => w.bookIds.includes(book.id));

            return (
              <div
                key={book.id}
                className="bg-white rounded-3xl p-6 border border-[#0F1C2E]/5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F6F1E8] text-[#1F7A6B] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] text-[#0F1C2E]/40 tabular-nums">
                      {book.addedAt ? new Date(book.addedAt).toLocaleDateString() : 'Bugun'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#0F1C2E] leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#0F1C2E]/60 mt-1">
                      <span>{book.wordsExtractedCount} ta so‘z olindi</span>
                      <span>·</span>
                      <span className="font-bold text-[#1F7A6B]">
                        Daraja: {book.levelGuess || 'B1'}
                      </span>
                    </div>
                  </div>

                  {/* Excerpt preview if available */}
                  {book.truncatedSnippet && (
                    <p className="text-xs text-[#0F1C2E]/70 bg-[#F6F1E8]/70 p-3.5 rounded-2xl line-clamp-3 italic leading-relaxed">
                      "{book.truncatedSnippet}"
                    </p>
                  )}
                </div>

                {/* Words preview */}
                {bookWords.length > 0 && (
                  <div className="pt-2 border-t border-[#0F1C2E]/5">
                    <span className="text-[10px] font-bold text-[#0F1C2E]/50 block mb-2 uppercase tracking-wider">
                      Ushbu kitobdan olingan so‘zlar:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {bookWords.slice(0, 6).map((word) => (
                        <span
                          key={word.lemma}
                          className="px-2.5 py-1 rounded-xl bg-[#F6F1E8] text-xs font-semibold text-[#0F1C2E]"
                        >
                          {word.lemma}
                        </span>
                      ))}
                      {bookWords.length > 6 && (
                        <span className="px-2 py-1 text-xs text-[#0F1C2E]/50 font-medium">
                          +{bookWords.length - 6} yana
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
