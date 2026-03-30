# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Esei Tase** is a premium offline music player for Android built with Expo and React Native. The name means "Song Collection" in Meiteilon. It features a dynamic "Liquid" UI that adapts to album art colors, background audio with system integration, and Android home screen widgets.

- **Tech Stack**: Expo SDK 54, React Native 0.81, TypeScript, react-native-track-player, react-native-reanimated, expo-router
- **Current Version**: 2.0.0 (Liquid Power)
- **Branch**: `feature/v2.0.0-liquid-power`

## Repository Structure

```
app/                    # Expo Router file-based routing
├── (tabs)/            # Tab navigation screens
│   ├── index.tsx      # Home screen (main player)
│   ├── queue.tsx      # Queue management
│   ├── settings.tsx   # App settings
│   └── _layout.tsx    # Tabs layout with custom tab bar
├── _layout.tsx        # Root layout (stack navigator + widget registration)
└── ...
src/
├── components/        # Reusable UI components
│   ├── AlbumArt.tsx
│   ├── Controls.tsx
│   ├── MiniPlayer.tsx
│   ├── PageLayout.tsx
│   ├── QueueList.tsx
│   ├── SeekBar.tsx
│   ├── TrackInfo.tsx
│   └── VolumeSlider.tsx
├── context/           # React Context
│   └── PlayerContext.tsx  # Main player state provider
├── hooks/             # Custom hooks
│   ├── useAlbumColor.ts   # Dynamic theming from album art
│   ├── useAudio.ts        # Expo Audio API implementation
│   ├── useFavorites.ts    # Favorites management
│   ├── useMediaLibrary.ts # Media scanning & metadata
│   ├── useOTA.ts         # Over-the-air update checks
│   └── usePlayer.ts      # react-native-track-player implementation
├── types/             # TypeScript interfaces
│   └── Track.ts
├── constants/         # App constants
│   └── theme.ts
└── widgets/           # Android home screen widgets
    ├── MusicWidget.tsx
    └── widget-task.tsx
```

## Common Development Commands

```bash
# Development
npm start              # Start Expo dev server
npm run web            # Start web version
npm run android        # Build and run on Android (requires dev build)
npm run ios            # Build and run on iOS
npm run prebuild       # Generate native code (android/ios folders)

# Code Quality
npm run lint           # Run ESLint + Prettier check
npm run format         # Auto-fix ESLint + Prettier issues

# Post-install
npm install            # Installs dependencies and runs patch-package
```

### Running on Device/Emulator

This is a **development build** app (not Expo Go). Use:
```bash
npx expo run:android   # Builds APK and installs on connected device/emulator
```

## Architecture Highlights

### State Management
- **PlayerContext** (`src/context/PlayerContext.tsx`) is the single source of truth for player state.
- Composes multiple hooks: `useMediaLibrary` (tracks), `usePlayer` (audio engine), `useAlbumColor` (theming), `useFavorites`.
- Provides: tracks, playback state (position, duration, isPlaying), theme, settings (bgMode, minDuration, sleep timer, favorites).

### Audio Engine
The app uses **react-native-track-player** via `usePlayer.ts` (v4+).

**Note**: An older `useAudio.ts` (expo-audio) exists but is now deprecated—do NOT use it. It lacked proper background playback, notification controls, and widget integration which are now fully working with TrackPlayer.

### Dynamic Theming
- `useAlbumColor` extracts dominant colors from album artwork using `react-native-image-colors`.
- Derives theme (accent, bg, surface, muted, glow) via HSL manipulation in `src/hooks/useAlbumColor.ts`.
- Theme is applied globally through PlayerContext and used by all screens/components.

### Routing & Navigation
- **Expo Router** (v6) with file-based routing.
- Tabs: Home (index), Queue, Settings.
- Custom tab bar with blur effect and dynamic accent color.
- Stack wrapper at root for future screen expansions.

### Android Widget
- Uses `react-native-android-widget` for home screen widget.
- Widget communicates via `expo-secure-store` (polling pattern):
  - Player syncs state → SecureStore keys (WIDGET_KEYS) → triggers `triggerWidgetUpdate()`.
  - Widget commands (PLAY/PAUSE/NEXT/PREV) → SecureStore command → Player polls and executes.
- Widget definition: `src/widgets/MusicWidget.tsx`
- Task handler: `src/widgets/widget-task.tsx` (registered in `app/_layout.tsx`)

### Media Library Scanning
- `useMediaLibrary` requests permissions, fetches all audio assets via `expo-media-library`.
- Extracts metadata and artwork using `@missingcore/react-native-metadata-retriever`.
- Supports minimum duration filter (hide short clips/voice notes).
- Progressive loading: renders tracks as metadata arrives (chunks of 20).

### Settings Persistence
- `expo-secure-store` used for all persistent user settings:
  - Shuffle, repeat, minDuration, favorites, background mode, custom bg URI, bg opacity, sleep timer.
- Loaded on mount, saved immediately on change.

## Code Style & Configuration

- **TypeScript**: Strict mode enabled (`tsconfig.json`).
- **Path Aliases**: `@/*` → `src/*` (enabled via `experiments.tsconfigPaths` in app.json).
- **ESLint**: `eslint-config-expo` with react-native rules; `react/display-name` disabled.
- **Prettier**: 100 char width, single quotes, trailing commas, tailwindcss plugin.
- **Import Style**: Prefer relative paths (`../../src/...`) over `@/` if within same level; `@/` acceptable for deep imports.

## Important Patterns

### Player Access
Always use the context hook:
```tsx
import { usePlayerContext } from '@/context/PlayerContext';
const { tracks, isPlaying, togglePlay, ... } = usePlayerContext();
```

### Theme Usage
Theme comes from context (dynamic per track):
```tsx
const { theme } = usePlayerContext();
// theme: { accent, bg, surface, muted, glow }
```

### Widget Updates
To update widget after state change:
```ts
import { triggerWidgetUpdate } from '@/widgets/widget-logic';
// After syncing state to SecureStore keys:
await triggerWidgetUpdate();
```

### Track Metadata
Track interface (`src/types/Track.ts`):
```ts
interface Track {
  id: string;
  title: string;
  artist: string;
  filename: string;
  uri: string;
  duration: number; // seconds
  artUri: string | null;
}
```

## Building for Production

```bash
# Generate native projects (if not already)
npm run prebuild

# Build APK/AAB (using EAS)
npx eas build --platform android

# iOS build (requires Apple developer account)
npx eas build --platform ios
```

See `app.json` for configuration (version, bundle ID, permissions, plugins).

## Notable Decisions & Evolution

1. **Audio engine divergence**: `usePlayer` (track-player) and `useAudio` (expo-audio) represent two different approaches. The current implementation uses expo-audio for potentially simpler Expo compatibility, but track-player offers more mature background/lock-screen integration. Migrating back would involve updating `PlayerProvider`.

2. **SecureStore for IPC**: Widget <-> app communication uses SecureStore polling (500ms interval). This is a pragmatic native bridge pattern for RN Android widgets without sophisticated event mechanisms.

3. **Color theming strategy**: Album art → dominant color → HSL adjustments → full palette. Creates cohesive, track-specific UI without overwhelming users.

4. **Permissions**: Android permissions declared in `app.json`; runtime requested via `expo-media-library`. READ_EXTERNAL_STORAGE and READ_MEDIA_AUDIO are critical for library scanning.

## Testing Notes

- Background audio behavior: Test on physical Android device; emulators may not handle lock-screen controls correctly.
- Widget: Requires production build (`npx expo run:android`); does not work in Expo Go.
- Theme changes: Verify color extraction works with various album art (primary/secondary colors).

## External Resources

- GitHub: https://github.com/rajjitlai/Esei_Tase
- Issue tracking: GitHub Issues
- License: MIT (see LICENSE file)

## For Future Developers

- If adding new screens, follow Expo Router conventions: create file in `app/` and export default component.
- If modifying playback logic, be aware both `useAudio` and `usePlayer` exist. Decide which to use and keep consistent.
- The "Liquid Bass Booster" toggle in Settings is currently UI-only; backend audio processing not implemented.
- Android widget icons use emoji (⏮, ▶, ⏸, ⏭) for simplicity. Replace with vector assets for production polish.
