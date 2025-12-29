# GitHub Copilot Build Prompt for HarmoniQ

## Master Context Prompt for GitHub Copilot

This is a comprehensive context prompt designed for GitHub Copilot (in-editor) to understand the HarmoniQ project deeply and assist with feature development, bug fixes, and refactoring.

---

## Project Overview

**Name:** HarmoniQ - Pro Music Theory Lab  
**Type:** React 19 + TypeScript music theory visualization and education platform  
**Purpose:** Interactive learning tool for scales, chords, progressions, and guitar fretboard theory  
**Tech Stack:** React 19, TypeScript 5.8, Vite 6.2, Tailwind CSS, Google Gemini 3 API

---

## Core Architecture Understanding

### 1. Type System (`types.ts`)

HarmoniQ uses a strict type system for music theory concepts:

```typescript
// Core music theory types
export enum NoteName {
  C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B
}

export enum TheoryType {
  SCALE = 'Scale',
  CHORD = 'Chord',
  PROGRESSION = 'Progression'
}

export interface TheoryResult {
  notes: string[];      // Note names in the scale/chord
  intervals: string[];  // Interval notation (R, M2, m3, P5, etc.)
  name: string;         // Full name (e.g., "C Major")
  numeral?: string;     // Roman numeral (for progressions)
}
```

**When generating code:**
- Always use NoteName enum instead of strings
- Use TheoryType enum for mode selection
- Return TheoryResult interface for calculations
- Never use magic numbers for intervals; reference INTERVAL_MAP

### 2. Music Theory Data (`constants.tsx`)

**Scales**: Defined as semitone arrays from root
```typescript
export const SCALES = {
  'Major': [0, 2, 4, 5, 7, 9, 11],        // W-W-H-W-W-W-H
  'Natural Minor': [0, 2, 3, 5, 7, 8, 10], // W-H-W-W-H-W-W
  'Dorian': [0, 2, 3, 5, 7, 9, 10],       // Modal scale
  // ... 12 scales total
};
```

**Chords**: Similarly structured
```typescript
export const CHORDS = {
  'Major': [0, 4, 7],           // Root, Major 3rd, Perfect 5th
  'Minor 7th': [0, 3, 7, 10],   // Root, Minor 3rd, Perfect 5th, Minor 7th
  // ... 11 chord types
};
```

**When adding scales/chords:**
- Verify interval accuracy with music theory references
- Use standard flat notation (Db, Eb, not C#, D#)
- Comment with whole-step/half-step patterns
- Include characteristic intervals in comments

### 3. Component Architecture

**Main Components:**

1. **App.tsx** - Root component, state management, tab routing
   - Manages global state (root note, theory type, active tab)
   - Calculates theory data with `calculateTheory()` hook
   - Routes to TheoryLab, ProgressionLab, ChatInterface, ImageGenerator

2. **TheoryLab.tsx** (291 lines) - Primary theory interface
   - Controls for note/type/variety selection
   - Renders Piano, Fretboard, CircleOfFifths
   - Guitar shape selection and AI voicing

3. **FretboardView.tsx** (332 lines) - Complex SVG guitar visualization
   - 6 strings, 15 frets, interactive highlighting
   - Legato markers (hammer-on/pull-off)
   - Zoom functionality
   - **Note**: This is the most complex component; decompose when editing

4. **ProgressionLab.tsx** (180 lines) - Chord progression builder
   - Template library (10 pre-built progressions)
   - AI-powered mood-based generation
   - Interactive chord selection

5. **ChatInterface.tsx** (100 lines) - AI music theory tutor
6. **ImageGenerator.tsx** (149 lines) - Visual concept art generator
7. **PianoView.tsx** (97 lines) - 2-octave piano visualization
8. **CircleOfFifths.tsx** (157 lines) - SVG circle of fifths

**When creating new components:**
- Use functional components with hooks
- Extract complex logic into custom hooks
- Keep components under 200 lines (refactor if larger)
- Always include TypeScript types for props

### 4. Service Layer (`services/gemini.ts`)

**AI Integration Patterns:**

```typescript
// Chat: Conversational music theory teaching
export const getGeminiChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a world-class music theory professor..."
    }
  });
};

// Structured Generation: JSON output with schema validation
export const suggestProgression = async (mood: string, key: string) => {
  // Uses responseMimeType: "application/json" with responseSchema
  // Returns validated ProgressionStep[]
};

// Guitar Voicing: AI-powered chord fingerings
export const suggestChordVoicing = async (root: string, variety: string) => {
  // Returns (number | null)[] - 6 elements for 6 strings
};
```

**When working with AI services:**
- Always use structured output with JSON schema
- Include music theory constraints in prompts
- Handle API errors gracefully with try/catch
- Validate AI responses against music theory rules
- Use gemini-3-flash-preview for fast operations
- Use gemini-3-pro-preview for complex reasoning

---

## Development Guidelines

### Code Style

**TypeScript:**
- Strict mode enabled
- Explicit return types for functions
- Prefer interfaces over types for objects
- Use enums for fixed sets of values

**React:**
- Functional components only
- Use hooks: useState, useEffect, useCallback, useMemo
- Custom hooks for reusable logic (prefix with `use`)
- Props destructuring in function signature

**Naming Conventions:**
- Components: PascalCase (TheoryLab)
- Hooks: camelCase with 'use' prefix (useTheoryCalculation)
- Constants: UPPER_SNAKE_CASE (SCALES, CHORDS)
- Variables: camelCase (rootNote, theoryType)
- Functions: camelCase (calculateTheory, handleProgressionSelect)

**File Organization:**
```
/
├── App.tsx                 # Root component
├── types.ts                # All type definitions
├── constants.tsx           # Music theory data
├── index.tsx              # Entry point
├── components/            # UI components
│   ├── TheoryLab.tsx
│   ├── FretboardView.tsx
│   └── ...
└── services/              # API integrations
    └── gemini.ts
```

### Music Theory Best Practices

**Scale Generation:**
```typescript
// ✅ CORRECT: Use modulo for circular note system
const notes = semitones.map(s => {
  const idx = (rootIndex + s) % 12;
  return NOTES[idx];
});

// ❌ INCORRECT: Will overflow for high semitones
const notes = semitones.map(s => NOTES[rootIndex + s]);
```

**Interval Naming:**
```typescript
// ✅ CORRECT: Use standard interval notation
const INTERVAL_MAP = {
  0: 'R',   // Root
  1: 'b2',  // Minor 2nd
  2: '2',   // Major 2nd
  3: 'b3',  // Minor 3rd
  4: '3',   // Major 3rd
  5: '4',   // Perfect 4th
  6: '#4',  // Augmented 4th / Diminished 5th (tritone)
  7: '5',   // Perfect 5th
  // ...
};

// ❌ INCORRECT: Non-standard notation
const intervals = ['Root', 'Second', 'Third']; // Use abbreviations
```

**Guitar Voicing Validation:**
```typescript
// ✅ CORRECT: Validate playability
function isPlayable(voicing: (number | null)[]): boolean {
  const frets = voicing.filter(f => f !== null) as number[];
  if (frets.length === 0) return false;
  
  const span = Math.max(...frets) - Math.min(...frets);
  return span <= 5; // Max 5-fret span for most players
}

// ✅ CORRECT: 6-string array with nulls for muted strings
const eMinorOpen: (number | null)[] = [0, 2, 2, 0, 0, 0];
```

### Performance Optimization

**Memoization:**
```typescript
// ✅ CORRECT: Memoize expensive calculations
const calculateTheory = useCallback((): TheoryResult => {
  // Expensive calculation
}, [rootNote, theoryType, selectedVariety]);

const currentTheory = useMemo(
  () => calculateTheory(),
  [calculateTheory]
);
```

**SVG Optimization:**
```typescript
// ✅ CORRECT: Use viewBox for responsive SVG
<svg viewBox="0 0 800 300" className="w-full h-auto">
  {/* content */}
</svg>

// ✅ CORRECT: Memoize static SVG elements
const FretMarkers = React.memo(() => (
  <g className="fret-markers">
    {/* Fret position dots */}
  </g>
));
```

### Error Handling

```typescript
// ✅ CORRECT: Graceful AI failure handling
try {
  const progression = await suggestProgression(mood, key);
  setProgression(progression);
} catch (error) {
  console.error('Failed to generate progression:', error);
  setError('Unable to generate progression. Please try again.');
  // Optionally: Fall back to template-based generation
}
```

### Accessibility

```typescript
// ✅ CORRECT: Proper ARIA labels and keyboard support
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label={`Select ${note} ${chordType} chord`}
  className="focus:outline-none focus:ring-2 focus:ring-indigo-500"
>
  {chordName}
</button>

// ✅ CORRECT: Screen reader descriptions for visualizations
<svg aria-label={`Guitar fretboard showing ${chordName} voicing`} role="img">
  {/* fretboard content */}
</svg>
```

---

## Common Development Tasks

### Task 1: Adding a New Scale

```typescript
// 1. Add to SCALES in constants.tsx
export const SCALES = {
  // ... existing scales
  'Hungarian Minor': [0, 2, 3, 6, 7, 8, 11], // W-H-A2-H-H-A2-H
};

// 2. Verify interval pattern
// H = half step (1 semitone)
// W = whole step (2 semitones)  
// A2 = augmented 2nd (3 semitones)

// 3. Test with multiple roots
const test = calculateScale('C', 'Hungarian Minor');
// Expected: ['C', 'D', 'Eb', 'Gb', 'G', 'Ab', 'B']
```

### Task 2: Creating a Custom Hook

```typescript
// hooks/useTheoryCalculation.ts
import { useMemo } from 'react';
import { NoteName, TheoryType, TheoryResult } from './types';
import { SCALES, CHORDS, NOTES } from './constants';

export function useTheoryCalculation(
  root: NoteName,
  type: TheoryType,
  variety: string
): TheoryResult {
  return useMemo(() => {
    const rootIndex = NOTES.indexOf(root);
    const semitones = type === TheoryType.SCALE 
      ? SCALES[variety] 
      : CHORDS[variety];
    
    const notes = semitones.map(s => NOTES[(rootIndex + s) % 12]);
    const intervals = semitones.map(s => INTERVAL_MAP[s]);
    
    return {
      notes,
      intervals,
      name: `${root} ${variety}`
    };
  }, [root, type, variety]);
}
```

### Task 3: Adding Animation to Component

```typescript
// Install: npm install framer-motion

import { motion, AnimatePresence } from 'framer-motion';

// Animate note changes
<AnimatePresence mode="wait">
  <motion.div
    key={currentChord.name}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <ChordDisplay chord={currentChord} />
  </motion.div>
</AnimatePresence>
```

### Task 4: Integrating Tone.js for Audio

```typescript
// Install: npm install tone

import * as Tone from 'tone';

function TheoryLab() {
  const playScale = async () => {
    await Tone.start();
    const synth = new Tone.Synth().toDestination();
    
    currentTheory.notes.forEach((note, i) => {
      const time = Tone.now() + i * 0.5;
      synth.triggerAttackRelease(`${note}4`, '8n', time);
    });
  };

  return (
    <button onClick={playScale}>
      Play Scale
    </button>
  );
}
```

### Task 5: Writing Tests

```typescript
// Install: npm install -D vitest @testing-library/react @testing-library/jest-dom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TheoryLab } from './TheoryLab';

describe('TheoryLab', () => {
  it('calculates C major scale correctly', () => {
    const result = calculateScale('C', 'Major');
    expect(result.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  it('renders chord name', () => {
    render(<TheoryLab />);
    expect(screen.getByText(/Major/i)).toBeInTheDocument();
  });
});
```

---

## Integration Roadmap

When Copilot suggests new libraries, follow this order:

### Phase 1: Core Improvements
1. **ESLint + Prettier** - Code quality
2. **Vitest** - Testing infrastructure  
3. **Tonal.js** - Enhanced music theory

### Phase 2: Feature Enhancements
4. **Tone.js** - Audio playback
5. **Framer Motion** - Smooth animations
6. **VexFlow** - Staff notation

---

## Security Considerations

**API Key Management:**
```typescript
// ❌ CURRENT (INSECURE): Client-side API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ✅ SECURE: Proxy through backend
const response = await fetch('/api/gemini/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, config })
});
```

**Environment Variables:**
```bash
# .env (DO NOT COMMIT)
VITE_GEMINI_API_KEY=your_key_here

# .env.example (COMMIT THIS)
VITE_GEMINI_API_KEY=your_api_key_here_get_from_google_ai_studio
```

---

## Debugging Tips

### Common Issues

**Issue: Chord voicing not displaying**
```typescript
// Check: Voicing array length
console.assert(voicing.length === 6, 'Voicing must have 6 elements');

// Check: Valid fret numbers
console.assert(
  voicing.every(f => f === null || (f >= 0 && f <= 24)),
  'Fret numbers must be 0-24 or null'
);
```

**Issue: Scale calculation off by one semitone**
```typescript
// Check: Root index calculation
const rootIndex = NOTES.indexOf(rootNote);
console.log('Root:', rootNote, 'Index:', rootIndex);

// Check: Modulo wrapping
const noteIndex = (rootIndex + semitone) % 12;
console.log('Semitone:', semitone, 'Result index:', noteIndex);
```

**Issue: Fretboard rendering incorrectly**
```typescript
// Check: SVG viewBox is set
<svg viewBox="0 0 800 300"> {/* Required for scaling */}

// Check: Coordinates are relative to viewBox
const fretX = (fretNumber / totalFrets) * viewBoxWidth;
```

---

## Quality Checklist

Before committing code, verify:

- [ ] TypeScript compiles without errors
- [ ] No ESLint warnings (once configured)
- [ ] Music theory is accurate (validate with references)
- [ ] Component is under 200 lines (refactor if needed)
- [ ] Keyboard accessible (Tab navigation works)
- [ ] Mobile responsive (test at 375px width)
- [ ] No console errors in browser
- [ ] Follows existing code style
- [ ] Comments explain complex music theory logic
- [ ] Git commit message is descriptive

---

## Prompt Usage Examples

### Example 1: Add New Feature
```
Using the HarmoniQ context, add a "Play Chord" button to TheoryLab.tsx that plays the current chord using Tone.js. Make sure to:
- Install Tone.js
- Create an audio service wrapper
- Add button with proper ARIA label
- Handle Tone.start() on first user interaction
```

### Example 2: Refactor Component
```
Refactor FretboardView.tsx following HarmoniQ patterns. The component is 332 lines. Split it into:
- Fretboard.tsx (main container)
- FretMarkers.tsx (position dots)
- StringRenderer.tsx (string lines)
- NoteIndicators.tsx (highlighted notes)
Use the existing SVG structure and maintain all functionality.
```

### Example 3: Fix Bug
```
In the HarmoniQ progression builder, the Roman numerals don't update when changing keys. Debug the issue in ProgressionLab.tsx following music theory rules:
- Check degree-to-root calculation
- Verify numeral matches chord quality
- Ensure state updates propagate correctly
```

### Example 4: Add Tests
```
Write Vitest tests for the scale calculation function in HarmoniQ. Test:
- All 12 root notes with Major scale
- Edge cases (enharmonic equivalents)
- Invalid inputs
Follow the existing TheoryResult interface.
```

---

## Final Notes

**Project Goals:**
- Educational tool for music theory students
- Professional-quality visualizations
- AI-powered learning assistance
- Accessible to all learners

**Design Principles:**
- Clarity over complexity
- Accuracy over speed
- Accessibility is non-negotiable
- Performance matters

**When in doubt:**
- Check music theory references (Wikipedia, teoria.com)
- Test with real musicians
- Prioritize user experience
- Maintain type safety

---

**This prompt gives GitHub Copilot deep context about HarmoniQ. Save this file as `COPILOT_PROMPT.md` in your repository and reference it in Copilot Chat with:**

```
@workspace /explain using COPILOT_PROMPT.md

Use the context in COPILOT_PROMPT.md to help me [your task]
```

Happy coding! 🎵
