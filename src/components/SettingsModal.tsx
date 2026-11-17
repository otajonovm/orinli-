import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Database,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { FieldType, LevelType, UserSettings } from '../types';
import { FIELD_LABELS } from '../data/writingTemplates';
import { apiStatus } from '../api/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDatabase: () => void;
  totalWords: number;
  totalBooks: number;
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  onImportFrequencies: (
    rows: Array<{ lemma: string; pos: string; frequency: number }>
  ) => void;
  importedCount: number;
  /** If true, render as full page instead of modal */
  asPage?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetDatabase,
  totalWords,
  totalBooks,
  settings,
  onUpdateSettings,
  onImportFrequencies,
  importedCount,
  asPage = false,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [bncLabel, setBncLabel] = useState('BNC: ulanmagan');
  const [geminiOk, setGeminiOk] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  useEffect(() => {
    if (!isOpen && !asPage) return;
    apiStatus().then((s) => {
      setBncLabel(s.bnc.labelUz);
      setGeminiOk(s.gemini);
    });
  }, [isOpen, asPage]);

  if (!isOpen && !asPage) return null;

  const update = (patch: Partial<UserSettings>) => {
    onUpdateSettings({ ...settings, ...patch });
  };

  const handleCsv = async (file: File) => {
    setImportMsg('');
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      const rows: Array<{ lemma: string; pos: string; frequency: number }> = [];
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(/[,;\t]/).map((p) => p.trim());
        if (i === 0 && /lemma/i.test(parts[0])) continue;
        const lemma = parts[0];
        const pos = parts[1] || 'unknown';
        const frequency = Number(parts[2]);
        if (!lemma || Number.isNaN(frequency)) continue;
        rows.push({ lemma: lemma.toLowerCase(), pos, frequency });
      }
      if (rows.length === 0) {
        setImportMsg('CSV o‘qilmadi. Format: lemma,pos,frequency');
        return;
      }
      onImportFrequencies(rows);
      setImportMsg(`${rows.length} ta lemma import qilindi.`);
    } catch (e) {
      console.error('[CSV import]', e);
      setImportMsg('Faylni o‘qib bo‘lmadi.');
    }
  };

  const body = (
    <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
      {/* Level & field */}
      <section className="bg-white rounded-2xl p-4 border border-[#0F1C2E]/5 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1C2E]/50">
          Shaxsiy sozlamalar
        </span>
        <label className="block space-y-1">
          <span className="font-semibold text-[#0F1C2E]/70">Daraja</span>
          <select
            value={settings.level}
            onChange={(e) => update({ level: e.target.value as LevelType })}
            className="w-full h-10 rounded-xl border border-[#0F1C2E]/12 px-3 bg-[#F6F1E8]/50"
          >
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="font-semibold text-[#0F1C2E]/70">Asosiy soha</span>
          <select
            value={settings.field}
            onChange={(e) => update({ field: e.target.value as FieldType })}
            className="w-full h-10 rounded-xl border border-[#0F1C2E]/12 px-3 bg-[#F6F1E8]/50"
          >
            {(Object.keys(FIELD_LABELS) as FieldType[]).map((k) => (
              <option key={k} value={k}>
                {FIELD_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Data sources */}
      <section className="bg-white rounded-2xl p-4 border border-[#0F1C2E]/5 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1C2E]/50">
          Ma’lumot manbalari
        </span>

        <ToggleRow
          label="Kitoblar bazasi"
          hint={`${totalWords} so‘z · ${totalBooks} kitob`}
          checked={settings.providers.books}
          status="Faol"
          statusOk
          onChange={(v) =>
            update({ providers: { ...settings.providers, books: v } })
          }
        />
        <ToggleRow
          label="AI (Gemini)"
          hint={geminiOk ? 'Server kaliti sozlangan' : 'GEMINI_API_KEY yo‘q — mahalliy rejim'}
          checked={settings.providers.ai}
          status={geminiOk ? 'Ulangan' : 'Mahalliy'}
          statusOk={geminiOk}
          onChange={(v) =>
            update({ providers: { ...settings.providers, ai: v } })
          }
        />
        <ToggleRow
          label="BNC"
          hint="Tashqi korpus hali ulanmagan. Kalitlar: BNC_API_URL, BNC_API_KEY"
          checked={settings.providers.bnc}
          status={bncLabel}
          statusOk={false}
          disabled
          onChange={() => {}}
        />

        <div className="pt-1 space-y-2">
          <label className="w-full h-10 rounded-xl border border-dashed border-[#0F1C2E]/20 flex items-center justify-center gap-2 cursor-pointer hover:bg-[#F6F1E8] font-semibold text-[#0F1C2E]/70">
            <Upload className="w-3.5 h-3.5" />
            Chastota ro‘yxatini import (CSV)
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCsv(f);
              }}
            />
          </label>
          <p className="text-[11px] text-[#0F1C2E]/50">
            Format: lemma,pos,frequency. Import: {importedCount} ta.
            {importMsg && <span className="block text-[#1F7A6B] mt-0.5">{importMsg}</span>}
          </p>
        </div>
      </section>

      {/* Auth placeholder */}
      <section className="bg-white rounded-2xl p-4 border border-[#0F1C2E]/5 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-[#0F1C2E]">
          <User className="w-4 h-4 text-[#1F7A6B]" />
          Hisob (keyingi bosqich)
        </div>
        <p className="text-[#0F1C2E]/60 leading-relaxed">
          Hozircha ma’lumotlar shu qurilmada saqlanadi. Keyinroq Supabase yoki boshqa baza
          ulanishi mumkin — interfeys o‘zgarmaydi.
        </p>
        <button
          disabled
          className="w-full h-10 rounded-xl bg-[#0F1C2E]/10 text-[#0F1C2E]/40 font-bold cursor-not-allowed"
        >
          Kirish / Ro‘yxatdan o‘tish
        </button>
      </section>

      {/* Privacy */}
      <section className="bg-white rounded-2xl p-4 border border-[#0F1C2E]/5 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-[#0F1C2E]">
          <ShieldCheck className="w-4 h-4 text-[#1F7A6B]" />
          Maxfiylik
        </div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.privacyLocalOnly}
            onChange={(e) => update({ privacyLocalOnly: e.target.checked })}
            className="mt-0.5"
          />
          <span className="text-[#0F1C2E]/70 leading-relaxed">
            Kitoblar va qoralamalar asosan shu qurilmada qolsin. To‘liq kitob hech qachon
            eksport qilinmaydi — faqat qisqa misollar (≤ 200 belgi).
          </span>
        </label>
      </section>

      {/* Reset */}
      <section className="bg-white rounded-2xl p-4 border border-[#0F1C2E]/5 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1C2E]/50">
          Bazani boshqarish
        </span>
        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Bazani tozalash
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Barcha ma’lumotlarni o‘chirmoqchimisiz?
            </div>
            <p className="text-[11px] text-rose-800">
              So‘zlar bazasi, kitoblar, qoralamalar va progress tozalanadi.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onResetDatabase();
                  setShowConfirmReset(false);
                  if (!asPage) onClose();
                }}
                className="flex-1 py-2 rounded-lg bg-rose-600 text-white font-bold"
              >
                Ha, tozalash
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2 rounded-lg bg-white border border-rose-200 font-semibold"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  if (asPage) {
    return (
      <div className="flex-1 max-w-xl mx-auto w-full flex flex-col pb-24 md:pb-10">
        <div className="px-5 pt-6 pb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#1F7A6B]" />
          <h2 className="text-xl font-black">Sozlamalar</h2>
        </div>
        {body}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1C2E]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#F6F1E8] w-full max-w-lg sm:max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#0F1C2E]/10">
        <div className="px-5 py-4 bg-white border-b border-[#0F1C2E]/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#1F7A6B]" />
            <h2 className="text-base font-bold">Sozlamalar</h2>
          </div>
          <button
            onClick={() => {
              setShowConfirmReset(false);
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-[#0F1C2E]/5"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {body}
      </div>
    </div>
  );
};

function ToggleRow({
  label,
  hint,
  checked,
  status,
  statusOk,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  status: string;
  statusOk: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="p-3 rounded-xl bg-[#F6F1E8]/80 border border-[#0F1C2E]/8 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-[#0F1C2E]">{label}</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              statusOk
                ? 'bg-[#1F7A6B]/15 text-[#1F7A6B]'
                : 'bg-[#0F1C2E]/8 text-[#0F1C2E]/55'
            }`}
          >
            {status}
          </span>
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
        </div>
      </div>
      <p className="text-[11px] text-[#0F1C2E]/55 leading-relaxed">{hint}</p>
    </div>
  );
}
