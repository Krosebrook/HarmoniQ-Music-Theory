# HarmoniQ: Pro Music Theory Lab

HarmoniQ is an advanced music theory visualization platform built with React and powered by the Google Gemini 3 API. It provides musicians with high-fidelity tools for scale analysis, chord voicing generation, and harmonic exploration.

## Core Features

- **Theory Lab**: Dynamic visualization of scales and chords on a 2-octave piano and a 15-fret interactive fretboard.
- **Diatonic Harmony Map**: NEW! Visualizes every chord naturally occurring in a selected scale, allowing for instant harmonic analysis.
- **Fretboard Engine**: High-fidelity guitar visualization with zoom, hover highlighting, and automated legato (H/P) detection.
- **AI Voicing Engine**: Leverages Gemini 3 Flash to suggest playable guitar chord voicings based on complexity and finger-span constraints.
- **Progression Studio**: 
  - **Generator**: Generate mood-based harmonic sequences with Roman numeral analysis.
  - **AI Spice**: NEW! Re-harmonize basic progressions into sophisticated sequences with extensions and substitutions.
  - **Sequencer**: Built-in MIDI-accurate playback for jamming and practice.
  - **Export**: DAW-ready MIDI export for professional workflows.
- **Ear Training Lab**: Interactive quizzes for intervals and chords with streak tracking.
- **Visual Theory Lab**: Uses Gemini 3 Pro Vision to generate conceptual art representing musical structures.

## Technical Architecture

- **Frontend**: React 19 (ESM), Tailwind CSS, Framer-motion-style SVG graphics.
- **Intelligence**: Google Gemini API (`@google/genai`).
- **Data Models**: Standardized note and interval mappings following common music theory conventions.
- **Graphics**: Hardware-accelerated SVG paths for real-time theory visualization.

## Roadmap

### Recently Completed
- [x] Diatonic Harmony Visualization
- [x] AI-Powered Re-harmonization ("Spice Up" feature)
- [x] Centralized Interval Mapping system

### Up Next
- [ ] **Reverse Scale Lookup**: Click notes on the piano/fretboard and have AI identify the most likely scales.
- [ ] **Advanced Rhythms**: Add rhythmic "Grooves" to the Progression Studio playback (Jazz Swing, Pop Pulse, Rock Drive).

## Development

The project uses a standard ESM structure. `types.ts` acts as the source of truth for all theoretical data structures. `FretboardView.tsx` handles complex SVG geometry for legato techniques.
