# Esei Tase 🎵
**The Premium Offline Music Experience for Android**

Esei Tase (Meiteilon for *"Song Collection"*) is a high-fidelity, fully offline music player built with Expo and React Native. It is designed for audiophiles who prefer local storage over streaming, offering a "Pure Liquid" interface that adapts to your music.

---

## ✨ Key Features

### 🌈 Adaptive Liquid UI
- **Dynamic Theming**: The entire app's color palette (HSL) shifts in real-time based on the dominant colors of the current track's album art.
- **Glassmorphic Design**: A modern, translucent interface with depth and premium blur effects.
- **"Spin & Pulse" Transitions**: Energetic animations that bring your music to life using `react-native-reanimated`.

### 🎧 Pro Playback Engine
- **Background Support**: Powered by `react-native-track-player` for rock-solid background audio.
- **System Integration**: Full support for system media notifications and lock screen controls, including a native seek slider and Next/Previous buttons.
- **Sound Tuning**: Real-time Playback Speed control (0.5x - 2.0x) and a premium "Liquid Bass Express" simulator.
- **Sleep Timer**: Customizable countdown presets (15, 30, 60m) to automatically pause playback.

### 📂 Library Management
- **Smart Scanning**: Efficiently scans device storage for audio files with automatic ID3 metadata and high-res artwork extraction.
- **Advanced Filtering**: Hide short audio clips or voice notes using the customizable "Minimum Track Length" filter.
- **Instant Search**: High-performance debounced search to find any track in your library instantly.
- **Favorites**: Build your personal collection with persistent heart toggles across the player and mini-player.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Expo SDK 54 (Managed Workflow) |
| **Language** | TypeScript |
| **Audio Engine** | react-native-track-player (v4+) |
| **Animation** | react-native-reanimated |
| **Vector Graphics** | react-native-svg |
| **State** | React Context API |
| **Storage** | expo-secure-store |
| **Theming** | react-native-image-colors |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Device (Recommended for background audio testing)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the development build:
   ```bash
   npx expo run:android
   ```

---

## 📅 Development & Updates
Esei Tase features a built-in **OTA Update Checker**. It automatically queries the GitHub Releases API to notify you whenever a new version of the app is available for download.

---

## 📜 License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 **Rajjit Laishram**