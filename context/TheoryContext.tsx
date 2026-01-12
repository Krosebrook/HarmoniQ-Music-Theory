import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { TheoryResult, NoteName, TheoryType, ProgressionStep, DiatonicChord } from '../types';
import { NOTES, SCALES, CHORDS, INTERVAL_MAP, DIATONIC_QUALITIES } from '../constants';

interface TheoryContextType {
  rootNote: NoteName;
  setRootNote: (n: NoteName) => void;
  theoryType: TheoryType;
  setTheoryType: (t: TheoryType) => void;
  selectedVariety: string;
  setSelectedVariety: (v: string) => void;
  currentTheory: TheoryResult;
  activeTab: string;
  setActiveTab: (t: any) => void;
  progression: ProgressionStep[];
  setProgression: (p: ProgressionStep[]) => void;
  instrument: 'piano' | 'guitar';
  setInstrument: (i: 'piano' | 'guitar') => void;
  volume: number;
  setVolume: (v: number) => void;
  // Reverse Lookup State
  isLookupMode: boolean;
  setIsLookupMode: (b: boolean) => void;
  manualNotes: string[];
  setManualNotes: (notes: string[]) => void;
}

const TheoryContext = createContext<TheoryContextType | undefined>(undefined);

export const TheoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedState = useMemo(() => {
    const data = localStorage.getItem('harmoniq_settings');
    return data ? JSON.parse(data) : {};
  }, []);

  const [rootNote, setRootNote] = useState<NoteName>(savedState.rootNote || NoteName.C);
  const [theoryType, setTheoryType] = useState<TheoryType>(savedState.theoryType || TheoryType.SCALE);
  const [selectedVariety, setSelectedVariety] = useState<string>(savedState.selectedVariety || 'Major');
  const [activeTab, setActiveTab] = useState<any>(savedState.activeTab || 'theory');
  const [progression, setProgression] = useState<ProgressionStep[]>([]);
  const [instrument, setInstrument] = useState<'piano' | 'guitar'>(savedState.instrument || 'piano');
  const [volume, setVolume] = useState<number>(savedState.volume ?? 0.5);

  // Lookup mode
  const [isLookupMode, setIsLookupMode] = useState(false);
  const [manualNotes, setManualNotes] = useState<string[]>([]);

  const currentTheory = useMemo(() => {
    const rootIndex = NOTES.indexOf(rootNote);
    const semitones = theoryType === TheoryType.SCALE 
      ? SCALES[selectedVariety as keyof typeof SCALES] 
      : CHORDS[selectedVariety as keyof typeof CHORDS];
    
    const notes = semitones.map(s => {
      const idx = (rootIndex + s) % 12;
      return NOTES[idx];
    });

    const intervals = semitones.map(s => INTERVAL_MAP[s] || s.toString());

    let diatonicChords: DiatonicChord[] = [];
    if (theoryType === TheoryType.SCALE && (selectedVariety === 'Major' || selectedVariety === 'Natural Minor')) {
      const qualities = DIATONIC_QUALITIES[selectedVariety];
      diatonicChords = notes.map((note, i) => {
        const quality = qualities[i];
        if (!quality) return null;
        
        const chordRootIdx = NOTES.indexOf(note);
        const chordSemitones = CHORDS[quality.seventh as keyof typeof CHORDS];
        const chordNotes = chordSemitones.map(s => NOTES[(chordRootIdx + s) % 12]);
        
        return {
          root: note,
          variety: quality.seventh,
          numeral: quality.numeral,
          notes: chordNotes
        };
      }).filter((c): c is DiatonicChord => c !== null);
    }

    return {
      notes,
      intervals,
      name: `${rootNote} ${selectedVariety}`,
      diatonicChords
    };
  }, [rootNote, theoryType, selectedVariety]);

  useEffect(() => {
    localStorage.setItem('harmoniq_settings', JSON.stringify({
      rootNote, theoryType, selectedVariety, activeTab, instrument, volume
    }));
  }, [rootNote, theoryType, selectedVariety, activeTab, instrument, volume]);

  return (
    <TheoryContext.Provider value={{
      rootNote, setRootNote,
      theoryType, setTheoryType,
      selectedVariety, setSelectedVariety,
      currentTheory,
      activeTab, setActiveTab,
      progression, setProgression,
      instrument, setInstrument,
      volume, setVolume,
      isLookupMode, setIsLookupMode,
      manualNotes, setManualNotes
    }}>
      {children}
    </TheoryContext.Provider>
  );
};

export const useTheory = () => {
  const context = useContext(TheoryContext);
  if (!context) throw new Error('useTheory must be used within a TheoryProvider');
  return context;
};
