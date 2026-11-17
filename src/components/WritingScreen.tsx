import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  PenLine,
  Save,
  Sparkles,
  X,
  BookTemplate,
} from 'lucide-react';
import {
  FieldType,
  LevelType,
  WritingCheckResult,
  WritingDraft,
  WritingIssue,
  WritingTask,
  WritingType,
} from '../types';
import { apiCheckWriting, apiGenerateTask } from '../api/client';
import {
  FIELD_LABELS,
  ISSUE_COLORS,
  ISSUE_TYPE_LABELS,
  SECTION_LABELS,
  templatesForField,
  WRITING_TYPE_LABELS,
} from '../data/writingTemplates';

interface WritingScreenProps {
  drafts: WritingDraft[];
  onSaveDraft: (draft: WritingDraft) => void;
  onWritingChecked: (draft: WritingDraft, result: WritingCheckResult, xpGained: number) => void;
  defaultField: FieldType;
  defaultLevel: LevelType;
  resumeDraftId?: string;
}

type Step = 'setup' | 'plan' | 'write';

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function applyIssue(
  text: string,
  issue: WritingIssue,
  mode: 'accept' | 'ignore'
): { text: string; issues: WritingIssue[] } {
  if (mode === 'ignore') {
    return {
      text,
      issues: [{ ...issue, ignored: true }],
    };
  }
  const before = text.slice(0, issue.start);
  const after = text.slice(issue.end);
  const newText = before + issue.suggestion + after;
  const delta = issue.suggestion.length - (issue.end - issue.start);
  return { text: newText, issues: [{ ...issue, accepted: true, end: issue.start + issue.suggestion.length + (delta > 0 ? 0 : 0) }] };
}

export const WritingScreen: React.FC<WritingScreenProps> = ({
  drafts,
  onSaveDraft,
  onWritingChecked,
  defaultField,
  defaultLevel,
  resumeDraftId,
}) => {
  const resume = resumeDraftId ? drafts.find((d) => d.id === resumeDraftId) : undefined;

  const [step, setStep] = useState<Step>(resume ? 'write' : 'setup');
  const [type, setType] = useState<WritingType>(resume?.type || 'formal_letter');
  const [field, setField] = useState<FieldType>(resume?.field || defaultField);
  const [level, setLevel] = useState<LevelType>(resume?.level || defaultLevel);
  const [withOutline, setWithOutline] = useState(true);
  const [task, setTask] = useState<WritingTask | null>(resume?.task || null);
  const [draftId, setDraftId] = useState(resume?.id || '');
  const [text, setText] = useState(resume?.text || '');
  const [check, setCheck] = useState<WritingCheckResult | null>(resume?.lastCheck || null);
  const [activeIssue, setActiveIssue] = useState<number | null>(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [errorUz, setErrorUz] = useState('');
  const [timerOn, setTimerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  React.useEffect(() => {
    if (!timerOn) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  const visibleIssues = useMemo(
    () => (check?.issues || []).filter((i) => !i.ignored && !i.accepted),
    [check]
  );

  const wordCount = countWords(text);

  const startTask = async () => {
    setLoadingTask(true);
    setErrorUz('');
    try {
      const t = await apiGenerateTask({ type, field, level, withOutline });
      setTask(t);
      const id = `draft-${Date.now()}`;
      setDraftId(id);
      setText('');
      setCheck(null);
      setStep(withOutline && t.outline ? 'plan' : 'write');
      onSaveDraft({
        id,
        type,
        field,
        level,
        task: t,
        text: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      });
    } catch (e) {
      console.error('[Yozish] Vazifa xatosi:', e);
      setErrorUz('Vazifa yaratilmadi. Qayta urinib ko‘ring.');
    } finally {
      setLoadingTask(false);
    }
  };

  const persist = (nextText: string, nextCheck?: WritingCheckResult | null) => {
    if (!task || !draftId) return;
    const existing = drafts.find((d) => d.id === draftId);
    onSaveDraft({
      id: draftId,
      type,
      field,
      level,
      task,
      text: nextText,
      previousScore: existing?.previousScore ?? existing?.lastCheck?.overallScore,
      lastCheck: nextCheck === undefined ? check || undefined : nextCheck || undefined,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: existing?.history || [],
    });
  };

  const runCheck = async () => {
    if (!text.trim()) {
      setErrorUz('Avval matn yozing.');
      return;
    }
    setLoadingCheck(true);
    setErrorUz('');
    setActiveIssue(null);
    try {
      const result = await apiCheckWriting({ text, type, field, level });
      setCheck(result);

      const existing = drafts.find((d) => d.id === draftId);
      const prev = existing?.lastCheck?.overallScore ?? existing?.previousScore;
      let xp = 10;
      if (typeof prev === 'number' && result.overallScore > prev) {
        xp = 10 + Math.min(40, (result.overallScore - prev) * 2);
      } else if (typeof prev !== 'number') {
        xp = 15;
      }

      const draft: WritingDraft = {
        id: draftId || `draft-${Date.now()}`,
        type,
        field,
        level,
        task: task!,
        text,
        previousScore: prev,
        lastCheck: result,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          ...(existing?.history || []),
          { text, score: result.overallScore, checkedAt: new Date().toISOString() },
        ],
      };
      setDraftId(draft.id);
      onWritingChecked(draft, result, xp);
    } catch (e) {
      console.error('[Yozish] Tekshiruv xatosi:', e);
      setErrorUz('Tekshiruv amalga oshmadi. Qayta urinib ko‘ring.');
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleAccept = (idx: number) => {
    if (!check) return;
    const issue = visibleIssues[idx];
    if (!issue) return;
    const globalIdx = check.issues.indexOf(issue);
    const before = text.slice(0, issue.start);
    const after = text.slice(issue.end);
    const newText = before + issue.suggestion + after;
    const delta = issue.suggestion.length - (issue.end - issue.start);

    const newIssues = check.issues.map((iss, i) => {
      if (i === globalIdx) return { ...iss, accepted: true };
      if (iss.start >= issue.end) {
        return { ...iss, start: iss.start + delta, end: iss.end + delta };
      }
      return iss;
    });

    const nextCheck = { ...check, issues: newIssues };
    setText(newText);
    setCheck(nextCheck);
    setActiveIssue(null);
    persist(newText, nextCheck);
  };

  const handleIgnore = (idx: number) => {
    if (!check) return;
    const issue = visibleIssues[idx];
    if (!issue) return;
    const globalIdx = check.issues.indexOf(issue);
    const newIssues = check.issues.map((iss, i) =>
      i === globalIdx ? { ...iss, ignored: true } : iss
    );
    const nextCheck = { ...check, issues: newIssues };
    setCheck(nextCheck);
    setActiveIssue(null);
    persist(text, nextCheck);
  };

  const insertTemplate = (phrase: string) => {
    const next = text ? `${text.trimEnd()}\n${phrase}` : phrase;
    setText(next);
    persist(next);
    setShowTemplates(false);
  };

  const loadDraft = (d: WritingDraft) => {
    setDraftId(d.id);
    setType(d.type);
    setField(d.field);
    setLevel(d.level);
    setTask(d.task);
    setText(d.text);
    setCheck(d.lastCheck || null);
    setStep('write');
    setShowHistory(false);
  };

  const highlightedPreview = useMemo(() => {
    if (!check || visibleIssues.length === 0) return null;
    const sorted = [...visibleIssues].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    sorted.forEach((iss, i) => {
      if (iss.start < cursor) return;
      if (iss.start > cursor) {
        parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, iss.start)}</span>);
      }
      parts.push(
        <button
          key={`i-${i}-${iss.start}`}
          type="button"
          onClick={() => setActiveIssue(i)}
          className="underline decoration-2 underline-offset-2 cursor-pointer bg-transparent border-0 p-0 font-inherit"
          style={{ textDecorationColor: ISSUE_COLORS[iss.type] || '#E2A13A' }}
          title={ISSUE_TYPE_LABELS[iss.type]}
        >
          {text.slice(iss.start, iss.end) || iss.original}
        </button>
      );
      cursor = iss.end;
    });
    if (cursor < text.length) parts.push(<span key="end">{text.slice(cursor)}</span>);
    return parts;
  }, [check, visibleIssues, text]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  /* —— SETUP —— */
  if (step === 'setup') {
    return (
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5 pb-24 md:pb-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#0F1C2E]">Yozish</h2>
            <p className="text-sm text-[#0F1C2E]/60 mt-0.5">
              Rasmiy inglizcha matn yozing — AI tekshiradi, siz o‘rganasiz.
            </p>
          </div>
          {drafts.length > 0 && (
            <button
              onClick={() => setShowHistory(true)}
              className="text-xs font-bold text-[#1F7A6B] px-3 py-2 rounded-xl bg-[#1F7A6B]/10"
            >
              Qoralamalar ({drafts.length})
            </button>
          )}
        </div>

        {showHistory && (
          <div className="bg-white rounded-2xl border border-[#0F1C2E]/8 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Saqlangan qoralamalar</h3>
              <button onClick={() => setShowHistory(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            {drafts.slice(0, 8).map((d) => (
              <button
                key={d.id}
                onClick={() => loadDraft(d)}
                className="w-full text-left p-3 rounded-xl bg-[#F6F1E8] hover:bg-[#F0EAE1] text-xs space-y-0.5"
              >
                <div className="font-bold text-[#0F1C2E]">
                  {WRITING_TYPE_LABELS[d.type]} · {FIELD_LABELS[d.field]}
                </div>
                <div className="text-[#0F1C2E]/55">
                  {d.lastCheck ? `Ball: ${d.lastCheck.overallScore}` : 'Tekshirilmagan'} ·{' '}
                  {new Date(d.updatedAt).toLocaleDateString('uz-UZ')}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-[#0F1C2E]/8 p-5 space-y-5">
          <FieldGroup label="Yozuv turi">
            {(Object.keys(WRITING_TYPE_LABELS) as WritingType[]).map((k) => (
              <Chip key={k} active={type === k} onClick={() => setType(k)}>
                {WRITING_TYPE_LABELS[k]}
              </Chip>
            ))}
          </FieldGroup>

          <FieldGroup label="Soha">
            {(Object.keys(FIELD_LABELS) as FieldType[]).map((k) => (
              <Chip key={k} active={field === k} onClick={() => setField(k)}>
                {FIELD_LABELS[k]}
              </Chip>
            ))}
          </FieldGroup>

          <FieldGroup label="Daraja">
            {(['B1', 'B2', 'C1'] as LevelType[]).map((k) => (
              <Chip key={k} active={level === k} onClick={() => setLevel(k)}>
                {k}
              </Chip>
            ))}
          </FieldGroup>

          <label className="flex items-center gap-2 text-sm text-[#0F1C2E]/80 cursor-pointer">
            <input
              type="checkbox"
              checked={withOutline}
              onChange={(e) => setWithOutline(e.target.checked)}
              className="rounded border-[#0F1C2E]/30"
            />
            Rejalashtirish bosqichi (kontsept-xarita)
          </label>

          {errorUz && (
            <p className="text-sm text-rose-700 bg-rose-50 rounded-xl px-3 py-2">{errorUz}</p>
          )}

          <button
            onClick={startTask}
            disabled={loadingTask}
            className="w-full h-12 rounded-2xl bg-[#1F7A6B] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#185e52] disabled:opacity-60"
          >
            {loadingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Vazifa yaratish
          </button>
        </div>
      </div>
    );
  }

  /* —— PLAN —— */
  if (step === 'plan' && task?.outline) {
    return (
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5 pb-24">
        <button
          onClick={() => setStep('setup')}
          className="text-xs font-semibold text-[#0F1C2E]/60 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Orqaga
        </button>
        <h2 className="text-xl font-black">Rejalashtirish</h2>
        <p className="text-sm text-[#0F1C2E]/65">{task.explanationUz}</p>

        <div className="bg-white rounded-3xl border border-[#0F1C2E]/8 p-5 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#1F7A6B]">Asosiy g‘oya</span>
            <p className="font-semibold mt-1">{task.outline.mainIdea}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[#E2A13A]">Kichik g‘oyalar</span>
            <ul className="mt-2 space-y-1.5">
              {task.outline.subIdeas.map((s, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-[#1F7A6B] font-bold">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[#0F1C2E]/50">Bog‘lovchi so‘zlar</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {task.outline.linkingWords.map((w) => (
                <span key={w} className="px-2.5 py-1 rounded-lg bg-[#F6F1E8] text-xs font-semibold">
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setStep('write')}
          className="w-full h-12 rounded-2xl bg-[#0F1C2E] text-white font-bold flex items-center justify-center gap-2"
        >
          <PenLine className="w-4 h-4" />
          Yozishni boshlash
        </button>
      </div>
    );
  }

  /* —— WRITE (two-column on desktop) —— */
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => setStep('setup')}
          className="text-xs font-semibold text-[#0F1C2E]/60 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Yangi vazifa
        </button>
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#0F1C2E]/70">
            <input
              type="checkbox"
              checked={timerOn}
              onChange={(e) => {
                setTimerOn(e.target.checked);
                if (!e.target.checked) setSeconds(0);
              }}
            />
            <Clock className="w-3.5 h-3.5" />
            Taymer
          </label>
          {timerOn && (
            <span className="font-mono font-bold tabular-nums text-[#E2A13A]">
              {mm}:{ss}
            </span>
          )}
        </div>
      </div>

      {task && (
        <div className="bg-[#0F1C2E] text-white rounded-2xl p-4 text-sm space-y-2">
          <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-[#E2A13A]">
            <span>{WRITING_TYPE_LABELS[type]}</span>
            <span>·</span>
            <span>{FIELD_LABELS[field]}</span>
            <span>·</span>
            <span>{level}</span>
          </div>
          <p className="text-white/90 leading-relaxed">{task.situationEn}</p>
          <p className="text-xs text-white/60">Qabul qiluvchi: {task.recipientEn}</p>
          <ul className="text-xs text-white/75 list-disc pl-4 space-y-0.5">
            {task.requiredPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <p className="text-xs text-[#E2A13A]/90">{task.explanationUz}</p>
          <p className="text-[11px] text-white/50">
            So‘z chegarasi: {task.wordLimit.min}–{task.wordLimit.max}
          </p>
        </div>
      )}

      {errorUz && (
        <p className="text-sm text-rose-700 bg-rose-50 rounded-xl px-3 py-2">{errorUz}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Editor */}
        <div className="bg-white rounded-2xl border border-[#0F1C2E]/8 overflow-hidden flex flex-col min-h-[420px]">
          <div className="px-4 py-2.5 border-b border-[#0F1C2E]/5 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#0F1C2E]/60">Muharrir</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplates((v) => !v)}
                className="text-[11px] font-semibold text-[#1F7A6B] flex items-center gap-1"
              >
                <BookTemplate className="w-3.5 h-3.5" />
                Andozalar
              </button>
              <span
                className={`text-xs font-bold tabular-nums ${
                  task &&
                  (wordCount < task.wordLimit.min || wordCount > task.wordLimit.max)
                    ? 'text-[#E2A13A]'
                    : 'text-[#1F7A6B]'
                }`}
              >
                {wordCount} so‘z
              </span>
            </div>
          </div>

          {showTemplates && (
            <div className="px-3 py-2 border-b border-[#0F1C2E]/5 bg-[#F6F1E8]/80 max-h-40 overflow-y-auto space-y-1">
              {templatesForField(field).map((t) => (
                <button
                  key={t.id}
                  onClick={() => insertTemplate(t.phraseEn)}
                  className="w-full text-left text-[11px] p-2 rounded-lg hover:bg-white"
                >
                  <span className="text-[#0F1C2E]/45 font-bold uppercase text-[9px]">
                    {SECTION_LABELS[t.section]}
                  </span>
                  <div className="font-medium text-[#0F1C2E]">{t.phraseEn}</div>
                  <div className="text-[#0F1C2E]/50">{t.noteUz}</div>
                </button>
              ))}
            </div>
          )}

          {highlightedPreview && check ? (
            <div className="flex-1 p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans text-[#0F1C2E] min-h-[280px]">
              {highlightedPreview}
              <button
                onClick={() => setCheck({ ...check, issues: check.issues.map((i) => ({ ...i, ignored: true })) })}
                className="block mt-3 text-[11px] text-[#0F1C2E]/45 underline"
              >
                Belgilarni yashirish va tahrirlash
              </button>
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                persist(e.target.value);
              }}
              placeholder="Bu yerga rasmiy matningizni yozing…"
              className="flex-1 w-full p-4 text-sm leading-relaxed resize-none outline-none min-h-[280px] bg-transparent"
            />
          )}

          <div className="p-3 border-t border-[#0F1C2E]/5 flex gap-2">
            <button
              onClick={() => {
                persist(text);
              }}
              className="flex-1 h-11 rounded-xl border border-[#0F1C2E]/15 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#F6F1E8]"
            >
              <Save className="w-3.5 h-3.5" />
              Saqlash
            </button>
            <button
              onClick={runCheck}
              disabled={loadingCheck}
              className="flex-[1.4] h-11 rounded-xl bg-[#1F7A6B] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#185e52] disabled:opacity-60"
            >
              {loadingCheck ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Tekshirish
            </button>
          </div>
        </div>

        {/* Feedback panel */}
        <div className="bg-white rounded-2xl border border-[#0F1C2E]/8 p-4 space-y-4 min-h-[420px]">
          <h3 className="text-sm font-bold text-[#0F1C2E]">AI fikr-mulohaza</h3>

          {!check ? (
            <p className="text-sm text-[#0F1C2E]/55 leading-relaxed">
              Matn yozib, «Tekshirish» tugmasini bosing. Ball, xatolar va yaxshiroq kollokatsiyalar
              shu yerda chiqadi.
            </p>
          ) : (
            <>
              <ScoreCard result={check} previous={drafts.find((d) => d.id === draftId)?.previousScore} />

              {activeIssue !== null && visibleIssues[activeIssue] && (
                <div className="rounded-xl border border-[#E2A13A]/40 bg-[#E2A13A]/8 p-3 space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#E2A13A]">
                      {ISSUE_TYPE_LABELS[visibleIssues[activeIssue].type]}
                    </span>
                    <button onClick={() => setActiveIssue(null)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs">
                    <span className="line-through text-[#0F1C2E]/50">
                      {visibleIssues[activeIssue].original}
                    </span>
                    {' → '}
                    <span className="font-bold text-[#1F7A6B]">
                      {visibleIssues[activeIssue].suggestion}
                    </span>
                  </p>
                  <p className="text-xs text-[#0F1C2E]/70">
                    {visibleIssues[activeIssue].explanationUz}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(activeIssue)}
                      className="flex-1 h-9 rounded-lg bg-[#1F7A6B] text-white text-xs font-bold"
                    >
                      Qabul qilish
                    </button>
                    <button
                      onClick={() => handleIgnore(activeIssue)}
                      className="flex-1 h-9 rounded-lg border border-[#0F1C2E]/15 text-xs font-bold"
                    >
                      E’tiborsiz
                    </button>
                  </div>
                </div>
              )}

              {visibleIssues.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-[#0F1C2E]/45">
                    Topilgan muammolar ({visibleIssues.length})
                  </span>
                  {visibleIssues.map((iss, i) => (
                    <button
                      key={`${iss.start}-${i}`}
                      onClick={() => setActiveIssue(i)}
                      className="w-full text-left text-xs p-2 rounded-lg hover:bg-[#F6F1E8] flex gap-2 items-start"
                    >
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: ISSUE_COLORS[iss.type] }}
                      />
                      <span>
                        <span className="font-semibold">{iss.original}</span>
                        <span className="text-[#0F1C2E]/45"> → {iss.suggestion}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {check.betterCollocations?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-[#0F1C2E]/45">
                    Yaxshiroq kollokatsiyalar
                  </span>
                  {check.betterCollocations.map((c, i) => (
                    <div key={i} className="text-xs p-2 rounded-lg bg-[#F6F1E8]">
                      <span className="line-through text-[#0F1C2E]/45">{c.original}</span>
                      {' → '}
                      <span className="font-bold text-[#1F7A6B]">{c.better}</span>
                      <p className="text-[#0F1C2E]/55 italic mt-0.5">{c.exampleEn}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#0F1C2E]/70 leading-relaxed border-t border-[#0F1C2E]/5 pt-3">
                {check.summaryUz}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1C2E]/45">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        active
          ? 'bg-[#0F1C2E] text-white'
          : 'bg-[#F6F1E8] text-[#0F1C2E]/75 hover:bg-[#F0EAE1]'
      }`}
    >
      {children}
    </button>
  );
}

function ScoreCard({
  result,
  previous,
}: {
  result: WritingCheckResult;
  previous?: number;
}) {
  const cats: Array<{ key: keyof WritingCheckResult['scores']; label: string }> = [
    { key: 'correctness', label: 'To‘g‘rilik' },
    { key: 'clarity', label: 'Aniqlik' },
    { key: 'formality', label: 'Rasmiylik' },
    { key: 'structure', label: 'Tuzilma' },
    { key: 'vocabulary', label: 'Lug‘at' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="text-4xl font-black text-[#0F1C2E] tabular-nums">
          {result.overallScore}
        </div>
        <div className="pb-1 text-xs text-[#0F1C2E]/55">
          / 100
          {typeof previous === 'number' && (
            <span
              className={`ml-2 font-bold ${
                result.overallScore >= previous ? 'text-[#1F7A6B]' : 'text-[#E2A13A]'
              }`}
            >
              {result.overallScore >= previous ? '+' : ''}
              {result.overallScore - previous} oldingidan
            </span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {cats.map((c) => (
          <div key={c.key} className="space-y-0.5">
            <div className="flex justify-between text-[11px] font-semibold text-[#0F1C2E]/65">
              <span>{c.label}</span>
              <span className="tabular-nums">{result.scores[c.key]}</span>
            </div>
            <div className="h-2 rounded-full bg-[#F6F1E8] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#1F7A6B] transition-all"
                style={{ width: `${result.scores[c.key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// silence unused helper warning if tree-shaken oddly
void applyIssue;
