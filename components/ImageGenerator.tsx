
import React, { useState } from 'react';
import { generateTheoryImage } from '../services/gemini';
import { ImageSize } from '../types';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateTheoryImage(prompt, size);
      setGeneratedImageUrl(url);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Requested entity was not found')) {
        setError('Please re-select your Pro API key to continue.');
      } else {
        setError('Failed to generate image. Please try a different prompt.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Visual Theory Lab</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate high-fidelity artistic visualizations of musical concepts using Gemini 3 Pro Vision. 
                Perfect for album art, educational posters, or conceptual inspiration.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Creative Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A futuristic 3D abstract sculpture representing the C-Major scale, crystalline structures, neon blue and gold palette, cinematic lighting..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 h-32 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target Resolution</label>
                <div className="flex gap-2">
                  {[ImageSize.SIZE_1K, ImageSize.SIZE_2K, ImageSize.SIZE_4K].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        size === s 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 px-1">
                  Note: Higher resolutions take significantly longer to generate.
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Synthesizing Visuals...
                  </>
                ) : (
                  'Generate High-Fidelity Artwork'
                )}
              </button>
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="aspect-video bg-slate-900 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden shadow-inner relative group">
            {generatedImageUrl ? (
              <img 
                src={generatedImageUrl} 
                alt="Generated theoretical visualization" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm italic">Generated artwork will appear here</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl animate-bounce mb-4 flex items-center justify-center font-bold text-white text-2xl">?</div>
                <h3 className="text-white font-bold mb-1">Painting with AI...</h3>
                <p className="text-slate-400 text-xs">Nano Banana Pro is processing your request</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 px-2">
         {[
           "Geometric patterns showing the frequency relationships of a C-major chord",
           "Abstract expressionist painting of a jazz saxophonist playing complex scales",
           "The circle of fifths reimagined as an intricate celestial map",
           "A visual representation of dissonance and resolution in a dark forest"
         ].map((p, i) => (
           <button 
            key={i}
            onClick={() => setPrompt(p)}
            className="flex-shrink-0 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-400 hover:text-slate-200 hover:border-indigo-500/50 transition-all"
           >
             Try: {p.slice(0, 30)}...
           </button>
         ))}
      </div>
    </div>
  );
};
