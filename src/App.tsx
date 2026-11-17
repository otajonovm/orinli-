/**
 * WriteTechAI — AI-supported technical/academic English writing for Uzbek speakers.
 * @license Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { Navigation, Sidebar, TabType } from './components/Navigation';
import { Onboarding } from './components/Onboarding';
import { UploadModal } from './components/UploadModal';
import { HomeScreen } from './components/HomeScreen';
import { WordsHubScreen } from './components/WordsHubScreen';
import { WritingScreen } from './components/WritingScreen';
import { CollocationScreen } from './components/CollocationScreen';
import { PhrasalVerbsScreen } from './components/PhrasalVerbsScreen';
import { RightingBossScreen } from './components/RightingBossScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { SettingsModal } from './components/SettingsModal';
import {
  BookRecord,
  ExtractionResult,
  SavedCollocation,
  UserProgress,
  UserSettings,
  WordRecord,
  WritingCheckResult,
  WritingDraft,
} from './types';
import {
  SAMPLE_EXTRACTION,
  SAMPLE_TEXT,
  upsertBookWords,
  updateWordMasteryState,
  evaluateBadges,
  checkRightingBossUnlock,
  getDueWords,
  scheduleWordReview,
  touchStreak,
  getInitialUserProgress,
} from './data/wordDatabase';
import {
  storageService,
  loadWordDatabase,
  saveWordDatabase,
  loadBooks,
  saveBooks,
  loadUserProgress,
  saveUserProgress,
  clearAllData,
} from './utils/storage';
import { apiStatus } from './api/client';

export default function App() {
  const [wordsDb, setWordsDb] = useState<Record<string, WordRecord>>(() => loadWordDatabase());
  const [books, setBooks] = useState<BookRecord[]>(() => loadBooks());
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());
  const [drafts, setDrafts] = useState<WritingDraft[]>(() => storageService.getDrafts());
  const [savedCollocations, setSavedCollocations] = useState<SavedCollocation[]>(() =>
    storageService.getSavedCollocations()
  );
  const [importedFrequencies, setImportedFrequencies] = useState(() =>
    storageService.getImportedFrequencies()
  );

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadInitialMode, setUploadInitialMode] = useState<'upload' | 'paste'>('upload');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isRightingBossOpen, setIsRightingBossOpen] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState<string | undefined>();
  const [collocationQuery, setCollocationQuery] = useState('');
  const [bncConnected, setBncConnected] = useState(false);
  const [forceShowApp, setForceShowApp] = useState(false);

  useEffect(() => {
    saveWordDatabase(wordsDb);
  }, [wordsDb]);

  useEffect(() => {
    saveBooks(books);
  }, [books]);

  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  useEffect(() => {
    storageService.saveDrafts(drafts);
  }, [drafts]);

  useEffect(() => {
    storageService.saveSavedCollocations(savedCollocations);
  }, [savedCollocations]);

  useEffect(() => {
    apiStatus().then((s) => setBncConnected(s.bnc.connected));
    setProgress((p) => touchStreak(p));
  }, []);

  const dueCount = useMemo(() => getDueWords(wordsDb).length, [wordsDb]);

  const bumpProgress = (updater: (p: UserProgress) => UserProgress) => {
    setProgress((p) => evaluateBadges(touchStreak(updater(p)), wordsDb, books));
  };

  const handleImportComplete = (result: ExtractionResult, textSnippet: string) => {
    const bookId = `book-${Date.now()}`;
    const newBook: BookRecord = {
      id: bookId,
      title: result.title || 'Mening kitobim',
      addedAt: new Date().toISOString(),
      charCount: textSnippet.length,
      wordsExtractedCount: result.words.length,
      levelGuess: result.levelGuess || 'B1',
      truncatedSnippet: textSnippet.slice(0, 25000),
    };

    const upsertRes = upsertBookWords(wordsDb, result, bookId);
    const updatedWordsDb = upsertRes.updatedDb;
    const updatedBooks = [newBook, ...books];
    const updatedProgress = evaluateBadges(touchStreak(progress), updatedWordsDb, updatedBooks);

    setWordsDb(updatedWordsDb);
    setBooks(updatedBooks);
    setProgress(updatedProgress);
    setForceShowApp(true);
  };

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      const response = await fetch('/api/extract-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: SAMPLE_TEXT,
          title: 'Maya va To‘g‘ri So‘z Tanlovi',
        }),
      });
      const data: ExtractionResult = response.ok ? await response.json() : SAMPLE_EXTRACTION;
      if (data._meta?.error) {
        console.error('[Namuna] Tahlil xatosi:', data._meta.error);
      }
      handleImportComplete(data, SAMPLE_TEXT);
      setActiveTab('home');
    } catch (e) {
      console.error('[Namuna]', e);
      handleImportComplete(SAMPLE_EXTRACTION, SAMPLE_TEXT);
      setActiveTab('home');
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleWordAnswered = (lemma: string, isCorrect: boolean) => {
    const { updatedDb, newMastery, xpEarned } = updateWordMasteryState(
      wordsDb,
      lemma,
      isCorrect
    );
    const withReview = scheduleWordReview(updatedDb, lemma, isCorrect);
    const isFirstTimeLearned = (wordsDb[lemma]?.mastery || 0) === 0 && newMastery >= 1;

    const today = new Date().toISOString().slice(0, 10);
    const prevQuest =
      progress.dailyQuest?.date === today
        ? progress.dailyQuest
        : {
            date: today,
            writingsCompleted: 0,
            collocationsSaved: 0,
            wordsLearned: 0,
            wordsReviewed: 0,
          };

    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + xpEarned,
      lastStudiedLemma: lemma,
      dailyQuest: {
        ...prevQuest,
        date: today,
        wordsLearned: isFirstTimeLearned
          ? prevQuest.wordsLearned + 1
          : prevQuest.wordsLearned,
        wordsReviewed: !isFirstTimeLearned
          ? prevQuest.wordsReviewed + 1
          : prevQuest.wordsReviewed,
      },
    };

    setWordsDb(withReview);
    setProgress(evaluateBadges(touchStreak(updatedProgress), withReview, books));
  };

  const handlePassedBoss = () => {
    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + 50,
    };
    setProgress(evaluateBadges(touchStreak(updatedProgress), wordsDb, books, true));
  };

  const handleSaveDraft = (draft: WritingDraft) => {
    setDrafts((prev) => {
      const idx = prev.findIndex((d) => d.id === draft.id);
      return idx >= 0 ? prev.map((d, i) => (i === idx ? draft : d)) : [draft, ...prev];
    });
    bumpProgress((p) => ({ ...p, lastWritingDraftId: draft.id }));
  };

  const handleWritingChecked = (
    draft: WritingDraft,
    result: WritingCheckResult,
    xpGained: number
  ) => {
    handleSaveDraft(draft);
    bumpProgress((p) => {
      const today = new Date().toISOString().slice(0, 10);
      const quest =
        p.dailyQuest?.date === today
          ? p.dailyQuest
          : {
              date: today,
              writingsCompleted: 0,
              collocationsSaved: 0,
              wordsLearned: 0,
              wordsReviewed: 0,
            };
      return {
        ...p,
        xp: p.xp + xpGained,
        lastWritingDraftId: draft.id,
        dailyQuest: {
          ...quest,
          writingsCompleted: Math.max(quest.writingsCompleted, 1),
        },
        writingHistory: [
          ...(p.writingHistory || []),
          {
            date: new Date().toISOString(),
            overallScore: result.overallScore,
            scores: result.scores,
            writingType: draft.type,
            field: draft.field,
          },
        ].slice(-50),
      };
    });
  };

  const handleSaveCollocation = (item: SavedCollocation) => {
    setSavedCollocations((prev) => [item, ...prev]);
    bumpProgress((p) => {
      const today = new Date().toISOString().slice(0, 10);
      const quest =
        p.dailyQuest?.date === today
          ? p.dailyQuest
          : {
              date: today,
              writingsCompleted: 0,
              collocationsSaved: 0,
              wordsLearned: 0,
              wordsReviewed: 0,
            };
      return {
        ...p,
        xp: p.xp + 5,
        dailyQuest: {
          ...quest,
          collocationsSaved: quest.collocationsSaved + 1,
        },
      };
    });
  };

  const handleResetDatabase = () => {
    clearAllData();
    setWordsDb({});
    setBooks([]);
    setDrafts([]);
    setSavedCollocations([]);
    setImportedFrequencies([]);
    setProgress(getInitialUserProgress());
    setActiveTab('home');
    setForceShowApp(false);
    setIsRightingBossOpen(false);
  };

  const handleUpdateSettings = (settings: UserSettings) => {
    bumpProgress((p) => ({ ...p, settings }));
  };

  const handleImportFrequencies = (
    rows: Array<{ lemma: string; pos: string; frequency: number }>
  ) => {
    setImportedFrequencies(rows);
    storageService.saveImportedFrequencies(rows);
  };

  const totalWordsInLibrary = Object.keys(wordsDb).length;
  const showOnboardingHome =
    totalWordsInLibrary === 0 && drafts.length === 0 && !forceShowApp;
  const settings = progress.settings;

  const goTab = (tab: TabType) => {
    setIsRightingBossOpen(false);
    if (tab !== 'home') setForceShowApp(true);
    setActiveTab(tab);
  };

  const openUpload = (mode: 'upload' | 'paste' = 'upload') => {
    setUploadInitialMode(mode);
    setIsUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8] text-[#0F1C2E] flex flex-col font-sans selection:bg-[#E2A13A]/30">
      <Header
        streak={progress.streak}
        xp={progress.xp}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onGoHome={() => goTab('home')}
        bncConnected={bncConnected}
      />

      <div className="flex-1 flex min-h-0">
        {!isRightingBossOpen && (
          <Sidebar activeTab={activeTab} onTabChange={goTab} dueCount={dueCount} />
        )}

        <main className="flex-1 flex flex-col min-w-0">
          {isRightingBossOpen ? (
            <RightingBossScreen
              onBack={() => setIsRightingBossOpen(false)}
              onPassedBoss={handlePassedBoss}
              isUnlocked={checkRightingBossUnlock(wordsDb).unlocked}
            />
          ) : (
            <>
              {activeTab === 'home' &&
                (showOnboardingHome ? (
                  <Onboarding
                    onUploadClick={() => openUpload('upload')}
                    onPasteClick={() => openUpload('paste')}
                    onSampleClick={handleLoadSample}
                    isLoadingSample={isLoadingSample}
                  />
                ) : (
                  <HomeScreen
                    wordsDb={wordsDb}
                    books={books}
                    progress={progress}
                    drafts={drafts}
                    onNavigate={goTab}
                    onOpenRightingBoss={() => setIsRightingBossOpen(true)}
                    onContinueDraft={(id) => setResumeDraftId(id)}
                    onQuickSearch={(word) => {
                      setCollocationQuery(word);
                      goTab('collocations');
                    }}
                  />
                ))}
              {activeTab === 'write' && (
                <WritingScreen
                  drafts={drafts}
                  onSaveDraft={handleSaveDraft}
                  onWritingChecked={handleWritingChecked}
                  defaultField={settings.field}
                  defaultLevel={settings.level}
                  resumeDraftId={resumeDraftId}
                />
              )}
              {activeTab === 'collocations' && (
                <CollocationScreen
                  wordsDb={wordsDb}
                  books={books}
                  providersEnabled={settings.providers}
                  importedFrequencies={importedFrequencies}
                  savedCollocations={savedCollocations}
                  onSaveCollocation={handleSaveCollocation}
                  initialQuery={collocationQuery}
                />
              )}
              {activeTab === 'phrasal' && (
                <PhrasalVerbsScreen
                  onQuizComplete={(xp) => bumpProgress((p) => ({ ...p, xp: p.xp + xp }))}
                />
              )}
              {activeTab === 'words' && (
                <WordsHubScreen
                  books={books}
                  wordsDb={wordsDb}
                  onOpenUpload={() => openUpload('upload')}
                  onWordAnswered={handleWordAnswered}
                />
              )}
              {activeTab === 'progress' && (
                <ProgressScreen
                  wordsDb={wordsDb}
                  books={books}
                  progress={progress}
                  drafts={drafts}
                  savedCollocations={savedCollocations}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsModal
                  isOpen
                  asPage
                  onClose={() => setActiveTab('home')}
                  onResetDatabase={handleResetDatabase}
                  totalWords={totalWordsInLibrary}
                  totalBooks={books.length}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onImportFrequencies={handleImportFrequencies}
                  importedCount={importedFrequencies.length}
                />
              )}
            </>
          )}
        </main>
      </div>

      {!isRightingBossOpen && (
        <Navigation activeTab={activeTab} onTabChange={goTab} dueCount={dueCount} />
      )}

      {/* Mobile progress shortcut: long-press not needed — available in sidebar / home */}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialMode={uploadInitialMode}
        totalWordsInLibrary={totalWordsInLibrary}
        onImportComplete={handleImportComplete}
        onStartLearning={() => goTab('words')}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen && activeTab !== 'settings'}
        onClose={() => setIsSettingsModalOpen(false)}
        onResetDatabase={handleResetDatabase}
        totalWords={totalWordsInLibrary}
        totalBooks={books.length}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onImportFrequencies={handleImportFrequencies}
        importedCount={importedFrequencies.length}
      />
    </div>
  );
}
