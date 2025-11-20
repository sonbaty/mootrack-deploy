import React, { useState } from 'react';
import { ArrowLeft, Download, Upload, Trash2, AlertTriangle, CheckCircle2, FileJson, Settings as SettingsIcon } from 'lucide-react';
import { getEntries, getGoals, importData, clearDatabase } from '../services/storageService';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const entries = await getEntries();
      const goals = await getGoals();
      
      const data = {
        entries,
        goals,
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moodtrack-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Backup file downloaded successfully.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to export data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.entries || !Array.isArray(data.entries)) {
        throw new Error('Invalid backup file format');
      }

      await importData({ entries: data.entries, goals: data.goals || [] });
      setMessage({ type: 'success', text: 'Data restored successfully! Please restart the app.' });
      
      // Optional: Reload page to reflect changes immediately
      setTimeout(() => {
          window.location.reload();
      }, 1500);

    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to import data. Invalid file.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('ARE YOU SURE? This will permanently delete all your journals and goals. This cannot be undone.')) {
        try {
            setIsLoading(true);
            await clearDatabase();
            setMessage({ type: 'success', text: 'All data deleted.' });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to reset database.' });
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 ml-4">Settings</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        
        {/* Info Card */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-start space-x-3">
                <SettingsIcon className="text-primary mt-1" size={20} />
                <div>
                    <h3 className="font-semibold text-indigo-900">Data Management</h3>
                    <p className="text-sm text-indigo-700 mt-1">
                        Your data is stored locally on this device. Create a backup to move your data to another device or keep it safe.
                    </p>
                </div>
            </div>
        </div>

        {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                <span className="text-sm font-medium">{message.text}</span>
            </div>
        )}

        <div className="space-y-4">
            
            {/* Backup */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3 text-slate-800">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Download size={20} />
                    </div>
                    <span className="font-semibold">Backup Data</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                    Download a JSON file containing all your journal entries and goals.
                </p>
                <button 
                    onClick={handleExport}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <FileJson size={18} />
                    Download Backup
                </button>
            </div>

            {/* Restore */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3 text-slate-800">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <Upload size={20} />
                    </div>
                    <span className="font-semibold">Restore Data</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                    Restore your data from a previously downloaded JSON backup file.
                </p>
                <label className="w-full cursor-pointer">
                    <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleImport}
                        disabled={isLoading}
                        className="hidden" 
                    />
                    <div className="w-full py-3 px-4 bg-white border-2 border-dashed border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 hover:border-primary active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Upload size={18} />
                        Select Backup File
                    </div>
                </label>
            </div>

             {/* Reset */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
                <div className="flex items-center gap-3 mb-3 text-red-700">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        <Trash2 size={20} />
                    </div>
                    <span className="font-semibold">Danger Zone</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                    Permanently delete all journal entries and goals. This cannot be undone.
                </p>
                <button 
                    onClick={handleReset}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} />
                    Delete All Data
                </button>
            </div>

        </div>

        <div className="text-center mt-8 text-xs text-slate-400">
            MoodTrack v1.0.0 • Offline PWA
        </div>

      </div>
    </div>
  );
};

export default Settings;