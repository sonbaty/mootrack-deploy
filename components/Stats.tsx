import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Flame, Trophy, Activity as ActivityIcon, Target } from 'lucide-react';
import { JournalEntry, Goal } from '../types';
import { ACTIVITIES, MOODS } from '../constants';
import { getGoals } from '../services/storageService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface StatsProps {
  entries: JournalEntry[];
  onBack: () => void;
}

const Stats: React.FC<StatsProps> = ({ entries, onBack }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const load = async () => {
        const g = await getGoals();
        setGoals(g);
    };
    load();
  }, []);

  // Chart Data
  const chartData = useMemo(() => {
    // Sort by date ascending
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Take last 7 entries for cleaner chart
    return sorted.slice(-7).map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      mood: entry.mood
    }));
  }, [entries]);

  // Activity Counts
  const topActivities = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(entry => {
      entry.activities.forEach(act => {
        counts[act] = (counts[act] || 0) + 1;
      });
    });
    
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id, count]) => {
        const actDef = ACTIVITIES.find(a => a.id === id);
        return { ...actDef, count };
      });
  }, [entries]);

  // Goal Statistics
  const goalStats = useMemo(() => {
    if (goals.length === 0 || entries.length === 0) return [];
    
    const stats = goals.map(goal => {
        const count = entries.filter(e => e.completedGoalIds?.includes(goal.id)).length;
        return {
            name: goal.text,
            count: count
        };
    });
    
    return stats.sort((a, b) => b.count - a.count);
  }, [entries, goals]);

  // Streak Calculation
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if latest entry is today or yesterday to start streak
    const latestDate = new Date(sorted[0].date);
    latestDate.setHours(0,0,0,0);
    
    const diffTime = Math.abs(today.getTime() - latestDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays > 1) return 0; // Streak broken if last entry older than yesterday

    currentStreak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
        const d1 = new Date(sorted[i].date);
        const d2 = new Date(sorted[i+1].date);
        d1.setHours(0,0,0,0);
        d2.setHours(0,0,0,0);
        
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            currentStreak++;
        } else if (diff > 1) {
            break;
        }
        // If diff is 0 (same day multiple entries), continue loop without incrementing
    }
    return currentStreak;
  }, [entries]);

  const averageMood = useMemo(() => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, curr) => acc + curr.mood, 0);
    return (sum / entries.length).toFixed(1);
  }, [entries]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 ml-4">Statistics</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        
        {/* Streak & Avg Card */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white shadow-md">
                <div className="flex items-center justify-between mb-2 opacity-90">
                    <span className="text-xs font-bold uppercase">Current Streak</span>
                    <Flame size={18} />
                </div>
                <div className="text-4xl font-bold">{streak}</div>
                <div className="text-xs opacity-80">days in a row</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md">
                <div className="flex items-center justify-between mb-2 opacity-90">
                    <span className="text-xs font-bold uppercase">Avg Mood</span>
                    <ActivityIcon size={18} />
                </div>
                <div className="text-4xl font-bold">{averageMood}</div>
                <div className="text-xs opacity-80">out of 5.0</div>
            </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Mood Flow (Last 7 Days)</h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#64748b'}} 
                            dy={10}
                        />
                        <YAxis 
                            domain={[1, 5]} 
                            hide 
                        />
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="mood" 
                            stroke="#6366f1" 
                            strokeWidth={3} 
                            dot={{r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} 
                            activeDot={{r: 6}}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Goal Stats */}
        {goalStats.length > 0 && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-2 mb-4 text-slate-700">
                    <Target size={18} className="text-green-500" />
                    <h3 className="text-sm font-semibold">Goal Achievements</h3>
                </div>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={goalStats} layout="vertical" margin={{ left: 30, right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" hide />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                tick={{fontSize: 10, fill: '#475569'}} 
                                width={80}
                                tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val}
                            />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            />
                            <Bar dataKey="count" barSize={20} radius={[0, 4, 4, 0]}>
                                {goalStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#818cf8' : '#a78bfa'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {/* Top Activities */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center space-x-2 mb-4 text-slate-700">
                <Trophy size={18} className="text-yellow-500" />
                <h3 className="text-sm font-semibold">Top Activities</h3>
            </div>
            <div className="space-y-3">
                {topActivities.length > 0 ? topActivities.map((act, idx) => (
                    <div key={act.id || idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-xs font-bold text-slate-400 shadow-sm">
                                {idx + 1}
                            </span>
                            <span className="text-sm font-medium text-slate-700">{act.label}</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                            {act.count}x
                        </span>
                    </div>
                )) : (
                    <p className="text-sm text-slate-400 text-center py-2">No activities recorded yet.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;