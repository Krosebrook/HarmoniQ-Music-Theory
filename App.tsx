
import React, { useState, useEffect, useCallback } from 'react';
import { TheoryLab } from './components/TheoryLab';
import { ChatInterface } from './components/ChatInterface';
import { ImageGenerator } from './components/ImageGenerator';
import { ProgressionLab } from './components/ProgressionLab';
import { TheoryResult, NoteName, TheoryType, ProgressionStep } from './types';
import { NOTES, SCALES, CHORDS } from './constants';

const INTERVAL_MAP: Record<number, string> = {
  0: 'R', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: '#4', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7',
  12: '8', 13: 'b9', 14: '9', 15: '#9', 16: '10', 17: '11', 18: '#11', 19: '12', 20: 'b13', 21: '13'
};

const App: React.FC = () => {
  const [rootNote, setRootNote] = useState<NoteName>(NoteName.C);
  const [theoryType, setTheoryType] = useState<TheoryType>(TheoryType.SCALE);
  const [selectedVariety, setSelectedVariety] = useState<string>('Major');
  const [activeTab, setActiveTab] = useState<'theory' | 'progression' | 'chat' | 'art'>('theory');
  
  const [activeProgressionStep, setActiveProgressionStep] = useState<number>(0);
  const [progression, setProgression] = useState<ProgressionStep[]>([]);

  const calculateTheory = useCallback((): TheoryResult => {
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

  const [currentTheory, setCurrentTheory] = useState<TheoryResult>(calculateTheory());

  useEffect(() => {
    setCurrentTheory(calculateTheory());
  }, [calculateTheory]);

  const handleProgressionSelect = (step: ProgressionStep, index: number) => {
    setTheoryType(TheoryType.CHORD);
    setRootNote(step.root);
    setSelectedVariety(step.variety);
    setActiveProgressionStep(index);
    setActiveTab('theory');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">H</div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              HarmoniQ
            </h1>
          </div>
          
          <nav className="flex gap-1 bg-slate-800/50 p-1 rounded-xl">
            {(['theory', 'progression', 'chat', 'art'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
        {activeTab === 'theory' && (
          <TheoryLab 
            rootNote={rootNote}
            setRootNote={setRootNote}
            theoryType={theoryType}
            setTheoryType={setTheoryType}
            selectedVariety={selectedVariety}
            setSelectedVariety={setSelectedVariety}
            currentTheory={currentTheory}
          />
        )}

        {activeTab === 'progression' && (
          <ProgressionLab 
            currentKey={rootNote}
            onSelectChord={handleProgressionSelect}
            progression={progression}
            setProgression={setProgression}
          />
        )}
        
        {activeTab === 'chat' && (
          <ChatInterface />
        )}

        {activeTab === 'art' && (
          <ImageGenerator />
        )}
      </main>

      <footer className="border-t border-slate-800 p-4 text-center text-slate-500 text-sm">
        Built with Gemini 3 Pro • Advanced Music Theory Visualizer
      </footer>
    </div>
  );
};

export default App;
