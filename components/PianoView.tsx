
import React, { useMemo } from 'react';
import { NOTES } from '../constants';
import { TheoryResult } from '../types';

interface PianoViewProps {
  activeNotes: string[];
  isChordMode?: boolean;
  displayLabelMode?: 'note' | 'interval';
  currentTheory?: TheoryResult;
}

export const PianoView: React.FC<PianoViewProps> = ({ 
  activeNotes, 
  isChordMode, 
  displayLabelMode = 'note',
  currentTheory
}) => {
  const keys = useMemo(() => {
    const octaves = 2;
    const result = [];
    for (let o = 0; o < octaves; o++) {
      NOTES.forEach((note) => {
        const isBlack = note.includes('b');
        result.push({ note, isBlack, octave: o });
      });
    }
    return result;
  }, []);

  const getLabel = (note: string) => {
    if (displayLabelMode === 'interval' && currentTheory) {
      const idx = currentTheory.notes.indexOf(note);
      return idx !== -1 ? currentTheory.intervals[idx] : note;
    }
    return note;
  };

  const isPrimaryVoicing = (note: string, octave: number) => {
    if (!isChordMode) return false;
    return octave === 0 && activeNotes.includes(note);
  };

  return (
    <div className="relative h-48 min-w-[600px] flex pb-8">
      {keys.map((k, idx) => {
        const isActive = activeNotes.includes(k.note);
        const isVoiced = isPrimaryVoicing(k.note, k.octave);
        
        if (k.isBlack) {
          return (
            <div
              key={`${k.note}-${idx}`}
              className={`absolute z-10 w-8 h-28 -ml-4 rounded-b-md border border-slate-900 transition-all duration-300 ${
                isVoiced 
                  ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] border-indigo-300 scale-y-105' 
                  : isActive 
                    ? 'bg-indigo-900/80 border-indigo-700' 
                    : 'bg-slate-950 hover:bg-slate-900'
              }`}
              style={{ left: `${(idx - (idx > 12 ? 1 : 0)) * 42}px` }}
              title={k.note}
            >
               {isActive && (
                 <div className={`absolute bottom-2 left-0 right-0 text-center text-[10px] font-black uppercase ${isVoiced ? 'text-white' : 'text-indigo-400'}`}>
                   {getLabel(k.note)}
                 </div>
               )}
            </div>
          );
        }
        return (
          <div
            key={`${k.note}-${idx}`}
            className={`w-12 h-48 border border-slate-700/50 rounded-b-lg transition-all duration-300 flex flex-col justify-end ${
              isVoiced 
                ? 'bg-indigo-50 border-indigo-500 shadow-inner' 
                : isActive 
                  ? 'bg-indigo-400/20 border-indigo-400' 
                  : 'bg-white hover:bg-slate-100'
            }`}
            title={k.note}
          >
            {isActive && (
              <div className="pb-4 flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full mb-2 ${isVoiced ? 'bg-indigo-600 animate-pulse' : 'bg-indigo-300'}`}></div>
                <div className={`text-xs font-black uppercase ${isVoiced ? 'text-indigo-900' : 'text-indigo-400'}`}>
                  {getLabel(k.note)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
