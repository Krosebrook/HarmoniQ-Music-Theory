
import React, { useState, useEffect, useCallback } from 'react';
import { useTheory } from '../context/TheoryContext';
import { useAudio } from '../hooks/useAudio';
import { NOTES, CHORDS, INTERVALS } from '../constants';
import { QuizMode, QuizQuestion, QuizStats } from '../types';

export const EarTrainingLab: React.FC = () => {
  const { instrument, volume } = useTheory();
  const { playChord, playNote } = useAudio(instrument, volume);
  
  const [mode, setMode] = useState<QuizMode>('interval');
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Stats persistence
  const [stats, setStats] = useState<QuizStats>(() => {
    const saved = localStorage.getItem('harmoniq_quiz_stats');
    return saved ? JSON.parse(saved) : { correct: 0, total: 0, streak: 0, bestStreak: 0 };
  });

  useEffect(() => {
    localStorage.setItem('harmoniq_quiz_stats', JSON.stringify(stats));
  }, [stats]);

  const generateQuestion = useCallback(() => {
    const rootIdx = Math.floor(Math.random() * NOTES.length);
    const rootNote = NOTES[rootIdx];
    const octave = 0; // Middle C range

    let newQuestion: QuizQuestion;

    if (mode === 'interval') {
      const intervalIdx = Math.floor(Math.random() * INTERVALS.length);
      const interval = INTERVALS[intervalIdx];
      const targetIdx = (rootIdx + interval.semitones) % 12;
      const targetNote = NOTES[targetIdx];
      
      // Generate 3 wrong answers
      const wrongOptions = INTERVALS
        .filter(i => i.label !== interval.label)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(i => i.label);
      
      const options = [interval.label, ...wrongOptions].sort(() => 0.5 - Math.random());

      newQuestion = {
        type: 'interval',
        root: rootNote,
        notes: [rootNote, targetNote], // Sequential or Chord? We'll play sequential for interval
        correctAnswer: interval.label,
        options
      };
    } else {
      // Chord Mode
      const chordTypes = Object.keys(CHORDS).filter(k => ['Major', 'Minor', 'Augmented', 'Diminished', 'Major 7th', 'Minor 7th', 'Dominant 7th'].includes(k));
      const correctType = chordTypes[Math.floor(Math.random() * chordTypes.length)];
      const semitones = CHORDS[correctType as keyof typeof CHORDS];
      
      const chordNotes = semitones.map(s => NOTES[(rootIdx + s) % 12]);
      
      const wrongOptions = chordTypes
        .filter(t => t !== correctType)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      const options = [correctType, ...wrongOptions].sort(() => 0.5 - Math.random());

      newQuestion = {
        type: 'chord',
        root: rootNote,
        notes: chordNotes,
        correctAnswer: correctType,
        options
      };
    }

    setQuestion(newQuestion);
    setLastFeedback(null);
    setSelectedOption(null);
    
    // Auto-play after a short delay
    setTimeout(() => playSound(newQuestion), 300);
  }, [mode]);

  const playSound = (q: QuizQuestion | null = question) => {
    if (!q) return;
    
    if (q.type === 'interval') {
      // Play root, wait, play target
      playNote(q.notes[0], 0);
      setTimeout(() => playNote(q.notes[1], q.notes[1] === 'C' && q.notes[0] !== 'C' ? 1 : 0), 600);
    } else {
      // Play chord
      // Stagger slightly for guitar feel
      playChord(q.notes, 0, instrument === 'guitar' ? 40 : 0);
    }
  };

  const handleAnswer = (answer: string) => {
    if (lastFeedback !== null || !question) return;
    
    setSelectedOption(answer);
    const isCorrect = answer === question.correctAnswer;
    
    if (isCorrect) {
      setLastFeedback('correct');
      setStats(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1)
      }));
      // Auto-advance
      setTimeout(generateQuestion, 1500);
    } else {
      setLastFeedback('wrong');
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        streak: 0
      }));
    }
  };

  // Initial load
  useEffect(() => {
    if (!question) generateQuestion();
  }, [generateQuestion]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Mode</span>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => setMode('interval')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${mode === 'interval' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}
            >
              Intervals
            </button>
            <button 
              onClick={() => setMode('chord')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${mode === 'chord' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}
            >
              Chords
            </button>
          </div>
        </div>
        
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Current Streak</span>
          <span className={`text-2xl font-black ${stats.streak > 4 ? 'text-emerald-400' : 'text-white'}`}>
            {stats.streak} 🔥
          </span>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Accuracy</span>
          <span className="text-2xl font-black text-indigo-400">
            {stats.total === 0 ? '100' : Math.round((stats.correct / stats.total) * 100)}%
          </span>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Best Streak</span>
          <span className="text-2xl font-black text-amber-400">
            {stats.bestStreak} 🏆
          </span>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-xl backdrop-blur-sm relative overflow-hidden">
        
        <div className="flex flex-col items-center justify-center space-y-8 min-h-[300px]">
          {/* Play Button */}
          <button
            onClick={() => playSound()}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-xl shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white group-hover:animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <p className="text-slate-400 text-sm font-medium">Tap to hear the {mode}</p>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            {question?.options.map((option) => {
              let stateClass = 'bg-slate-700 hover:bg-slate-600 border-slate-600';
              
              if (lastFeedback) {
                if (option === question.correctAnswer) {
                  stateClass = 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]';
                } else if (option === selectedOption) {
                  stateClass = 'bg-red-500/80 border-red-500 text-white';
                } else {
                  stateClass = 'bg-slate-700/50 opacity-50 border-slate-700';
                }
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={lastFeedback !== null}
                  className={`p-4 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${stateClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback Message */}
          <div className={`h-8 flex items-center justify-center transition-opacity duration-300 ${lastFeedback ? 'opacity-100' : 'opacity-0'}`}>
            {lastFeedback === 'correct' ? (
              <span className="text-emerald-400 font-bold text-lg animate-bounce">Correct! Next question coming...</span>
            ) : (
              <span className="text-red-400 font-bold text-lg">Incorrect. It was a {question?.correctAnswer}.</span>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
      </div>

      <div className="flex justify-center gap-4">
         <button 
           onClick={() => setStats({ correct: 0, total: 0, streak: 0, bestStreak: 0 })}
           className="text-xs text-slate-500 hover:text-red-400 transition-colors"
         >
           Reset Statistics
         </button>
         <button 
           onClick={generateQuestion}
           className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
         >
           Skip Question
         </button>
      </div>
    </div>
  );
};
