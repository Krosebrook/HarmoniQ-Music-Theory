import React, { useState, useEffect } from 'react';
import { useTheory } from '../context/TheoryContext';
import { NoteName, TheoryType } from '../types';
import { NOTES, SCALES, CHORDS, GUITAR_VOICINGS } from '../constants';
import { PianoView } from './PianoView';
import { FretboardView } from './FretboardView';
import { CircleOfFifths } from './CircleOfFifths';
import { suggestChordVoicing, lookupScales } from '../services/gemini';
import { useAudio } from '../hooks/useAudio';

export const TheoryLab: React.FC = () => {
  const { 
    rootNote, setRootNote, 
    theoryType, setTheoryType, 
    selectedVariety, setSelectedVariety, 
    currentTheory, instrument, volume,
    isLookupMode, setIsLookupMode,
    manualNotes, setManualNotes
  } = useTheory();

  const { playChord } = useAudio(instrument, volume);

  const [selectedShape, setSelectedShape] = useState<string>('');
  const [customAiVoicing, setCustomAiVoicing] = useState<(number | null)[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [displayLabelMode, setDisplayLabelMode] = useState<'note' | 'interval'>('note');

  // Lookup mode results
  const [lookupResults, setLookupResults] = useState<{scale: string, reasoning: string}[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    setSelectedShape('');
    setCustomAiVoicing(null);
  }, [selectedVariety, theoryType, rootNote]);

  const handleGenerateAiVoicing = async () => {
    setIsAiLoading(true);
    try {
      const voicing = await suggestChordVoicing(rootNote, selectedVariety);
      setCustomAiVoicing(voicing);
      setSelectedShape('AI-Suggested');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePerformLookup = async () => {
    if (manualNotes.length < 2) return;
    setIsLookingUp(true);
    try {
      const results = await lookupScales(manualNotes);
      setLookupResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleApplyLookupResult = (scaleName: string) => {
    // Try to parse root from scale name e.g. "C Major"
    const parts = scaleName.split(' ');
    const note = NOTES.find(n => n === parts[0]);
    const variety = parts.slice(1).join(' ');
    
    if (note && SCALES[variety as keyof typeof SCALES]) {
      setRootNote(note as NoteName);
      setSelectedVariety(variety);
      setTheoryType(TheoryType.SCALE);
      setIsLookupMode(false);
      setLookupResults([]);
      setManualNotes([]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1 space-y-6">
        <section className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Instrument Config
            </h2>
            <button 
              onClick={() => setIsLookupMode(!isLookupMode)}
              className={`text-[10px] font-black px-2 py-1 rounded transition-all ${isLookupMode ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`}
              title="Identity Mode: Select notes to find matching scales"
            >
              LOOKUP MODE
            </button>
          </div>
          
          <div className="space-y-6">
            {!isLookupMode ? (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-3 ml-1">Root Frequency</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {NOTES.map((n) => (
                      <button
                        key={n}
                        onClick={() => setRootNote(n as NoteName)}
                        className={`h-9 rounded-lg text-sm font-bold transition-all ${
                          rootNote === n 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-3 ml-1">Structure Type</label>
                  <div className="flex gap-2">
                    {[TheoryType.SCALE, TheoryType.CHORD].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setTheoryType(type);
                          setSelectedVariety('Major');
                        }}
                        className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${
                          theoryType === type 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
                  <p className="text-[11px] text-amber-200/80 leading-relaxed font-medium">
                    Click notes on the piano or fretboard to collect them. I'll help you identify which scales they belong to.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {manualNotes.map(n => (
                    <span key={n} className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded">{n}</span>
                  ))}
                  {manualNotes.length === 0 && <span className="text-[10px] text-slate-600 italic">No notes selected...</span>}
                </div>
                <button
                  onClick={handlePerformLookup}
                  disabled={manualNotes.length < 2 || isLookingUp}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg disabled:opacity-50 transition-all"
                >
                  {isLookingUp ? 'Searching...' : 'Find Matching Scales'}
                </button>
                <button
                  onClick={() => setManualNotes([])}
                  className="w-full text-[10px] text-slate-500 font-bold hover:text-white"
                >
                  Clear Selection
                </button>
              </div>
            )}

            <div className="pt-6 border-t border-slate-700/50 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400">LABELING</label>
                <div className="flex bg-slate-900 rounded-lg p-1">
                  <button 
                    onClick={() => setDisplayLabelMode('note')}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${displayLabelMode === 'note' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                  >
                    ABC
                  </button>
                  <button 
                    onClick={() => setDisplayLabelMode('interval')}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${displayLabelMode === 'interval' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                  >
                    1-3-5
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lookup Results Panel */}
        {lookupResults.length > 0 && (
          <section className="bg-slate-800/60 border border-indigo-500/30 p-6 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4">
            <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">Identity Results</h3>
            <div className="space-y-4">
              {lookupResults.map((res, i) => (
                <div key={i} className="group cursor-pointer" onClick={() => handleApplyLookupResult(res.scale)}>
                  <div className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{res.scale}</div>
                  <div className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">{res.reasoning}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
          <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">Step Analysis</h3>
          <div className="text-xl font-black text-white mb-6 truncate">{currentTheory.name}</div>
          <div className="space-y-2">
            {currentTheory.notes.map((note, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-black border ${currentTheory.intervals[i] === 'R' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-700/50 text-slate-400 border-slate-600/50'}`}>
                  {currentTheory.intervals[i]}
                </div>
                <div className="flex-1 text-sm font-bold text-slate-200">{note}</div>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <div className="lg:col-span-3 space-y-8">
        <section className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-xl backdrop-blur-sm">
          <PianoView 
            activeNotes={isLookupMode ? manualNotes : currentTheory.notes} 
            isChordMode={theoryType === TheoryType.CHORD} 
            displayLabelMode={displayLabelMode}
            currentTheory={currentTheory}
          />
        </section>

        <section className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-xl backdrop-blur-sm">
          <FretboardView 
            activeNotes={isLookupMode ? manualNotes : currentTheory.notes} 
            rootNote={rootNote}
            chordVariety={selectedVariety}
            selectedShape={selectedShape}
            customAiVoicing={customAiVoicing}
            displayLabelMode={displayLabelMode}
            currentTheory={currentTheory}
          />
        </section>

        <section className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-xl backdrop-blur-sm">
          <CircleOfFifths 
            activeNotes={currentTheory.notes} 
            currentRoot={rootNote} 
            onSelectRoot={(note) => setRootNote(note as NoteName)}
          />
        </section>
      </div>
    </div>
  );
};
