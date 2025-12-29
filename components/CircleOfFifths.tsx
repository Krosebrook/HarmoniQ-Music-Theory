
import React from 'react';

interface CircleOfFifthsProps {
  activeNotes: string[];
  currentRoot: string;
  onSelectRoot: (note: string) => void;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ activeNotes, currentRoot, onSelectRoot }) => {
  // Major keys clockwise in fifths
  const majorSequence = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  // Relative minors (C major -> A minor)
  const minorSequence = ['A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D'];
  
  const outerRadius = 125;
  const innerRadius = 85;
  const centerX = 160;
  const centerY = 160;

  // Helper to get coordinates
  const getCoords = (index: number, r: number) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  // Build polygon path for active notes
  const activePoints = majorSequence
    .map((note, i) => activeNotes.includes(note) ? getCoords(i, outerRadius) : null)
    .filter((p): p is {x: number, y: number} => p !== null);

  const polygonPath = activePoints.length > 2 
    ? `M ${activePoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`
    : '';

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <svg width="320" height="320" className="overflow-visible select-none">
          {/* Background Ring Defs */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connection Polygon */}
          {polygonPath && (
            <path
              d={polygonPath}
              className="fill-indigo-500/10 stroke-indigo-500/40"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          )}

          {/* Major Keys (Outer Ring) */}
          {majorSequence.map((note, i) => {
            const { x, y } = getCoords(i, outerRadius);
            const isActive = activeNotes.includes(note);
            const isRoot = currentRoot === note;

            return (
              <g 
                key={`major-${note}`} 
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => onSelectRoot(note)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isRoot ? 22 : 18}
                  className={`transition-all duration-300 ${
                    isActive 
                      ? isRoot ? 'fill-indigo-600 stroke-white' : 'fill-indigo-500 stroke-indigo-300'
                      : 'fill-slate-800 stroke-slate-700 hover:fill-slate-700'
                  }`}
                  strokeWidth={isActive ? 2 : 1}
                  filter={isActive ? 'url(#glow)' : ''}
                />
                <text
                  x={x}
                  y={y}
                  dy=".35em"
                  textAnchor="middle"
                  className={`text-[11px] font-bold pointer-events-none ${
                    isActive ? 'fill-white' : 'fill-slate-400'
                  }`}
                >
                  {note}
                </text>
              </g>
            );
          })}

          {/* Minor Keys (Inner Ring) */}
          {minorSequence.map((note, i) => {
            const { x, y } = getCoords(i, innerRadius);
            const isActive = activeNotes.includes(note);
            
            return (
              <g 
                key={`minor-${note}`} 
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => onSelectRoot(note)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={14}
                  className={`transition-all duration-300 ${
                    isActive 
                      ? 'fill-indigo-900 stroke-indigo-400'
                      : 'fill-slate-900/80 stroke-slate-800 hover:fill-slate-800'
                  }`}
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={y}
                  dy=".35em"
                  textAnchor="middle"
                  className={`text-[9px] font-medium pointer-events-none italic ${
                    isActive ? 'fill-indigo-200' : 'fill-slate-600'
                  }`}
                >
                  {note.toLowerCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Root</div>
          <div className="text-xl font-black text-indigo-400">{currentRoot}</div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Outer Ring</div>
          <div className="text-xs text-slate-300">Major Keys & Mixolydian modes</div>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Inner Ring</div>
          <div className="text-xs text-slate-300">Relative Minor / Aeolian modes</div>
        </div>
      </div>
    </div>
  );
};
