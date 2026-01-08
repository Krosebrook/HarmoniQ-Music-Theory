
import React, { useState, useMemo } from 'react';
import { NOTES, GUITAR_VOICINGS } from '../constants';
import { TheoryResult } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useTheory } from '../context/TheoryContext';

interface FretboardViewProps {
  activeNotes: string[];
  rootNote: string;
  chordVariety?: string;
  selectedShape?: string;
  customAiVoicing?: (number | null)[];
  showTechniques?: boolean;
  displayLabelMode?: 'note' | 'interval';
  currentTheory?: TheoryResult;
}

const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E']; // High to Low (Indices 0-5)

export const FretboardView: React.FC<FretboardViewProps> = ({ 
  activeNotes, 
  rootNote, 
  chordVariety,
  selectedShape,
  customAiVoicing,
  displayLabelMode = 'note',
  currentTheory
}) => {
  const { instrument, volume } = useTheory();
  const { playNote } = useAudio(instrument, volume);
  
  // Interaction State
  const [hoveredFret, setHoveredFret] = useState<number | null>(null);
  
  // Viewport State for Zoom and Scroll
  const [startFret, setStartFret] = useState(0);
  const [visibleFrets, setVisibleFrets] = useState(13); // Default view 0-12
  
  // Calculate relative widths based on whether the Nut (Fret 0) is visible
  const hasNut = startFret === 0;
  const fretWidthPercent = 100 / (visibleFrets - (hasNut ? 0.5 : 0));

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

  const getShapeNote = (stringIdx: number, fret: number) => {
    const voicing = getActiveVoicing();
    if (!voicing) return null;
    const reversedStringIdx = 5 - stringIdx;
    const offset = voicing[reversedStringIdx];
    if (offset === null) return null;
    
    // Relative positioning for guitar shapes
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
  };

  const isMarkedFret = (fret: number) => [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(fret);

  const getPositionPercent = (i: number, isCenter: boolean = false) => {
    if (startFret === 0) {
      if (!isCenter) {
        if (i === 0) return 0;
        return (0.5 + (i - 1)) * fretWidthPercent;
      }
      if (i === 0) return 0.25 * fretWidthPercent;
      return (0.5 + (i - 1) + 0.5) * fretWidthPercent;
    } else {
      if (!isCenter) return i * fretWidthPercent;
      return (i + 0.5) * fretWidthPercent;
    }
  };

  const activeVoicing = getActiveVoicing();

  return (
    <div className="space-y-6 select-none" role="region" aria-label="Interactive Guitar Fretboard">
      {/* Zoom & Range Controls */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="flex flex-wrap gap-2 items-center justify-between">
           <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
             {[
               { label: 'Nut Only', start: 0, count: 5 },
               { label: 'Frets 5-10', start: 5, count: 6 },
               { label: 'Full Range', start: 0, count: 24 }
             ].map((preset) => (
               <button
                 key={preset.label}
                 onClick={() => { setStartFret(preset.start); setVisibleFrets(preset.count); }}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                   startFret === preset.start && visibleFrets === preset.count
                     ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg scale-105' 
                     : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                 }`}
               >
                 {preset.label}
               </button>
             ))}
           </div>
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
             Visible Frets: <span className="text-indigo-400">{startFret} — {startFret + visibleFrets - 1}</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-slate-800/50">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neck Scroll</span>
                   <span className="text-[10px] font-mono text-indigo-400 font-bold">Fret {startFret}</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="22" 
                    value={startFret}
                    onChange={(e) => setStartFret(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zoom Level</span>
                   <span className="text-[10px] font-mono text-indigo-400 font-bold">{visibleFrets} frets</span>
                </div>
                <input 
                    type="range" 
                    min="3" max="24" 
                    value={visibleFrets}
                    onChange={(e) => setVisibleFrets(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                    style={{ direction: 'rtl' }} 
                />
            </div>
        </div>
      </div>

      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative w-full h-80 pt-10">
          
          {/* Vertical Fret Highlight Bar */}
          {hoveredFret !== null && hoveredFret >= startFret && hoveredFret < startFret + visibleFrets && (
            <div 
              className="absolute top-0 bottom-8 bg-indigo-500/10 border-x border-indigo-500/30 pointer-events-none z-10 transition-all duration-100 ease-out"
              style={{ 
                left: `calc(3.5rem + ${getPositionPercent(hoveredFret - startFret)}%)`,
                width: `${startFret === 0 && hoveredFret === 0 ? fretWidthPercent * 0.5 : fretWidthPercent}%`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-indigo-500/5"></div>
            </div>
          )}

          {/* Fret Grid & Markers */}
          <div className="absolute top-0 left-14 right-0 bottom-8 pointer-events-none">
             {Array.from({ length: visibleFrets }).map((_, i) => {
                const currentFretNum = startFret + i;
                const left = getPositionPercent(i);
                const width = startFret === 0 && i === 0 ? fretWidthPercent * 0.5 : fretWidthPercent;

                return (
                   <div 
                       key={i}
                       className={`absolute top-0 bottom-0 border-r border-slate-800/60 flex flex-col justify-end items-center pb-2 ${currentFretNum === 0 ? 'bg-slate-900/50 border-r-[8px] border-r-slate-700 shadow-2xl' : ''}`}
                       style={{ left: `${left}%`, width: `${width}%` }}
                   >
                        {isMarkedFret(currentFretNum) && currentFretNum > 0 && (
                           <div className={`text-[10px] font-black mb-[-30px] select-none transition-all duration-300 ${hoveredFret === currentFretNum ? 'text-indigo-400 scale-125' : 'text-slate-600'}`}>
                             {currentFretNum}
                           </div>
                        )}
                        {/* 12th Fret Octave Dots */}
                        {currentFretNum === 12 && (
                            <div className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-14 opacity-20">
                              <div className="w-3.5 h-3.5 rounded-full bg-slate-400 shadow-inner"></div>
                              <div className="w-3.5 h-3.5 rounded-full bg-slate-400 shadow-inner"></div>
                            </div>
                        )}
                        {/* Standard Inlay Dots */}
                        {([3, 5, 7, 9, 15, 17, 19, 21].includes(currentFretNum)) && (
                            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-slate-400 opacity-20 shadow-inner"></div>
                        )}
                   </div>
                );
             })}
          </div>

          {/* Strings & Note Interactive Layer */}
          <div className="absolute top-0 left-0 right-0 bottom-8 flex flex-col justify-between py-6">
            {STRINGS.map((s, stringIdx) => {
              const reversedIdx = 5 - stringIdx;
              const isMuted = activeVoicing && activeVoicing[reversedIdx] === null;

              return (
                <div key={stringIdx} className="relative h-0 flex items-center">
                  
                  {/* String Identity & Headstock 'X' Mute Marker */}
                  <div className="w-14 flex flex-col items-center justify-center pr-4 z-40 relative">
                     {isMuted && (
                       <div className="absolute -top-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                          <span className="text-[14px] font-black text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">✕</span>
                       </div>
                     )}
                     <span className={`text-[11px] font-black uppercase transition-all duration-500 ${isMuted ? 'text-slate-800' : 'text-slate-500'}`}>{s}</span>
                  </div>

                  {/* Individual String Graphic with Physics-style Thickness */}
                  <div 
                    className={`absolute left-14 right-0 shadow-sm transition-all duration-700 ${isMuted ? 'bg-slate-800/10' : 'bg-gradient-to-r from-slate-400/50 via-slate-200/40 to-slate-400/50'}`} 
                    style={{ 
                      height: isMuted ? '1px' : `${1.8 + (stringIdx * 0.4)}px`,
                      opacity: isMuted ? 0.15 : 1
                    }}
                  ></div>
                  
                  {Array.from({ length: visibleFrets }).map((_, i) => {
                    const fretIdx = startFret + i;
                    const note = getNoteAt(s, fretIdx);
                    const isTheoryNote = activeNotes.includes(note);
                    const shapeFret = getShapeNote(stringIdx, fretIdx);
                    const isVoicingNote = shapeFret !== null && shapeFret === fretIdx;
                    const isNut = fretIdx === 0;

                    const leftPerc = getPositionPercent(i, true);

                    return (
                      <div 
                        key={fretIdx} 
                        className="absolute z-30 group flex items-center justify-center w-12 h-12 hover:z-50" 
                        style={{ left: `calc(3.5rem + ${leftPerc}%)`, transform: 'translateX(-50%)' }}
                        onMouseEnter={() => setHoveredFret(fretIdx)}
                        onMouseLeave={() => setHoveredFret(null)}
                      >
                        
                        {/* Invisible Plucking Trigger */}
                        <div 
                          className={`w-full h-full rounded-full transition-colors cursor-pointer ${!isVoicingNote && !isTheoryNote ? 'group-hover:bg-indigo-500/10' : ''}`}
                          onClick={() => handlePluck(note, stringIdx, fretIdx)}
                        ></div>

                        {/* Intelligence Tooltip: Note + Interval Analysis */}
                        <div className={`absolute ${stringIdx <= 2 ? 'top-full mt-4' : 'bottom-full mb-4'} opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 transform scale-75 group-hover:scale-100 origin-${stringIdx <= 2 ? 'top' : 'bottom'}`}>
                          <div className="relative bg-slate-900/95 text-white px-4 py-2.5 rounded-xl border border-indigo-500/40 shadow-2xl backdrop-blur-lg min-w-[60px] text-center">
                            <div className="text-[13px] font-black tracking-widest">{note}</div>
                            {getIntervalCode(note) && (
                              <div className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-tighter">
                                {getIntervalCode(note)}
                              </div>
                            )}
                            {/* Adaptive Arrow Indicator */}
                            <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-l border-t border-indigo-500/40 rotate-45 ${stringIdx <= 2 ? '-top-1.5' : '-bottom-1.5 border-t-0 border-l-0 border-b border-r'}`}></div>
                          </div>
                        </div>

                        {/* Note Visualization (Circle) */}
                        {isVoicingNote ? (
                           <button 
                             onClick={() => handlePluck(note, stringIdx, fretIdx)}
                             className={`absolute w-9 h-9 rounded-full flex flex-col items-center justify-center text-[11px] font-black shadow-[0_6px_15px_rgba(0,0,0,0.4)] border-2 transition-transform hover:scale-125 active:scale-90 ${
                             note === rootNote ? 'bg-indigo-600 border-white text-white' : 'bg-white border-indigo-600 text-indigo-900'
                           } ${isNut ? 'rounded-md w-7 h-9' : ''}`}>
                             {getLabel(note)}
                           </button>
                        ) : isTheoryNote && !selectedShape && !customAiVoicing ? (
                           <div 
                             onClick={() => handlePluck(note, stringIdx, fretIdx)}
                             className={`absolute w-6 h-6 flex items-center justify-center text-[9px] font-black bg-slate-800/95 text-slate-300 border border-slate-600 cursor-pointer hover:bg-indigo-600 hover:text-white hover:border-indigo-400 transition-all shadow-lg ${isNut ? 'rounded-sm h-9 w-6' : 'rounded-full'}`}>
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
  );
};
