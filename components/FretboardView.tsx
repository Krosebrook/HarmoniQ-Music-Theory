import React, { useState } from 'react';
import { NOTES, GUITAR_VOICINGS, INTERVAL_MAP } from '../constants';
import { TheoryResult } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useTheory } from '../context/TheoryContext';

interface FretboardViewProps {
  activeNotes: string[];
  rootNote: string;
  chordVariety?: string;
  selectedShape?: string;
  customAiVoicing?: (number | null)[];
  displayLabelMode?: 'note' | 'interval';
  currentTheory?: TheoryResult;
}

const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E']; 

export const FretboardView: React.FC<FretboardViewProps> = ({ 
  activeNotes, 
  rootNote, 
  chordVariety,
  selectedShape,
  customAiVoicing,
  displayLabelMode = 'note',
  currentTheory
}) => {
  const { instrument, volume, isLookupMode, manualNotes, setManualNotes } = useTheory();
  const { playNote } = useAudio(instrument, volume);
  const [hoveredFret, setHoveredFret] = useState<number | null>(null);
  const [startFret, setStartFret] = useState(0);
  const [visibleFrets, setVisibleFrets] = useState(13); 

  const fretWidthPercent = 100 / (visibleFrets - (startFret === 0 ? 0.5 : 0));

  const getRootFretOnString = (stringRoot: string) => {
    const startIdx = NOTES.indexOf(stringRoot);
    const targetIdx = NOTES.indexOf(rootNote);
    return (targetIdx - startIdx + 12) % 12;
  };

  const getActiveVoicing = () => {
    if (customAiVoicing) return customAiVoicing;
    if (!chordVariety || !selectedShape) return null;
    const varietyMap = GUITAR_VOICINGS[chordVariety] || GUITAR_VOICINGS['Major'];
    return varietyMap[selectedShape] || null;
  };

  const activeVoicing = getActiveVoicing();

  const getVoicingAnalysis = () => {
    if (!activeVoicing) return null;
    return activeVoicing.map((fretOffset, stringIdx) => {
      if (fretOffset === null) return { string: STRINGS[stringIdx], label: 'X', note: '-' };
      const baseFret = getRootFretOnString(STRINGS[stringIdx]);
      const actualFret = baseFret + fretOffset;
      const note = getNoteAt(STRINGS[stringIdx], actualFret);
      const rootIdx = NOTES.indexOf(rootNote);
      const noteIdx = NOTES.indexOf(note);
      const semitones = (noteIdx - rootIdx + 12) % 12;
      return { string: STRINGS[stringIdx], label: INTERVAL_MAP[semitones], note };
    }).reverse();
  };

  const getShapeNote = (stringIdx: number, fret: number) => {
    if (!activeVoicing) return null;
    const reversedStringIdx = 5 - stringIdx;
    const offset = activeVoicing[reversedStringIdx];
    if (offset === null) return null;
    const baseFret = getRootFretOnString(STRINGS[stringIdx]);
    return baseFret + offset;
  };

  const getNoteAt = (stringRoot: string, fret: number) => {
    const startIdx = NOTES.indexOf(stringRoot);
    return NOTES[(startIdx + fret) % 12];
  };

  const getLabel = (note: string) => {
    if (displayLabelMode === 'interval' && currentTheory) {
      const idx = currentTheory.notes.indexOf(note);
      return idx !== -1 ? currentTheory.intervals[idx] : note;
    }
    return note;
  };

  const getIntervalCode = (note: string) => {
    if (!currentTheory) return null;
    const idx = currentTheory.notes.indexOf(note);
    return idx !== -1 ? currentTheory.intervals[idx] : null;
  };

  const handlePluck = (note: string, stringIdx: number, fret: number) => {
    const octaveMap: Record<number, number> = { 0: 2, 1: 1, 2: 1, 3: 0, 4: 0, 5: -1 };
    playNote(note, octaveMap[stringIdx] + (fret > 12 ? 1 : 0));
    
    if (isLookupMode) {
      if (manualNotes.includes(note)) {
        setManualNotes(manualNotes.filter(n => n !== note));
      } else {
        setManualNotes([...manualNotes, note]);
      }
    }
  };

  const isMarkedFret = (fret: number) => [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(fret);

  const getPositionPercent = (i: number, isCenter: boolean = false) => {
    if (startFret === 0) {
      if (!isCenter) return (i === 0 ? 0 : (0.5 + (i - 1)) * fretWidthPercent);
      return (i === 0 ? 0.25 : (0.5 + (i - 1) + 0.5)) * fretWidthPercent;
    } else {
      return (isCenter ? (i + 0.5) : i) * fretWidthPercent;
    }
  };

  const analysis = getVoicingAnalysis();

  return (
    <div className="flex flex-col xl:flex-row gap-6 select-none">
      <style>{`
        @keyframes dashflow { to { stroke-dashoffset: -20; } }
        .animate-flow { animation: dashflow 1s linear infinite; }
      `}</style>

      {/* Analysis Panel */}
      {analysis && !isLookupMode && (
        <aside className="xl:w-64 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 animate-in slide-in-from-left-4">
          <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">Voicing Insight</h3>
          <div className="space-y-4">
            {analysis.map((s, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500 w-4">{s.string}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-black border ${s.label === 'R' ? 'bg-indigo-600 border-indigo-400 text-white' : s.label === 'X' ? 'bg-slate-950 border-red-900 text-red-700' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {s.label}
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-300">{s.note}</div>
              </div>
            ))}
          </div>
        </aside>
      )}

      <div className="flex-1 space-y-6">
        {/* Controls */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap gap-4 items-center justify-between">
           <div className="flex gap-2">
             {[
               { label: 'Nut', start: 0, count: 5 },
               { label: 'Mid', start: 5, count: 6 },
               { label: 'All', start: 0, count: 24 }
             ].map((p) => (
               <button
                 key={p.label}
                 onClick={() => { setStartFret(p.start); setVisibleFrets(p.count); }}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${startFret === p.start && visibleFrets === p.count ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
               >
                 {p.label}
               </button>
             ))}
           </div>
           <div className="flex-1 flex gap-4 max-w-xs">
              <input type="range" min="0" max="22" value={startFret} onChange={(e) => setStartFret(parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-indigo-500" />
           </div>
        </div>

        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative w-full h-80 pt-10">
            {/* Markers */}
            <div className="absolute top-0 left-14 right-0 bottom-8 pointer-events-none">
               {Array.from({ length: visibleFrets }).map((_, i) => {
                  const currentFretNum = startFret + i;
                  const left = getPositionPercent(i);
                  const width = startFret === 0 && i === 0 ? fretWidthPercent * 0.5 : fretWidthPercent;
                  return (
                     <div key={i} className={`absolute top-0 bottom-0 border-r border-slate-800/60 flex flex-col justify-end items-center pb-2 ${currentFretNum === 0 ? 'bg-slate-900/50 border-r-[8px] border-r-slate-700' : ''}`} style={{ left: `${left}%`, width: `${width}%` }}>
                        {isMarkedFret(currentFretNum) && currentFretNum > 0 && <div className="text-[10px] font-black mb-[-30px] text-slate-600">{currentFretNum}</div>}
                     </div>
                  );
               })}
            </div>

            {/* Strings */}
            <div className="absolute top-0 left-0 right-0 bottom-8 flex flex-col justify-between py-6">
              {STRINGS.map((s, stringIdx) => {
                const isMuted = activeVoicing && activeVoicing[5 - stringIdx] === null;
                const activeFretIndices = Array.from({ length: visibleFrets })
                  .map((_, i) => startFret + i)
                  .filter(f => activeVoicing ? getShapeNote(stringIdx, f) === f : activeNotes.includes(getNoteAt(s, f)))
                  .sort((a, b) => a - b);

                return (
                  <div key={stringIdx} className="relative h-0 flex items-center">
                    <div className="w-14 flex flex-col items-center justify-center pr-4 z-40 relative">
                       {isMuted && <span className="absolute -top-10 text-[14px] font-black text-red-500">✕</span>}
                       <span className={`text-[11px] font-black uppercase ${isMuted ? 'text-slate-800' : 'text-slate-500'}`}>{s}</span>
                    </div>
                    <div className={`absolute left-14 right-0 ${isMuted ? 'bg-slate-800/10' : 'bg-gradient-to-r from-slate-400/50 via-slate-200/40 to-slate-400/50'}`} style={{ height: isMuted ? '1px' : `${1.8 + (stringIdx * 0.4)}px`, opacity: isMuted ? 0.15 : 1 }}></div>
                    
                    {/* Legato Arcs */}
                    {!isLookupMode && (
                      <div className="absolute left-14 right-0 h-10 -top-5 pointer-events-none z-20">
                        <svg className="w-full h-full overflow-visible">
                          {activeFretIndices.map((fret, i) => {
                            if (i === activeFretIndices.length - 1) return null;
                            const nextFret = activeFretIndices[i + 1];
                            if (nextFret - fret > 4) return null;
                            const sPerc = getPositionPercent(fret - startFret, true);
                            const ePerc = getPositionPercent(nextFret - startFret, true);
                            return (
                              <path key={`${fret}-${nextFret}`} d={`M ${sPerc}% 50 Q ${(sPerc + ePerc)/2}% 0 ${ePerc}% 50`} fill="none" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" className="animate-flow" />
                            );
                          })}
                        </svg>
                      </div>
                    )}

                    {Array.from({ length: visibleFrets }).map((_, i) => {
                      const fIdx = startFret + i;
                      const note = getNoteAt(s, fIdx);
                      const isTheoryNote = activeNotes.includes(note);
                      const isVoicingNote = getShapeNote(stringIdx, fIdx) === fIdx;
                      return (
                        <div key={fIdx} className="absolute z-30 group flex items-center justify-center w-12 h-12" style={{ left: `calc(3.5rem + ${getPositionPercent(i, true)}%)`, transform: 'translateX(-50%)' }} onMouseEnter={() => setHoveredFret(fIdx)} onMouseLeave={() => setHoveredFret(null)}>
                          <div className="w-full h-full rounded-full cursor-pointer" onClick={() => handlePluck(note, stringIdx, fIdx)}></div>
                          {isVoicingNote ? (
                             <button onClick={() => handlePluck(note, stringIdx, fIdx)} className={`absolute w-8 h-8 rounded-full flex flex-col items-center justify-center text-[10px] font-black border-2 ${note === rootNote ? 'bg-indigo-600 border-white text-white shadow-lg shadow-indigo-500/30' : 'bg-white border-indigo-600 text-indigo-900'} ${fIdx === 0 ? 'rounded-md h-8 w-6' : ''}`}>
                               {getLabel(note)}
                             </button>
                          ) : isTheoryNote ? (
                             <div onClick={() => handlePluck(note, stringIdx, fIdx)} className={`absolute w-6 h-6 flex items-center justify-center text-[9px] font-black border cursor-pointer transition-all ${isLookupMode ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800/95 text-slate-300 border-slate-600 hover:bg-indigo-600 hover:text-white'} ${fIdx === 0 ? 'rounded-sm h-8 w-6' : 'rounded-full'}`}>
                               {getLabel(note)}
                             </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
