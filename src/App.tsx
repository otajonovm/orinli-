/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { Onboarding } from './components/Onboarding';
import { UploadModal } from './components/UploadModal';
import { HomeScreen } from './components/HomeScreen';
import { BooksScreen } from './components/BooksScreen';
import { LearnScreen } from './components/LearnScreen';
import { RightingBossScreen } from './components/RightingBossScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { SettingsModal } from './components/SettingsModal';
import { BookRecord, ExtractionResult, UserProgress, WordRecord } from './types';
import {
  SAMPLE_BOOK,
  SAMPLE_EXTRACTION,
  SAMPLE_TEXT,
  upsertBookWords,
  updateWordMasteryState,
  evaluateBadges,
  checkRightingBossUnlock,
} from './data/wordDatabase';
import {
  loadWordDatabase,
  saveWordDatabase,
  loadBooks,
  saveBooks,
  loadUserProgress,
  saveUserProgress,
  clearAllData,
} from './utils/storage';

export default function App() {
  const [wordsDb, setWordsDb] = useState<Record<string, WordRecord>>(() => loadWordDatabase());
  const [books, setBooks] = useState<BookRecord[]>(() => loadBooks());
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadInitialMode, setUploadInitialMode] = useState<'upload' | 'paste'>('upload');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isRightingBossOpen, setIsRightingBossOpen] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    saveWordDatabase(wordsDb);
  }, [wordsDb]);

  useEffect(() => {
    saveBooks(books);
  }, [books]);

  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Handle importing a book / text extraction
  const handleImportComplete = (result: ExtractionResult, textSnippet: string) => {
    const bookId = `book-${Date.now()}`;
    const newBook: BookRecord = {
      id: bookId,
      title: result.title || 'Mening kitobim',
      addedAt: new Date().toISOString(),
      charCount: textSnippet.length,
      wordsExtractedCount: result.words.length,
      levelGuess: result.levelGuess || 'B1',
      truncatedSnippet: textSnippet,
    };

    const upsertRes = upsertBookWords(wordsDb, result, bookId);
    const updatedWordsDb = upsertRes.updatedDb;
    const updatedBooks = [newBook, ...books];

    // Evaluate badges for library creation
    const updatedProgress = evaluateBadges(progress, updatedWordsDb, updatedBooks);

    setWordsDb(updatedWordsDb);
    setBooks(updatedBooks);
    setProgress(updatedProgress);
  };

  // Load sample text (Maya story) directly into BooksAdapter
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
      handleImportComplete(data, SAMPLE_TEXT);
      setActiveTab('home');
    } catch {
      handleImportComplete(SAMPLE_EXTRACTION, SAMPLE_TEXT);
      setActiveTab('home');
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Handle answer in LearnScreen
  const handleWordAnswered = (lemma: string, isCorrect: boolean) => {
    const { updatedDb, newMastery, xpEarned } = updateWordMasteryState(
      wordsDb,
      lemma,
      isCorrect
    );

    const isFirstTimeLearned = (wordsDb[lemma]?.mastery || 0) === 0 && newMastery >= 1;

    const today = new Date().toISOString().slice(0, 10);
    const prevQuest = progress.dailyQuest?.date === today
      ? progress.dailyQuest
      : { date: today, wordsLearned: 0, wordsReviewed: 0 };

    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + xpEarned,
      lastStudiedLemma: lemma,
      dailyQuest: {
        date: today,
        wordsLearned: isFirstTimeLearned
          ? prevQuest.wordsLearned + 1
          : prevQuest.wordsLearned,
        wordsReviewed: !isFirstTimeLearned
          ? prevQuest.wordsReviewed + 1
          : prevQuest.wordsReviewed,
      },
    };

    setWordsDb(updatedDb);
    setProgress(evaluateBadges(updatedProgress, updatedDb, books));
  };

  // Handle boss completion
  const handlePassedBoss = () => {
    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + 50,
    };
    setProgress(evaluateBadges(updatedProgress, wordsDb, books, true));
  };

  // Reset all database data
  const handleResetDatabase = () => {
    clearAllData();
    setWordsDb({});
    setBooks([]);
    setProgress({
      xp: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      dailyQuest: {
        date: new Date().toISOString().slice(0, 10),
        wordsLearned: 0,
        wordsReviewed: 0,
      },
      badges: [],
    });
    setActiveTab('home');
    setIsRightingBossOpen(false);
  };

  const totalWordsInLibrary = Object.keys(wordsDb).length;
  const isDatabaseEmpty = totalWordsInLibrary === 0;
  const bossStatus = checkRightingBossUnlock(wordsDb);

  return (
    <div className="min-h-screen bg-[#F6F1E8] text-[#0F1C2E] flex flex-col font-sans selection:bg-[#E2A13A]/30">
      {/* Top Header */}
      <Header
        streak={progress.streak}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setIsRightingBossOpen(false);
          setActiveTab(tab);
        }}
        wordsToLearnCount={
          Object.values(wordsDb).filter((w) => w.mastery === 0).length
        }
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {isRightingBossOpen ? (
          /* RIGHTING Boss Screen */
          <RightingBossScreen
            onBack={() => setIsRightingBossOpen(false)}
            onPassedBoss={handlePassedBoss}
            isUnlocked={bossStatus.unlocked}
          />
        ) : isDatabaseEmpty ? (
          /* Onboarding when WordDatabase is completely empty */
          <Onboarding
            onUploadClick={() => {
              setUploadInitialMode('upload');
              setIsUploadModalOpen(true);
            }}
            onPasteClick={() => {
              setUploadInitialMode('paste');
              setIsUploadModalOpen(true);
            }}
            onSampleClick={handleLoadSample}
            isLoadingSample={isLoadingSample}
          />
        ) : (
          /* Normal Tab Views */
          <>
            {activeTab === 'home' && (
              <HomeScreen
                wordsDb={wordsDb}
                books={books}
                progress={progress}
                onStartLearning={() => setActiveTab('learn')}
                onOpenRightingBoss={() => setIsRightingBossOpen(true)}
                onOpenUpload={() => {
                  setUploadInitialMode('upload');
                  setIsUploadModalOpen(true);
                }}
                onOpenBooksTab={() => setActiveTab('books')}
              />
            )}

            {activeTab === 'books' && (
              <BooksScreen
                books={books}
                wordsDb={wordsDb}
                onOpenUpload={() => {
                  setUploadInitialMode('upload');
                  setIsUploadModalOpen(true);
                }}
              />
            )}

            {activeTab === 'learn' && (
              <LearnScreen
                wordsDb={wordsDb}
                onWordAnswered={handleWordAnswered}
                onOpenUpload={() => {
                  setUploadInitialMode('upload');
                  setIsUploadModalOpen(true);
                }}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressScreen
                wordsDb={wordsDb}
                books={books}
                progress={progress}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Tabs Navigation */}
      {!isDatabaseEmpty && !isRightingBossOpen && (
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setIsRightingBossOpen(false);
            setActiveTab(tab);
          }}
          wordsToLearnCount={
            Object.values(wordsDb).filter((w) => w.mastery === 0).length
          }
        />
      )}

      {/* Upload & BooksAdapter Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialMode={uploadInitialMode}
        totalWordsInLibrary={totalWordsInLibrary}
        onImportComplete={handleImportComplete}
        onStartLearning={() => setActiveTab('learn')}
      />

      {/* Settings Modal (Data strategy, BNC status, Integrations, Reset) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onResetDatabase={handleResetDatabase}
        totalWords={totalWordsInLibrary}
        totalBooks={books.length}
      />
    </div>
  );
}
