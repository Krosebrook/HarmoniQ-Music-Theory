
import React, { useState } from 'react';
import { NoteName, ProgressionStep } from '../types';
import { suggestProgression } from '../services/gemini';
import { NOTES } from '../constants';

interface ProgressionLabProps {
  currentKey: NoteName;
  progression: ProgressionStep[];
  setProgression: (p: ProgressionStep[]) => void;
  onSelectChord: (step: ProgressionStep, index: number) => void;
}

export const ProgressionLab: React.FC<ProgressionLabProps> = ({ 
  currentKey, 
  progression, 
  setProgression,
  onSelectChord 
}) => {
  const [mood, setMood] = useState('Epic');
  const [isGenerating, setIsGenerating] = useState(false);

  const moods = ['Epic', 'Melancholic', 'Dreamy', 'Dark Jazz', 'Uplifting Pop', 'Soulful', 'Cyberpunk'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const suggested = await suggestProgression(mood, currentKey);
      setProgression(suggested);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearProgression = () => setProgression([]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Progression Builder</h2>
            <p className="text-slate-400 text-sm mt-1">Generate harmonic sequences in the key of {currentKey} using AI.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="bg-slate-700 text-white text-sm rounded-xl px-4 py-2 border-none outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {moods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : '✨ Generate'}
            </button>
            
            <button
              onClick={clearProgression}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-2 rounded-xl text-sm font-semibold transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Progression Timeline */}
        <div className="min-h-[200px] bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex items-center justify-center relative overflow-hidden">
          {progression.length === 0 ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No sequence generated. Choose a mood and click Generate!</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 w-full">
              {progression.map((chord, idx) => (
                <div 
                  key={idx}
                  onClick={() => onSelectChord(chord, idx)}
                  className="flex-shrink-0 w-44 group cursor-pointer"
                >
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 transition-all hover:border-indigo-500 hover:bg-slate-750 hover:-translate-y-1 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono text-slate-500">STEP {idx + 1}</span>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">{chord.numeral}</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{chord.root}</div>
                    <div className="text-xs text-slate-400 truncate">{chord.variety}</div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">Visualize →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-900/10 border border-indigo-500/10 p-6 rounded-2xl">
          <h3 className="text-indigo-400 font-bold mb-2">Smart Harmonization</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Our AI uses voice-leading principles and functional harmony to suggest chords that resolve naturally.
          </p>
        </div>
        <div className="bg-emerald-900/10 border border-emerald-500/10 p-6 rounded-2xl">
          <h3 className="text-emerald-400 font-bold mb-2">Key Consistency</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            All generated progressions are anchored to your selected root key ({currentKey}), ensuring tonal stability.
          </p>
        </div>
        <div className="bg-amber-900/10 border border-amber-500/10 p-6 rounded-2xl">
          <h3 className="text-amber-400 font-bold mb-2">Contextual Learning</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Click any chord step to instantly see its fingering on the fretboard and voicing on the piano.
          </p>
        </div>
      </div>
    </div>
  );
};
