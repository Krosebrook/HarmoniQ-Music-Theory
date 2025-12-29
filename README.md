# HarmoniQ: Pro Music Theory Lab

HarmoniQ is an advanced music theory visualization platform built with React and powered by the Google Gemini 3 API. It provides musicians with high-fidelity tools for scale analysis, chord voicing generation, and harmonic exploration.

## Core Features

- **Theory Lab**: Dynamic visualization of scales and chords on a 2-octave piano and a 15-fret interactive fretboard.
- **Fretboard Engine**: High-fidelity guitar visualization with zoom, hover highlighting, and automated legato (H/P) detection.
- **AI Voicing Engine**: Leverages Gemini 3 Flash to suggest playable guitar chord voicings based on complexity and finger-span constraints.
- **Progression Builder**: Generates mood-based harmonic sequences with Roman numeral analysis.
- **Visual Theory Lab**: Uses Gemini 3 Pro Vision to generate conceptual art representing musical structures.

## Technical Architecture

- **Frontend**: React 19 (ESM), Tailwind CSS, Lucide-style SVG graphics.
- **Intelligence**: Google Gemini API (`@google/genai`).
- **Data Models**: Standardized note and interval mappings following common music theory conventions.
- **Graphics**: Hardware-accelerated SVG paths for real-time theory visualization.

## Development

The project uses a standard ESM structure. `types.ts` acts as the source of truth for all theoretical data structures. `FretboardView.tsx` handles complex SVG geometry for legato techniques.

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📚 Documentation

Comprehensive documentation has been created to guide HarmoniQ development:

### [AUDIT.md](./AUDIT.md) - Codebase Audit Report
Complete analysis of the current codebase including:
- Repository structure assessment
- Code quality analysis
- Music theory implementation review
- Security and performance considerations
- Comparison to 2024 best practices
- Priority recommendations for improvement

**Key Findings:**
- Overall Grade: B- (Good foundation, needs production hardening)
- Strong fundamentals with modern React architecture
- Critical gaps: Testing infrastructure, API key security, accessibility

### [RECOMMENDATIONS.md](./RECOMMENDATIONS.md) - Integration Recommendations
Six essential repositories to integrate for production-readiness:

1. **🎵 Tonal.js** - Industry-standard music theory library
2. **🎹 Tone.js** - Web Audio framework for interactive playback
3. **🎼 VexFlow** - Professional music notation rendering
4. **🧪 Vitest + Testing Library** - Modern testing infrastructure
5. **🎨 Framer Motion** - Advanced animations for smooth UX
6. **🔍 ESLint + Prettier** - Code quality and formatting

Each recommendation includes:
- Integration rationale
- Code examples
- Implementation priority
- Expected benefits

### [GITHUB_AGENTS.md](./GITHUB_AGENTS.md) - AI Agent Prompts
Five specialized GitHub Copilot Workspace agents for accelerated development:

1. **🎵 Music Theory Validator** - Validates music theory accuracy
2. **🎸 Fretboard & Visualization Specialist** - SVG graphics and guitar theory
3. **🧪 Test Engineer** - Quality assurance and testing
4. **🎨 UI/UX Enhancement Specialist** - Interface design and accessibility
5. **🚀 Integration & DevOps Engineer** - CI/CD and library integration

Each agent includes:
- Detailed system prompts
- Boundaries and responsibilities
- Output formats and examples
- Use cases and deployment guide

### [COPILOT_PROMPT.md](./COPILOT_PROMPT.md) - GitHub Copilot Context
Master context prompt for in-editor GitHub Copilot assistance covering:
- Complete architecture understanding
- Development guidelines and best practices
- Music theory implementation patterns
- Common development tasks with examples
- Quality checklist and debugging tips

**Usage:** Reference this in Copilot Chat:
```
@workspace /explain using COPILOT_PROMPT.md
```

## 🎯 Recommended Next Steps

Based on the comprehensive audit, prioritize these actions:

### Phase 1: Foundation (Week 1)
1. Secure API key management (move to backend)
2. Set up ESLint + Prettier
3. Implement Vitest testing infrastructure
4. Integrate Tonal.js for robust theory calculations

### Phase 2: Core Features (Week 2-3)
5. Add Tone.js for audio playback
6. Implement accessibility (ARIA labels, keyboard navigation)
7. Add error boundaries and error handling
8. Create environment configuration documentation

### Phase 3: Enhancement (Week 4)
9. Integrate Framer Motion for polished animations
10. Add VexFlow for traditional notation
11. Set up CI/CD pipeline with GitHub Actions
12. Implement code splitting and performance optimization

## 🤝 Contributing

When contributing to HarmoniQ, please:
1. Review the [AUDIT.md](./AUDIT.md) to understand the current state
2. Check [RECOMMENDATIONS.md](./RECOMMENDATIONS.md) for approved libraries
3. Use [GITHUB_AGENTS.md](./GITHUB_AGENTS.md) specialized agents when available
4. Reference [COPILOT_PROMPT.md](./COPILOT_PROMPT.md) for coding standards
5. Ensure all music theory is validated for accuracy
6. Write tests for new features
7. Maintain accessibility standards

## 📖 Additional Resources

- [CHANGELOG.md](./CHANGELOG.md) - Version history and feature releases
- Google Gemini API Documentation
- React 19 Documentation
- TypeScript 5.8 Handbook
- Tailwind CSS Documentation
