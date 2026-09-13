# Ascension · Version 2

An architectural puzzle by **Joe Nasr**. Turn bridges, ride lifts and discover camera-aligned routes through 26 spaces. This is a separate release-candidate branch for review before merging.

## Play

Use Node.js 22.12 or newer:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. No API keys, accounts or external runtime assets are needed. Production hosting serves the contents of `dist/` after `npm run build`.

- Click a surface to walk; click its ivory crank to operate it remotely.
- The labelled surface selector, **Walk here**, and **Operate handle** offer equivalent controls.
- Arrow keys select surfaces, Enter walks, E operates, Z undoes, H gives a hint.
- Settings offers reduced motion, three graphics tiers, mechanical tones and optional music.
- Chapters unlock as you complete spaces. Completion and best move counts persist on this device. Refreshing an unfinished level restarts that level.
- The final three spaces use four authored camera frames. A perspective route is valid only when the nominated platforms project to the same position at the right height. Use the labelled selector when silhouettes overlap.

## What changed

- Repaired missing application entry, pinned dependencies with a lockfile, restored the actual original MP3 and included it in production output.
- Removed browser Gemini credentials, the remote Tailwind runtime, external fonts and the remote environment map. Reflections are original authored text.
- Isolated deterministic gameplay rules from rendering. Added undo, staged solver-backed hints, restart, completion saving, chapters and ending.
- Separated overlapping legacy lift landings; tested all discrete traversable-solid configurations.
- Added finite eased movement, walking legs, synchronized lift riders, counterweights, retracting bridge turns, rounded architecture and camera fitting.
- Added three actual projected-alignment puzzles, giving 26 levels in four chapters.
- Added HTML action alternatives, modal focus containment, reduced motion and responsive layout.
- Lazy-loaded the 3D scene; idle rendering is on demand.

## Verify

```sh
npm run check
npx playwright install chromium
npm run test:browser
```

The unit suite validates all level solutions, legal transitions, perspective gates, snapshot immutability and discrete solid overlaps. Browser tests exercise the complete 26-level journey on desktop and mobile, normal-motion input locking, undo, persistence and screenshots. GitHub Actions uploads the browser report and production build.

See [v2 review](docs/V2_REVIEW.md), [asset credits](docs/CREDITS.md) and [privacy](docs/PRIVACY.md). Do not represent an unrun verification gate as passed.

## Structure

- `game/engine.ts`: pure state transitions, connectivity, projection and solver.
- `game/levels.ts`: reviewed legacy layout migration and perspective chapter.
- `App.tsx`: interaction lifecycle, UI, progression and animation completion.
- `components/`: procedural architecture, character and camera rendering.
- `services/audioService.ts`: local sound synthesis and optional bundled music.

## Authorship and rights

Created by Joe Nasr · [Portfolio](https://linktr.ee/joenasr) · [Repository](https://github.com/Joenasriani/the-ascension-game)

This update does not grant a new license to the original project or its music. Rights to distribute the music commercially must be confirmed by the owner before commercial publication. Package dependencies retain their respective licenses.
