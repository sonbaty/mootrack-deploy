import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Target } from 'lucide-react';
import { Goal } from '../types';
import { getGoals, addGoal, deleteGoal } from '../services/storageService';

interface GoalsManagerProps {
  onBack: () => void;
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ onBack }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');

  useEffect(() => {
    const load = async () => {
        setGoals(await getGoals());
    };
    load();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    
    const updated = await addGoal(newGoalText.trim());
    setGoals(updated);
    setNewGoalText('');
  };

  const handleDeleteGoal = async (id: string) => {
    const updated = await deleteGoal(id);
    setGoals(updated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 ml-4">Manage Goals</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="bg-indigo-50 p-4 rounded-xl mb-6 border border-indigo-100">
            <div className="flex items-start space-x-3">
                <Target className="text-primary mt-1" size={20} />
                <div>
                    <h3 className="font-semibold text-indigo-900">Daily Habits & Goals</h3>
                    <p className="text-sm text-indigo-700 mt-1">
                        Define the habits you want to track daily. You can check these off in your daily entries.
                    </p>
                </div>
            </div>
        </div>

        <form onSubmit={handleAddGoal} className="mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="Add a new goal (e.g., 'Drink Water')"
              className="flex-1 p-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!newGoalText.trim()}
              className="p-3 bg-primary text-white rounded-xl shadow-sm hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>
        </form>

        <div className="space-y-3">
            {goals.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                    No goals set yet. Add one above!
                </div>
            )}
            {goals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="font-medium text-slate-700">{goal.text}</span>
                    <button 
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GoalsManager;