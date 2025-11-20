import { JournalEntry, Goal } from "../types";

const DB_NAME = 'JournalPWA';
const DB_VERSION = 2; // Increment version to ensure schema updates

let dbInstance: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create entries store
      if (!db.objectStoreNames.contains('entries')) {
        const entriesStore = db.createObjectStore('entries', { keyPath: 'id' });
        entriesStore.createIndex('date', 'date', { unique: false });
        entriesStore.createIndex('mood', 'mood', { unique: false });
      }

      // Create goals store
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'id' });
      }
      
      // Create settings store (as per request)
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
};

// --- Entries Operations ---

export const getEntries = async (): Promise<JournalEntry[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['entries'], 'readonly');
    const store = transaction.objectStore('entries');
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as JournalEntry[];
      // Sort by date descending (newest first)
      results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveEntry = async (entry: JournalEntry): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['entries'], 'readwrite');
    const store = transaction.objectStore('entries');
    const request = store.put(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteEntry = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['entries'], 'readwrite');
    const store = transaction.objectStore('entries');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- Goals Operations ---

const DEFAULT_GOALS: Goal[] = [
  { id: 'g1', text: 'Drink water' },
  { id: 'g2', text: 'Read 10 pages' },
  { id: 'g3', text: 'Meditate' }
];

export const getGoals = async (): Promise<Goal[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['goals'], 'readwrite');
    const store = transaction.objectStore('goals');
    const request = store.getAll();

    request.onsuccess = () => {
      const goals = request.result as Goal[];
      if (goals.length === 0) {
        // Seed defaults if empty
        const seedTransaction = db.transaction(['goals'], 'readwrite');
        const seedStore = seedTransaction.objectStore('goals');
        DEFAULT_GOALS.forEach(goal => seedStore.add(goal));
        resolve(DEFAULT_GOALS);
      } else {
        resolve(goals);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const addGoal = async (text: string): Promise<Goal[]> => {
  const db = await initDB();
  const newGoal: Goal = { id: crypto.randomUUID(), text };
  
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['goals'], 'readwrite');
    const store = transaction.objectStore('goals');
    const request = store.add(newGoal);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  return getGoals();
};

export const deleteGoal = async (id: string): Promise<Goal[]> => {
  const db = await initDB();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['goals'], 'readwrite');
    const store = transaction.objectStore('goals');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  
  return getGoals();
};

// --- Data Management (Backup/Restore/Reset) ---

export const clearDatabase = async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['entries', 'goals'], 'readwrite');
        
        transaction.objectStore('entries').clear();
        transaction.objectStore('goals').clear();
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const importData = async (data: { entries: JournalEntry[], goals: Goal[] }): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['entries', 'goals'], 'readwrite');
        const entriesStore = transaction.objectStore('entries');
        const goalsStore = transaction.objectStore('goals');

        // Clear existing data before import? 
        // For this implementation, let's overwrite conflicts but keep non-conflicting
        
        data.entries.forEach(entry => entriesStore.put(entry));
        data.goals.forEach(goal => goalsStore.put(goal));

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};