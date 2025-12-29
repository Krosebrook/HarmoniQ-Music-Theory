# HarmoniQ: Pro Music Theory Lab

HarmoniQ is an advanced music theory visualization platform built with React and powered by the Google Gemini 3 API. It provides musicians with high-fidelity tools for scale analysis, chord voicing generation, and harmonic exploration.

## Core Features

- **Theory Lab**: Dynamic visualization of scales and chords on a 2-octave piano and a 15-fret interactive fretboard.
- **AI Voicing Engine**: Leverages Gemini 3 Flash to suggest playable guitar chord voicings based on complexity and finger-span constraints.
- **Progression Builder**: Generates mood-based harmonic sequences with Roman numeral analysis.
- **Visual Theory Lab**: Uses Gemini 3 Pro Vision to generate conceptual art representing musical structures.

## Technical Architecture

- **Frontend**: React (ESM), Tailwind CSS, Lucide-style SVG graphics.
- **Intelligence**: Google Gemini API (`@google/genai`).
- **Data Models**: Standardized note and interval mappings following common music theory conventions.

## Development

The project uses a standard ESM structure. `types.ts` acts as the source of truth for all theoretical data structures. `FretboardView.tsx` handles complex SVG geometry for legato techniques.
