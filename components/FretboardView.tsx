
import React, { useState, useMemo } from 'react';
import { NOTES, GUITAR_VOICINGS } from '../constants';
import { TheoryResult } from '../types';

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
const FB_HEIGHT = 160;
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

  const getXPos = (fret: number) => {
    if (fret < fretRange.start || fret > fretRange.end) return -100;
    const relativeFret = fret - fretRange.start;
    return 48 + (relativeFret * ((FB_WIDTH - 48) / (numFretsVisible + 1)));
  };

  const renderLegatoPaths = () => {
    if (!showTechniques) return null;
    const paths: React.ReactNode[] = [];
    
    STRINGS.forEach((s, stringIdx) => {
      const activeFretsOnString: number[] = [];
      const voicedFretsOnString: number[] = [];
      
      for (let f = fretRange.start; f <= fretRange.end; f++) {
        const isNoteActive = activeNotes.includes(getNoteAt(s, f));
        if (isNoteActive) {
          activeFretsOnString.push(f);
          if (getShapeNote(stringIdx, f) !== null) {
            voicedFretsOnString.push(f);
          }
        }
      }

      for (let i = 0; i < activeFretsOnString.length - 1; i++) {
        const fretA = activeFretsOnString[i];
        const fretB = activeFretsOnString[i + 1];
        const dist = fretB - fretA;
        
        if (dist > 0 && dist <= 4) {
          const x1 = getXPos(fretA);
          const x2 = getXPos(fretB);
          // Standardize Y mapping to match string positions in UI
          const y = FB_TOP_GUTTER + stringIdx * ((FB_HEIGHT - 20) / 5);
          const midX = (x1 + x2) / 2;
          const arcHeight = Math.min(dist * 14, 32);
          
          const isBothVoiced = voicedFretsOnString.includes(fretA) && voicedFretsOnString.includes(fretB);
          const opacity = isBothVoiced ? 1 : 0.3;
          const hColor = isBothVoiced ? 'rgb(99, 102, 241)' : 'rgb(100, 116, 139)';
          const pColor = isBothVoiced ? 'rgb(139, 92, 246)' : 'rgb(71, 85, 105)';

          // Hammer-on path
          paths.push(
            <g key={`h-${stringIdx}-${fretA}-${fretB}`} className="transition-all duration-500" style={{ opacity }}>
              <path
                d={`M ${x1 + 14} ${y - 6} C ${x1 + 20} ${y - arcHeight}, ${x2 - 20} ${y - arcHeight}, ${x2 - 14} ${y - 6}`}
                fill="none"
                stroke={hColor}
                strokeWidth={isBothVoiced ? "2.5" : "1.5"}
                markerEnd="url(#arrow-h)"
                className={isBothVoiced ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}
              >
                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
              </path>
              <text x={midX} y={y - arcHeight - 4} textAnchor="middle" className={`font-mono text-[9px] font-black ${isBothVoiced ? 'fill-indigo-300' : 'fill-slate-600'}`}>H</text>
            </g>
          );

          // Pull-off path
          paths.push(
            <g key={`p-${stringIdx}-${fretA}-${fretB}`} className="transition-all duration-500" style={{ opacity: opacity * 0.8 }}>
              <path
                d={`M ${x2 - 14} ${y + 6} C ${x2 - 20} ${y + arcHeight}, ${x1 + 20} ${y + arcHeight}, ${x1 + 14} ${y + 6}`}
                fill="none"
                stroke={pColor}
                strokeWidth={isBothVoiced ? "2" : "1"}
                strokeDasharray="4 2"
                markerEnd="url(#arrow-p)"
              />
              <text x={midX} y={y + arcHeight + 11} textAnchor="middle" className={`font-mono text-[9px] font-black ${isBothVoiced ? 'fill-violet-400' : 'fill-slate-700'}`}>P</text>
            </g>
          );
        }
      }
    });
    return paths;
  };

  const zoomOptions = [
    { label: 'Full Neck', start: 0, end: 15 },
    { label: 'Nut (0-5)', start: 0, end: 5 },
    { label: 'Mid (5-10)', start: 5, end: 10 },
    { label: 'High (10-15)', start: 10, end: 15 },
  ];

  return (
    <div className="space-y-4">
      {/* Zoom Controls */}
      <div className="flex gap-2 items-center bg-slate-900/50 p-2 rounded-lg border border-slate-800">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Zoom Range:</span>
        <div className="flex gap-1">
          {zoomOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setFretRange({ start: opt.start, end: opt.end })}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all border ${
                fretRange.start === opt.start && fretRange.end === opt.end 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto border border-slate-800 shadow-2xl group/fretboard relative">
        <div className="relative min-w-[800px] h-72">
          {/* Fret Highlight on Hover */}
          {hoveredFret !== null && hoveredFret > fretRange.start && (
            <div 
              className="absolute top-4 bottom-14 w-12 bg-indigo-500/10 border-x border-indigo-500/20 pointer-events-none z-0 transition-all duration-100"
              style={{ left: `calc(3rem + ${(hoveredFret - fretRange.start - 0.5) * fretWidthPercent}%)` }}
            />
          )}

          {/* Nut Styling */}
          {fretRange.start === 0 && (
            <div className="absolute left-12 top-4 bottom-14 w-3 bg-gradient-to-b from-slate-300 via-slate-500 to-slate-300 rounded-sm z-20 shadow-[2px_0_8px_rgba(0,0,0,0.5)] border-x border-slate-600"></div>
          )}
          
          <div className="flex absolute inset-0 pt-4 pb-14">
            <div className="w-12"></div>
            {Array.from({ length: numFretsVisible }).map((_, i) => {
              const currentFretNum = i + 1 + fretRange.start;
              return (
                <div 
                  key={i} 
                  className={`flex-1 h-full border-r border-slate-800/80 relative transition-colors duration-200 ${hoveredFret === currentFretNum ? 'bg-indigo-500/5' : ''}`}
                  onMouseEnter={() => setHoveredFret(currentFretNum)}
                  onMouseLeave={() => setHoveredFret(null)}
                >
                  {/* Position Markers */}
                  {[3, 5, 7, 9, 15].includes(currentFretNum) && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-700 rounded-full border border-slate-800"></div>
                  )}
                  {currentFretNum === 12 && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    </div>
                  )}
                  {/* Fret Number Label */}
                  <div className={`absolute -bottom-14 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase transition-colors ${hoveredFret === currentFretNum ? 'text-indigo-400' : 'text-slate-600'}`}>
                    {currentFretNum}
                  </div>
                </div>
              );
            })}
          </div>

          <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox={`0 0 ${FB_WIDTH} 288`} preserveAspectRatio="xMinYMin meet">
            <defs>
              <marker id="arrow-h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(99, 102, 241)" />
              </marker>
              <marker id="arrow-p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(139, 92, 246)" />
              </marker>
            </defs>
            {renderLegatoPaths()}
          </svg>

          <div className="absolute top-4 left-0 right-0 bottom-14 flex flex-col justify-between py-2">
            {STRINGS.map((s, stringIdx) => {
              const reversedIdx = 5 - stringIdx;
              const isStringMuted = customAiVoicing 
                ? customAiVoicing[reversedIdx] === null 
                : selectedShape && GUITAR_VOICINGS[chordVariety || 'Major']?.[selectedShape]?.[reversedIdx] === null;

              return (
                <div key={stringIdx} className="relative h-0 flex items-center">
                  {/* String Texture Rendering */}
                  <div className="absolute left-12 right-0 bg-gradient-to-r from-slate-400/40 via-slate-500/30 to-slate-400/40 shadow-sm" style={{ height: `${1.4 + (stringIdx * 0.4)}px` }}></div>
                  <div className="w-12 text-center text-[10px] font-black text-slate-500 pr-3 uppercase tracking-tighter select-none">{s}</div>
                  
                  {/* Muted indicator above nut */}
                  {fretRange.start === 0 && isStringMuted && (
                    <div className="absolute left-[34px] z-40 text-red-500 font-bold text-lg -translate-y-[4px] animate-pulse drop-shadow-lg select-none">×</div>
                  )}

                  {Array.from({ length: numFretsVisible + 1 }).map((_, i) => {
                    const fretIdx = i + fretRange.start;
                    const note = getNoteAt(s, fretIdx);
                    const isTheoryNote = activeNotes.includes(note);
                    const shapeFret = getShapeNote(stringIdx, fretIdx);
                    const isVoicingNote = shapeFret !== null && shapeFret === fretIdx;
                    
                    return (
                      <div key={fretIdx} className="absolute z-30" style={{ left: `calc(3rem + ${i * fretWidthPercent}%)` }}>
                        {isVoicingNote ? (
                           <button className={`-translate-x-1/2 w-8 h-8 rounded-full flex flex-col items-center justify-center text-[10px] font-black shadow-[0_5px_15px_rgba(0,0,0,0.5)] border-2 transition-all hover:scale-125 hover:z-50 select-none cursor-default ${
                             note === rootNote 
                               ? 'bg-indigo-600 border-white text-white ring-4 ring-indigo-500/20' 
                               : 'bg-white border-indigo-500 text-indigo-900 ring-4 ring-white/10'
                           }`}>
                             {getLabel(note)}
                           </button>
                        ) : isTheoryNote && !selectedShape && !customAiVoicing ? (
                           <div className={`-translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all select-none border ${
                             fretIdx === 0 
                               ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                               : 'bg-slate-800/95 text-slate-400 border-slate-700 group-hover/fretboard:border-slate-600 hover:text-white hover:border-slate-400'
                           }`}>
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
      <div className="flex justify-between items-center px-1">
        <p className="text-[10px] text-slate-500 italic">
          * Solid paths: Hammer-on (H) • Dashed paths: Pull-off (P)
        </p>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest bg-slate-800/30 px-2 py-0.5 rounded"> Standard E-A-D-G-B-E </span>
      </div>
    </div>
  );
};
