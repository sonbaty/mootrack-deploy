import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import Stats from './components/Stats';
import GoalsManager from './components/GoalsManager';
import { JournalEntry, ViewState } from './types';
import { getEntries, saveEntry } from './services/storageService';

const App: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = async () => {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (error) {
      console.error("Failed to load entries", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  const handleSaveEntry = async (entry: JournalEntry) => {
    setIsLoading(true);
    await saveEntry(entry);
    await loadEntries();
    setEditingEntry(null);
    setCurrentView('dashboard');
    setIsLoading(false);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setCurrentView('entry');
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setCurrentView('entry');
  };

  // Calculate which goals are ALREADY completed in OTHER entries for the active date
  const getDailyCompletedGoals = () => {
    // Default to today, or use the date of the entry being edited
    let targetDate = new Date().toISOString().split('T')[0];
    if (editingEntry) {
        targetDate = editingEntry.date.split('T')[0];
    }

    const completedSet = new Set<string>();
    
    entries.forEach(entry => {
      const entryDate = entry.date.split('T')[0];
      // We only care about entries on the same day, EXCLUDING the one we are currently editing
      // (because we want to know what is externally done)
      if (entryDate === targetDate && entry.id !== editingEntry?.id) {
        entry.completedGoalIds?.forEach(id => completedSet.add(id));
      }
    });
    
    return Array.from(completedSet);
  };

  if (isLoading && entries.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white h-screen shadow-2xl flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
           <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
           <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white h-screen shadow-2xl overflow-hidden font-sans text-slate-800 relative">
      {currentView === 'dashboard' && (
        <Dashboard 
          entries={entries} 
          onAddEntry={handleAddEntry}
          onViewStats={() => setCurrentView('stats')}
          onEditEntry={handleEditEntry}
          onViewGoals={() => setCurrentView('goals')}
        />
      )}
      
      {currentView === 'entry' && (
        <EntryForm 
          existingEntry={editingEntry}
          onSave={handleSaveEntry}
          onBack={() => setCurrentView('dashboard')}
          alreadyCompletedGoalIds={getDailyCompletedGoals()}
        />
      )}

      {currentView === 'stats' && (
        <Stats 
          entries={entries}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'goals' && (
        <GoalsManager 
          onBack={() => setCurrentView('dashboard')}
        />
      )}
    </div>
  );
};

export default App;