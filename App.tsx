
import React, { Suspense, lazy } from 'react';
import { TheoryProvider, useTheory } from './context/TheoryContext';
import { TheoryLab } from './components/TheoryLab';

const ProgressionLab = lazy(() => import('./components/ProgressionLab').then(m => ({ default: m.ProgressionLab })));
const ChatInterface = lazy(() => import('./components/ChatInterface').then(m => ({ default: m.ChatInterface })));
const ImageGenerator = lazy(() => import('./components/ImageGenerator').then(m => ({ default: m.ImageGenerator })));

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, instrument, setInstrument, volume, setVolume } = useTheory();

  const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 text-sm font-medium animate-pulse">Loading Workspace...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-indigo-500/20">H</div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              HarmoniQ <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-2 align-middle">PRO</span>
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

          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-slate-800">
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button 
                onClick={() => setInstrument('piano')}
                className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${instrument === 'piano' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
              >
                Piano
              </button>
              <button 
                onClick={() => setInstrument('guitar')}
                className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${instrument === 'guitar' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
              >
                Guitar
              </button>
            </div>
            <input 
              type="range" min="0" max="1" step="0.1" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-indigo-500 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === 'theory' && <TheoryLab />}
          {activeTab === 'progression' && <ProgressionLab />}
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'art' && <ImageGenerator />}
        </Suspense>
      </main>

      <footer className="border-t border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
        <div>© 2025 HarmoniQ Music Theory Lab • v1.6.0-PWA</div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Audio System Ready</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Gemini 3 Online</span>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <TheoryProvider>
    <AppContent />
  </TheoryProvider>
);

export default App;
