# Changelog

All notable changes to **Esei Tase** will be documented in this file.

## [2.0.0] - 2026-03-30
### Added
- **Core Engine Upgrade**: Complete migration to `react-native-track-player` for superior background stability and full system media controls.
- **Full Notification Support**: Native seek slider and Next/Previous buttons enabled in system notifications and lock screens.
- **Library Filtering**: New "Minimum Track Length" filter in Settings to hide voice notes or short clips.
- **Favorites System**: Heart/unheart tracks with persistent storage and quick-access heart icons in the player and mini-player.
- **Search with Debounce**: High-performance debounced search filtering for the music queue.
- **Sleep Timer**: Customizable countdown timer (15/30/60m presets) with automatic fading and playback pause.
- **Sound Tuning**: Real-time playback speed control (0.5x - 2.0x) and Pitch-perfect Liquid Bass simulation.
- **OTA Updates**: Integrated GitHub Releases API check to notify users of new versions directly in the app.

### Fixed
- Fixed notification controls not responding in certain Android background states.
- Optimized search performance for large libraries using debounced state updates.
- Improved memory management for high-resolution album art caching.

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
