
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
  showTechniques = true,
  displayLabelMode = 'note',
  currentTheory
}) => {
  const { instrument, volume } = useTheory();
  const { playNote } = useAudio(instrument, volume);
  const [hoveredFret, setHoveredFret] = useState<number | null>(null);
  
  // Viewport State
  const [startFret, setStartFret] = useState(0);
  const [visibleFrets, setVisibleFrets] = useState(13); // Default view 0-12
  
  // Calculate width unit based on presence of Nut (which is half-width visually)
  const fretWidthPercent = 100 / (visibleFrets - (startFret === 0 ? 0.5 : 0));

  const getRootFretOnString = (stringRoot: string) => {
    const startIdx = NOTES.indexOf(stringRoot);
    const targetIdx = NOTES.indexOf(rootNote);
    return (targetIdx - startIdx + 12) % 12;
  };

  const getShapeNote = (stringIdx: number, fret: number) => {
    if (customAiVoicing) {
      const reversedStringIdx = 5 - stringIdx;
      const targetFret = customAiVoicing[reversedStringIdx];
      return targetFret === fret ? fret : null;
    }
    if (!chordVariety || !selectedShape) return null;
    const varietyMap = GUITAR_VOICINGS[chordVariety] || GUITAR_VOICINGS['Major'];
    const shapeOffsets = varietyMap[selectedShape];
    if (!shapeOffsets) return null;
    const reversedStringIdx = 5 - stringIdx;
    const offset = shapeOffsets[reversedStringIdx];
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
  };

  const isMarkedFret = (fret: number) => [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(fret);

  // Helper to calculate CSS Left % for a given visual index
  const getPositionPercent = (i: number, isCenter: boolean = false) => {
    if (startFret === 0) {
      // i=0 is Nut (0.5 units width)
      // i>0 are Frets (1.0 units width)
      // Left Edge Logic:
      if (!isCenter) {
        if (i === 0) return 0;
        return (0.5 + (i - 1)) * fretWidthPercent;
      }
      // Center Point Logic:
      if (i === 0) return 0.25 * fretWidthPercent;
      return (0.5 + (i - 1) + 0.5) * fretWidthPercent;
    } else {
      // Standard equal width blocks
      if (!isCenter) return i * fretWidthPercent;
      return (i + 0.5) * fretWidthPercent;
    }
  };

  return (
    <div className="space-y-4 select-none">
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
           <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
             {[
               { label: 'Nut', start: 0, count: 6 },
               { label: 'Box 1', start: 0, count: 13 },
               { label: 'Box 2', start: 5, count: 8 },
               { label: 'High', start: 12, count: 13 },
               { label: 'Full', start: 0, count: 22 }
             ].map((preset) => (
               <button
                 key={preset.label}
                 onClick={() => { setStartFret(preset.start); setVisibleFrets(preset.count); }}
                 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                   startFret === preset.start && visibleFrets === preset.count
                     ? 'bg-indigo-600 text-white border-indigo-500 shadow-md transform scale-105' 
                     : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                 }`}
               >
                 {preset.label}
               </button>
             ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-800/50">
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-500 w-12 uppercase tracking-widest">Scroll</span>
                <input 
                    type="range" 
                    min="0" max="20" 
                    value={startFret}
                    onChange={(e) => setStartFret(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                />
                <span className="text-[10px] font-mono text-slate-400 w-6 text-right">{startFret}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-500 w-12 uppercase tracking-widest">Zoom</span>
                <input 
                    type="range" 
                    min="4" max="24" 
                    value={visibleFrets}
                    onChange={(e) => setVisibleFrets(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                    style={{ direction: 'rtl' }} 
                />
                <span className="text-[10px] font-mono text-slate-400 w-6 text-left">{visibleFrets}</span>
            </div>
        </div>
      </div>

      <div className="bg-slate-950 rounded-xl p-4 overflow-hidden border border-slate-800 shadow-2xl relative">
        <div className="relative w-full h-80 select-none">
          
          {/* Highlight Hover Bar */}
          {hoveredFret !== null && hoveredFret >= startFret && hoveredFret < startFret + visibleFrets && (
            <div 
              className="absolute top-4 bottom-8 bg-indigo-500/10 border-x border-indigo-500/20 pointer-events-none z-10 transition-all duration-75"
              style={{ 
                left: `calc(3rem + ${getPositionPercent(hoveredFret - startFret)}%)`,
                width: `${startFret === 0 && hoveredFret === 0 ? fretWidthPercent * 0.5 : fretWidthPercent}%`
              }}
            />
          )}

          {/* Grid Background */}
          <div className="absolute top-4 left-12 right-0 bottom-14 pointer-events-none">
             {Array.from({ length: visibleFrets }).map((_, i) => {
                const currentFretNum = startFret + i;
                const left = getPositionPercent(i);
                const width = startFret === 0 && i === 0 ? fretWidthPercent * 0.5 : fretWidthPercent;

                return (
                   <div 
                       key={i}
                       className={`absolute top-0 bottom-0 border-r border-slate-800/80 flex flex-col justify-end items-center pb-2 ${currentFretNum === 0 ? 'bg-slate-900/40 border-r-[6px] border-r-slate-700 shadow-[inset_-4px_0_10px_rgba(0,0,0,0.5)]' : ''}`}
                       style={{ left: `${left}%`, width: `${width}%` }}
                   >
                        {isMarkedFret(currentFretNum) && currentFretNum > 0 && (
                           <div className="text-[9px] font-bold text-slate-600 mb-[-24px] select-none">{currentFretNum}</div>
                        )}
                        {/* Inlay Dots */}
                        {currentFretNum === 12 && (
                            <div className="absolute top-1/2 -translate-y-1/2 flex gap-4 opacity-20">
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                            </div>
                        )}
                        {([3, 5, 7, 9, 15, 17, 19, 21].includes(currentFretNum)) && (
                            <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-400 opacity-20"></div>
                        )}
                   </div>
                );
             })}
          </div>

          {/* Strings & Notes */}
          <div className="absolute top-4 left-0 right-0 bottom-14 flex flex-col justify-between py-2">
            {STRINGS.map((s, stringIdx) => {
              const reversedIdx = 5 - stringIdx;
              const shapeVoicing = customAiVoicing || (selectedShape ? GUITAR_VOICINGS[chordVariety || 'Major']?.[selectedShape] : null);
              const isVoicingActive = !!shapeVoicing;
              // Check if specific string is muted in the active voicing
              const isMuted = isVoicingActive && shapeVoicing[reversedIdx] === null;

              return (
                <div key={stringIdx} className="relative h-0 flex items-center">
                  {/* String Line */}
                  <div 
                    className={`absolute left-12 right-0 shadow-sm transition-all duration-300 ${isMuted ? 'bg-slate-700/30' : 'bg-gradient-to-r from-slate-400/40 via-slate-500/30 to-slate-400/40'}`} 
                    style={{ height: isMuted ? '1px' : `${1.4 + (stringIdx * 0.4)}px` }}
                  ></div>
                  
                  {/* String Label + Mute Indicator */}
                  <div className="w-12 text-center pr-3 select-none z-30 flex items-center justify-end gap-1.5">
                     {isMuted && <span className="text-[10px] font-bold text-red-500/60 animate-in fade-in zoom-in duration-300">✕</span>}
                     <span className={`text-[10px] font-black uppercase transition-colors ${isMuted ? 'text-slate-700' : 'text-slate-500'}`}>{s}</span>
                  </div>
                  
                  {Array.from({ length: visibleFrets }).map((_, i) => {
                    const fretIdx = startFret + i;
                    const note = getNoteAt(s, fretIdx);
                    const isTheoryNote = activeNotes.includes(note);
                    const shapeFret = getShapeNote(stringIdx, fretIdx);
                    const isVoicingNote = shapeFret !== null && shapeFret === fretIdx;
                    const isNut = fretIdx === 0;

                    const leftPerc = getPositionPercent(i, true); // true for Center

                    return (
                      <div 
                        key={fretIdx} 
                        className="absolute z-30 group flex items-center justify-center w-8 h-8 hover:z-50" 
                        style={{ left: `calc(3rem + ${leftPerc}%)`, transform: 'translateX(-50%)' }}
                        onMouseEnter={() => !isNut && setHoveredFret(fretIdx)}
                        onMouseLeave={() => setHoveredFret(null)}
                      >
                        
                        {/* Transparent Hitbox */}
                        <div 
                          className={`w-8 h-8 rounded-full transition-colors cursor-pointer ${!isVoicingNote && !isTheoryNote ? 'group-hover:bg-indigo-500/20' : ''}`}
                          onClick={() => handlePluck(note, stringIdx, fretIdx)}
                        ></div>

                        {/* Tooltip - Note & Interval */}
                        <div className={`absolute ${stringIdx <= 2 ? 'top-full mt-2' : 'bottom-full mb-2'} opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 transform scale-95 group-hover:scale-100 origin-${stringIdx <= 2 ? 'top' : 'bottom'}`}>
                          <div className="relative bg-slate-900/95 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 shadow-xl backdrop-blur-sm min-w-[36px] text-center">
                            <div className="text-[11px] font-bold leading-none">{note}</div>
                            {getIntervalCode(note) && <div className="text-[9px] font-medium text-indigo-400 mt-0.5 leading-none">{getIntervalCode(note)}</div>}
                            <div className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-l border-t border-slate-700 rotate-45 ${stringIdx <= 2 ? '-top-1.5 border-b-0 border-r-0' : '-bottom-1.5 border-t-0 border-l-0 border-b border-r'}`}></div>
                          </div>
                        </div>

                        {/* Note Markers */}
                        {isVoicingNote ? (
                           <button 
                             onClick={() => handlePluck(note, stringIdx, fretIdx)}
                             className={`absolute w-7 h-7 rounded-full flex flex-col items-center justify-center text-[9px] font-black shadow-lg border-2 transition-transform hover:scale-125 active:scale-95 ${
                             note === rootNote ? 'bg-indigo-600 border-white text-white' : 'bg-white border-indigo-500 text-indigo-900'
                           } ${isNut ? 'rounded-md w-5 h-7' : ''}`}>
                             {getLabel(note)}
                           </button>
                        ) : isTheoryNote && !selectedShape && !customAiVoicing ? (
                           <div 
                             onClick={() => handlePluck(note, stringIdx, fretIdx)}
                             className={`absolute w-5 h-5 flex items-center justify-center text-[8px] font-black bg-slate-800/95 text-slate-400 border border-slate-700 cursor-pointer hover:bg-indigo-500 hover:text-white transition-all ${isNut ? 'rounded-sm h-7 w-4' : 'rounded-full'}`}>
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
