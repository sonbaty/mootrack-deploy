import React, { useMemo, useState, useEffect } from 'react';
import { Plus, BarChart3, CalendarDays, Target, CheckCircle2, Circle, Settings } from 'lucide-react';
import { JournalEntry, Goal } from '../types';
import { MOODS } from '../constants';
import { getGoals } from '../services/storageService';

interface DashboardProps {
  entries: JournalEntry[];
  onAddEntry: () => void;
  onViewStats: () => void;
  onEditEntry: (entry: JournalEntry) => void;
  onViewGoals: () => void;
  onViewSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ entries, onAddEntry, onViewStats, onEditEntry, onViewGoals, onViewSettings }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const fetchGoals = async () => {
        try {
            const loadedGoals = await getGoals();
            setGoals(loadedGoals);
        } catch (e) {
            console.error("Failed to load goals", e);
        }
    };
    fetchGoals();
  }, [entries]); 

  // Group entries by date to avoid duplicates visually (though logical persistence is ID based)
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const today = new Date().toISOString().split('T')[0];

  const getMoodData = (level: number) => MOODS.find(m => m.level === level);

  // Calculate Daily Progress based on ALL entries for today
  const todayEntries = sortedEntries.filter(e => e.date.startsWith(today));
  const completedGoalIds = new Set<string>();
  todayEntries.forEach(e => {
    e.completedGoalIds?.forEach(id => completedGoalIds.add(id));
  });
  
  const completedTodayCount = completedGoalIds.size;
  const totalGoals = goals.length;
  const progressPercentage = totalGoals > 0 ? Math.round((completedTodayCount / totalGoals) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white shadow-sm z-10">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MoodTrack</h1>
            <p className="text-xs text-slate-500 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={onViewGoals}
                className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-slate-600"
                title="Goals & Habits"
            >
                <Target size={24} />
            </button>
            <button 
                onClick={onViewStats}
                className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-slate-600"
                title="Statistics"
            >
                <BarChart3 size={24} />
            </button>
            <button 
                onClick={onViewSettings}
                className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-slate-600"
                title="Settings"
            >
                <Settings size={24} />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
        
        {/* Daily Goals Widget */}
        {goals.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Target size={20} className="text-indigo-200" />
                  Daily Goals
                </h2>
                <p className="text-xs text-indigo-100 opacity-90">
                  {completedTodayCount >= totalGoals 
                    ? "All goals completed! 🎉" 
                    : `${completedTodayCount} of ${totalGoals} completed today`}
                </p>
              </div>
              <div className="text-2xl font-bold opacity-90">{progressPercentage}%</div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-black/20 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-white/90 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Next Goal Hint (if any incomplete) */}
            {completedTodayCount < totalGoals && (
              <div className="text-xs font-medium text-indigo-100 flex items-center gap-1.5 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Circle size={12} />
                <span>Next up: {goals.find(g => !completedGoalIds.has(g.id))?.text || "Keep going!"}</span>
              </div>
            )}
            
            {completedTodayCount >= totalGoals && totalGoals > 0 && (
               <div className="text-xs font-medium text-indigo-100 flex items-center gap-1.5 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <CheckCircle2 size={12} />
                <span>You're crushing it!</span>
              </div>
            )}
          </div>
        )}
        
        {/* Empty State */}
        {sortedEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <CalendarDays size={48} className="mb-4 opacity-50" />
                <p>No entries yet. Start tracking today!</p>
            </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
            {sortedEntries.map((entry) => {
                const moodData = getMoodData(entry.mood);
                const dateObj = new Date(entry.date);
                const isToday = entry.date.startsWith(today);
                const goalCount = entry.completedGoalIds ? entry.completedGoalIds.length : 0;

                return (
                    <div 
                        key={entry.id}
                        onClick={() => onEditEntry(entry)}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                    >
                        {isToday && (
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                                TODAY
                            </div>
                        )}
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-50`}>
                                {moodData?.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold text-slate-800">
                                        {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${moodData?.color}`}>
                                        {moodData?.label}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 truncate">
                                    {entry.note || "No text note..."}
                                </p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                    {goalCount > 0 && (
                                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Target size={10} /> {goalCount}/{totalGoals} Goals
                                        </span>
                                    )}
                                    {entry.activities.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {entry.activities.slice(0, 2).map(act => (
                                                <span key={act} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                    #{act}
                                                </span>
                                            ))}
                                            {entry.activities.length > 2 && (
                                                <span className="text-[10px] text-slate-400 px-1">+{entry.activities.length - 2}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 right-6">
        <button
            onClick={onAddEntry}
            className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
        >
            <Plus size={28} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;