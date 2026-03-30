# Changelog

All notable changes to **Esei Tase** will be documented in this file.

## [1.0.0] - 2026-03-30
### Added
- **Core Playback Engine**: Complete migration to `expo-audio` (SDK 54) for high-fidelity audio playback.
- **Adaptive UI**: Real-time theme generation based on album art dominant colors using `react-native-image-colors`.
- **Liquid Visualizer**: SVG-based dynamic wave visualizer on the main player screen.
- **Library Scan**: Efficient device storage scanning using `expo-media-library` with metadata extraction.
- **Navigation**: Tab-based navigation (Player, Queue, Settings) with a persistent glassmorphic mini-player.
- **Controls**: Full set of playback controls including shuffle, repeat, seek, and volume.
- **Animations**: Fluid track transitions ("Spin & Pulse") and ambient background particle system using `react-native-reanimated`.
- **Metadata Support**: ID3 tag extraction for titles, artists, and artwork via `@missingcore/react-native-metadata-retriever`.

### Fixed
- Fixed track skipping logic (restart vs. previous track).
- Resolved race conditions in media loading and state sync.
- Optimized performance for large music libraries (>1000 tracks).

### Security
- Secure storage for user preferences and theme settings via `expo-secure-store`.
