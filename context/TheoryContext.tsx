
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TheoryResult, NoteName, TheoryType, ProgressionStep } from '../types';
import { NOTES, SCALES, CHORDS } from '../constants';

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
}

const INTERVAL_MAP: Record<number, string> = {
  0: 'R', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: '#4', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7',
  12: '8', 13: 'b9', 14: '9', 15: '#9', 16: '10', 17: '11', 18: '#11', 19: '12', 20: 'b13', 21: '13'
};

const TheoryContext = createContext<TheoryContextType | undefined>(undefined);

export const TheoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence Loading
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

    return {
      notes,
      intervals,
      name: `${rootNote} ${selectedVariety}`
    };
  }, [rootNote, theoryType, selectedVariety]);

  // Persist settings
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
      volume, setVolume
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
