# Change Log

## [1.5.0] - Guitar Voicing Refactor (Latest)
- **Feature**: Added a "Guitar Shapes" gallery in the Theory Lab for quick selection of standard CAGED shapes (E-Shape, A-Shape, etc.).
- **UX**: Improved the "Ask AI" voicing placement and feedback, integrating it into the guitar shape workflow.
- **Visual**: Added transition animations to the chord voicing section and refined button styles for better clarity between active and inactive shapes.
- **Bugfix**: Ensured state resets correctly when switching between Scale and Chord modes to prevent stale fretboard overlays.

## [1.4.0] - Template Library
- **Feature**: Added a "Template Library" to the Progression Lab.
- **Content**: 10 diverse harmonic templates including "The Pop Loop", "Classic ii-V-I", "Andalusian Cadence", and "Smooth Neo-Soul".
- **Refactor**: Key-agnostic degree mapping allows any template to be applied to all 12 root keys.
- **UX**: New Template Gallery UI for quick selection and preview.

## [1.3.0] - Refactor & Polish
- **Refactor**: Decomposed `FretboardView` into manageable sub-components.
- **Refactor**: Standardized SVG coordinate system with a defined `viewBox`.
- **Debug**: Fixed SVG marker clipping and arc height calculation.
- **Polish**: Enhanced the "Muted String" indicator and state synchronization.

## [1.2.0] - Refactor & Debug
- **Refactor**: Cleaned up `FretboardView` SVG coordinate system.
- **Feature**: Added "Hammer-on" and "Pull-off" directional animations.
- **Feature**: Interactive fret highlighting on hover.
- **Feature**: Zoom functionality.
- **Bugfix**: String indexing mismatch for AI-generated voicings.

## [1.1.0] - AI Voicings Update
- **Feature**: Integrated `suggestChordVoicing` service using Gemini.
- **Feature**: Added "Ask AI" button.
- **Visual**: Added interval-based label mode.

## [1.0.0] - Initial Release
- **Core**: Scale and Chord calculation logic.
- **Visual**: Piano and Circle of Fifths components.
- **AI**: Basic chat and progression generation.
