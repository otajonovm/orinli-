/**
 * Re-exports storage service for backward compatibility.
 * Prefer importing from services/storageService going forward.
 */
export {
  storageService,
  loadWordDatabase,
  saveWordDatabase,
  loadBooks,
  saveBooks,
  loadUserProgress,
  saveUserProgress,
  clearAllData,
} from '../services/storageService';
