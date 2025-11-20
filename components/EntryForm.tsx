import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Calendar, Target, Trophy, CheckCheck } from 'lucide-react';
import { JournalEntry, MoodLevel, Goal } from '../types';
import { MOODS, ACTIVITIES } from '../constants';
import { getGoals } from '../services/storageService';
import confetti from 'canvas-confetti';
import * as LucideIcons from 'lucide-react';

interface EntryFormProps {
  existingEntry?: JournalEntry | null;
  onSave: (entry: JournalEntry) => void;
  onBack: () => void;
  alreadyCompletedGoalIds?: string[];
}

const EntryForm: React.FC<EntryFormProps> = ({ existingEntry, onSave, onBack, alreadyCompletedGoalIds = [] }) => {
  const [mood, setMood] = useState<MoodLevel>(MoodLevel.NEUTRAL);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableGoals, setAvailableGoals] = useState<Goal[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const loadGoals = async () => {
        const goals = await getGoals();
        setAvailableGoals(goals);
    };
    loadGoals();

    if (existingEntry) {
      setMood(existingEntry.mood);
      setSelectedActivities(existingEntry.activities);
      setSelectedGoals(existingEntry.completedGoalIds || []);
      setNote(existingEntry.note);
      setDate(existingEntry.date.split('T')[0]);
    }
  }, [existingEntry]);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleActivityToggle = (id: string) => {
    setSelectedActivities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleGoalToggle = (id: string, text: string) => {
    const isCurrentlySelected = selectedGoals.includes(id);
    
    // If we are selecting it (checking the box)
    if (!isCurrentlySelected) {
        // Fire confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#6366f1', '#818cf8', '#a5b4fc', '#fbbf24']
        });
        
        // Show toast
        setToastMessage(`Goal completed: ${text}`);
    }

    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const entry: JournalEntry = {
      id: existingEntry ? existingEntry.id : crypto.randomUUID(),
      date: new Date(date).toISOString(),
      mood,
      activities: selectedActivities,
      completedGoalIds: selectedGoals,
      note
    };
    onSave(entry);
  };

  // Dynamically resolve icons
  const renderIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon size={20} /> : null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
        {/* Toast Notification */}
        {toastMessage && (
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                <div className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                    <Trophy size={16} className="text-yellow-400" />
                    {toastMessage}
                </div>
            </div>
        )}

      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-800">
          {existingEntry ? 'Edit Entry' : 'New Entry'}
        </h2>
        <button 
          onClick={handleSave} 
          className="p-2 rounded-full bg-primary text-white hover:bg-indigo-600 shadow-md transition-transform active:scale-95"
        >
          <Check size={24} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {/* Date Picker */}
        <div className="flex items-center space-x-2 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
            <Calendar size={20} className="text-slate-400" />
            <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 bg-transparent outline-none text-slate-700 font-medium"
            />
        </div>

        {/* Mood Section */}
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">How are you feeling?</h3>
          <div className="flex justify-between px-2">
            {MOODS.map((m) => (
              <button
                key={m.level}
                onClick={() => setMood(m.level)}
                className={`flex flex-col items-center transition-all duration-200 ${
                  mood === m.level ? 'scale-125' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span className="text-4xl mb-1 filter drop-shadow-sm">{m.emoji}</span>
                {mood === m.level && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${m.color}`}>
                    {m.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Daily Goals Section */}
        {availableGoals.length > 0 && (
            <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Target size={16} />
                    Daily Goals
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {availableGoals.map((goal) => {
                        const isSelected = selectedGoals.includes(goal.id);
                        const isAlreadyDone = alreadyCompletedGoalIds.includes(goal.id);

                        // If completed in ANOTHER entry today, show as distinct "Done" state
                        if (isAlreadyDone) {
                            return (
                                <button
                                    key={goal.id}
                                    disabled
                                    className="flex items-center justify-between p-4 rounded-xl border-transparent bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-white shadow-sm cursor-default opacity-90"
                                >
                                    <span className="font-medium opacity-90 line-through decoration-white/30">{goal.text}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full">DONE TODAY</span>
                                        <CheckCheck size={20} className="text-white" />
                                    </div>
                                </button>
                            );
                        }

                        // Normal toggleable state
                        return (
                            <button
                                key={goal.id}
                                onClick={() => handleGoalToggle(goal.id, goal.text)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-lg shadow-green-200 scale-[1.02]'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                <span className={`font-medium ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                    {goal.text}
                                </span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                    isSelected 
                                        ? 'bg-white/20 text-white' 
                                        : 'border-2 border-slate-300 text-transparent group-hover:border-slate-400'
                                }`}>
                                    <Check size={16} strokeWidth={3} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>
        )}

        {/* Activities Section */}
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">What did you do?</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {ACTIVITIES.map((activity) => (
              <button
                key={activity.id}
                onClick={() => handleActivityToggle(activity.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  selectedActivities.includes(activity.id)
                    ? 'bg-indigo-50 border-primary text-primary shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="mb-2">{renderIcon(activity.icon)}</div>
                <span className="text-xs font-medium">{activity.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Note Section */}
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Journal</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none shadow-sm text-slate-700"
          />
        </section>
      </div>
    </div>
  );
};

export default EntryForm;