# Esei Tase v1.0.0

A fully offline local music player for Android, built with Expo and React Native. No streaming, no accounts, no internet required — just your device's audio library.

## Features

- Reads all audio files directly from device storage
- Extracts album art and metadata from ID3 tags
- Dynamic UI theming derived from the dominant color of the current track's album art, with smooth animated transitions
- Three-tab navigation: player, queue, and settings
- Persistent mini-player visible across queue and settings tabs
- Playback controls: play/pause, previous, next, seek, and volume
- Previous track restarts if more than 3 seconds have elapsed; otherwise goes to the prior track
- Auto-advances to the next track on completion

## Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 (managed workflow) |
| Language | TypeScript |
| Styling | NativeWind v4 (Tailwind for React Native) |
| Navigation | expo-router (file-based, tab layout) |
| Audio | expo-av |
| Media access | expo-media-library |
| Metadata / art | @missingcore/react-native-metadata-retriever |
| Color extraction | react-native-image-colors |
| Background glow | expo-linear-gradient |
| Seek / volume | @react-native-community/slider |
| Animations | react-native-reanimated |

## Project Structure

```
app/                        expo-router entry point
  _layout.tsx               root Stack layout
  (tabs)/
    _layout.tsx             tab bar with dynamic theming
    index.tsx               Home tab (player)
    queue.tsx               Queue tab (track list)
    settings.tsx            Settings tab

src/
  types/Track.ts            Track and ThemeColors interfaces
  constants/theme.ts        Default theme values
  context/PlayerContext.tsx shared playback state across all tabs
  hooks/
    useMediaLibrary.ts      permission + audio asset enumeration
    usePlayer.ts            expo-av playback engine
    useAlbumColor.ts        dominant color to HSL theme derivation
  components/
    AlbumArt.tsx            album art with glow effect and placeholder
    Controls.tsx            prev / play-pause / next
    SeekBar.tsx             draggable seek bar with timestamps
    VolumeSlider.tsx        volume control
    TrackInfo.tsx           track name and metadata label
    QueueList.tsx           scrollable flat list of tracks
    MiniPlayer.tsx          compact playback bar shown on queue/settings
  app/(tabs)/
    index.tsx               HomeScreen implementation
    queue.tsx               QueueScreen implementation
    settings.tsx            SettingsScreen (About, Developer, Preferences)
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- Expo CLI
- Android device or emulator

### Install

```bash
npm install
```

### Run

```bash
npx expo start --android
```

On first launch, the app will request media library access. Once granted, all audio files on the device are loaded into the queue automatically.

## Settings

| Section | Content |
|---|---|
| About | App name, version, and description |
| Developer | Author info and GitHub link |
| Preferences | Shuffle, repeat, and theme override (coming soon) |

## License

MIT