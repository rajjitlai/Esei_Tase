# Esei Tase v2 - OTA Update & Development Guide

This guide explains how to manage updates and the new native dependencies introduced in v2.

## 1. Important: Rebuilding the App
Because v2 migrates from `expo-audio` to `react-native-track-player`, you **MUST** rebuild your development client. The current run will likely fail until you do this.

**Command:**
```bash
npx expo run:android
```

## 2. OTA Updates (Over-the-Air)
We have implemented a dual-layer update strategy:

### A. Manual Check (GitHub API)
Users can now "Check for Updates" in the Settings tab. This hooks into the **GitHub Releases API**.
- To push an update: Create a new **Release** on your GitHub repository with a **Tag** (e.g., `v1.1.0`).
- The app compares its `package.json` version with the latest GitHub tag.
- If a new version is found, it prompts the user to visit the download page.

### B. Expo EAS Update (Optional)
If you want to push JavaScript-only fixes instantly without a new APK:
1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Configure project: `eas update:configure`
4. Publish an update:
```bash
eas update --branch production --message "Fixing search bug"
```

## 3. Background Playback Service
The background playback is handled by `src/service.ts`. 
- Ensure this file is registered in `app/_layout.tsx` via `TrackPlayer.registerPlaybackService`.
- If you add new remote controls (like "Jump Forward"), remember to add the event listener in `service.ts` AND the capability in `usePlayer.ts`.

## 4. Equalizer & Sound Tuning
- **Playback Speed**: Managed via `TrackPlayer.setRate()`.
- **Pitch**: In v4, pitch correction is automatic.
- **Bass Boost**: Currently a high-end UI simulation. To implement a real 10-band EQ, a dedicated native module like `react-native-audio-api` (Software Mansion) is recommended for a future v3 update.
