
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

const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E']; // High to Low
const FB_WIDTH = 800;
const FB_TOP_GUTTER = 20;

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
  const [fretRange, setFretRange] = useState({ start: 0, end: 15 });
  
  const numFretsVisible = useMemo(() => fretRange.end - fretRange.start, [fretRange]);
  const fretWidthPercent = 100 / (numFretsVisible + 1);

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

  return (
    <div className="space-y-4 select-none">
      <div className="flex gap-2 items-center bg-slate-900/50 p-2 rounded-lg border border-slate-800">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Zoom Range:</span>
        <div className="flex gap-1">
          {[{ label: 'Full', start: 0, end: 15 }, { label: 'Nut', start: 0, end: 5 }, { label: 'Mid', start: 5, end: 10 }, { label: 'High', start: 10, end: 15 }].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setFretRange({ start: opt.start, end: opt.end })}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all border ${
                fretRange.start === opt.start && fretRange.end === opt.end 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto border border-slate-800 shadow-2xl relative">
        <div className="relative min-w-[800px] h-72">
          {/* Fret Highlight */}
          {hoveredFret !== null && hoveredFret > fretRange.start && (
            <div 
              className="absolute top-4 bottom-14 bg-indigo-500/10 border-x border-indigo-500/20 pointer-events-none z-10 transition-all duration-150"
              style={{ left: `calc(3rem + ${(hoveredFret - fretRange.start - 1) * fretWidthPercent}%)`, width: `${fretWidthPercent}%` }}
            />
          )}

          <div className="flex absolute inset-0 pt-4 pb-14">
            <div className="w-12"></div>
            {Array.from({ length: numFretsVisible }).map((_, i) => {
              const currentFretNum = i + 1 + fretRange.start;
              return (
                <div 
                  key={i} 
                  className={`flex-1 h-full border-r border-slate-800/80 relative transition-colors duration-200 ${hoveredFret === currentFretNum ? 'border-r-indigo-500/50' : ''}`}
                  onMouseEnter={() => setHoveredFret(currentFretNum)}
                  onMouseLeave={() => setHoveredFret(null)}
                />
              );
            })}
          </div>

          <div className="absolute top-4 left-0 right-0 bottom-14 flex flex-col justify-between py-2">
            {STRINGS.map((s, stringIdx) => {
              const reversedIdx = 5 - stringIdx;
              const shapeVoicing = customAiVoicing || (selectedShape ? GUITAR_VOICINGS[chordVariety || 'Major']?.[selectedShape] : null);
              const isStringMuted = shapeVoicing ? shapeVoicing[reversedIdx] === null : false;

              return (
                <div key={stringIdx} className="relative h-0 flex items-center">
                  <div className="absolute left-12 right-0 bg-gradient-to-r from-slate-400/40 via-slate-500/30 to-slate-400/40 shadow-sm" style={{ height: `${1.4 + (stringIdx * 0.4)}px` }}></div>
                  <div className="w-12 text-center text-[10px] font-black text-slate-500 pr-3 uppercase select-none">{s}</div>
                  
                  {Array.from({ length: numFretsVisible + 1 }).map((_, i) => {
                    const fretIdx = i + fretRange.start;
                    const note = getNoteAt(s, fretIdx);
                    const isTheoryNote = activeNotes.includes(note);
                    const shapeFret = getShapeNote(stringIdx, fretIdx);
                    const isVoicingNote = shapeFret !== null && shapeFret === fretIdx;
                    
                    if (fretIdx === 0 && !isVoicingNote) return null;

                    return (
                      <div key={fretIdx} className="absolute z-30 group -translate-x-1/2" style={{ left: `calc(3rem + ${i * fretWidthPercent}%)` }}>
                        {(isVoicingNote || isTheoryNote) && (
                          <div className={`absolute ${stringIdx <= 2 ? 'top-full mt-3' : 'bottom-full mb-3'} left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none min-w-[3rem]`}>
                            <div className="text-[10px] font-bold text-white">{note}</div>
                            {getIntervalCode(note) && <div className="text-[8px] text-indigo-400">{getIntervalCode(note)}</div>}
                          </div>
                        )}

                        {isVoicingNote ? (
                           <button 
                             onClick={() => handlePluck(note, stringIdx, fretIdx)}
                             className={`w-7 h-7 rounded-full flex flex-col items-center justify-center text-[9px] font-black shadow-lg border-2 transition-transform hover:scale-125 active:scale-95 ${
                             note === rootNote ? 'bg-indigo-600 border-white text-white' : 'bg-white border-indigo-500 text-indigo-900'
                           }`}>
                             {getLabel(note)}
                           </button>
                        ) : isTheoryNote && !selectedShape && !customAiVoicing ? (
                           <div 
                             onClick={() => handlePluck(note, stringIdx, fretIdx)}
                             className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black bg-slate-800/95 text-slate-400 border border-slate-700 cursor-pointer hover:bg-indigo-500 hover:text-white transition-all">
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
