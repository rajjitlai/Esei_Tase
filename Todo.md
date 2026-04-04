# v4 Roadmap

This document outlines planned improvements for version 4.0 of Esei Tase.

## High Priority

### 1. Memoize PlayerContext Value
- Wrap the entire `value` object in `useMemo` to prevent unnecessary re-renders.
- Impact: All screens consume PlayerContext; this will reduce render churn significantly.

### 2. Debounce Widget Sync
- Ensure widget state updates are debounced (300–500ms) to avoid excessive SecureStore writes.
- Consider centralizing all widget sync in PlayerProvider with a single `useEffect` and `useDebounce` hook.

### 3. Swipe-to-Delete in Queue
- Integrate `react-native-gesture-handler`’s `Swipeable` component.
- Swipe left/right reveals delete (and possibly “Play Next”) actions.
- Improve UX over current tap-to-delete.

### 4. Replace Widget Emoji with Vector Assets
- Export SVG icons (prev, play, pause, next, like) to PNG assets.
- Use `ImageWidget` in the widget for consistent branding.
- Ensure assets are bundled in `widget` configuration.

### 5. Implement Bass Booster / EQ
- Research options:
  - `react-native-track-player` native equalizer bridge (Android: `Equalizer` class, iOS: `AVAudioUnitEQ`).
  - Custom native module or fork of track-player with EQ support.
  - If infeasible, consider switching to `expo-av` for simpler audio processing (large migration).
- UI: Keep the toggle in Settings, but make it functional with at least a simple low-shelf gain.

## Medium Priority

### 6. Add Pull-to-Refresh in Queue
- Wrap `FlatList` with `RefreshControl` to allow library rescan.
- Call `reload` from `useMediaLibrary`.

### 7. Search Enhancements
- Add clear button in search bar.
- Search by album (requires album metadata from `useMediaLibrary` – already extracted but not stored).
- Recent searches memory.

### 8. Tab Badges
- Show number of liked tracks on “Liked” tab.
- Could also show library count on “Home” tab.

### 9. Long-press Track Actions (Context Menu)
- “Play next” (enqueue after current)
- “Add to queue” (append to end)
- “Go to artist” (if we add artist screen)
- “Remove from library” (delete file? – dangerous)

### 10. Upgrade Dependencies
- Update `react-native-track-player` to latest (may require native changes).
- Update `react-native-android-widget`.
- Address Gradle 9 deprecation warnings proactively.
- Test on React Native 0.82+ if Expo SDK 55 is available.

## Low Priority / Nice-to-Have

### 11. Shuffle Algorithm Improvement
- True random shuffle vs. weighted? Currently just `Math.random()`.
- Consider “smart shuffle” that avoids immediate repeats.

### 12. Sleep Timer UX
- Add quick-set buttons (15, 30, 60, 90 min) already present; consider “Cancel” visible when active.
- Show countdown in tab bar or mini-player.

### 13. Background Color Modes
- Add “Black” and “White” solid themes in addition to adaptive/custom.
- Could be useful for OLED/outdoor.

### 14. Widget Actions Expansion
- Add “Like” button (already v3) to widget – done.
- Add “Dislike” (skip & remove) maybe.
- Add “Playlist” selection in widget? Too complex.

### 15. Crash Reporting & Analytics
- Integrate Sentry or similar for production error tracking.
- Anonymous usage stats for feature adoption.

## Technical Debt

### 16. Remove Deprecated `useAudio.ts`
- Already unused; delete to reduce confusion.

### 17. TypeScript Strictness
- Resolve any `any` types, especially in widget-task and player hooks.
- Add tests for critical paths (TrackPlayer setup, widget sync).

### 18. Native Module Cleanup
- Ensure `react-native-track-player` and `react-native-android-widget` are properly linked in all build profiles.
- Verify Proguard/R8 rules if minification enabled.

---

## Release Checklist

For each version:
- [ ] Update versions in `package.json`, `app.json`, `android/build.gradle` (versionCode increment).
- [ ] Update CHANGELOG.md.
- [ ] Run lint and format.
- [ ] Build and test on physical Android device (various Android versions).
- [ ] Test widget placement and updates.
- [ ] Verify permissions (READ_MEDIA_AUDIO, POST_NOTIFICATIONS) on Android 13+.
- [ ] Check background audio and lockscreen controls.
- [ ] Audit battery usage.

---

## v3 Completed Features (for reference)

- Crash fixes (widget guards, media library robustness)
- Next/prev autoplay with error handling
- Auto-continue (repeat enabled by default)
- Error Boundary
- Home → Liked → Queue → Settings tab order
- Widget Like button (heart) with sync
- Tap-to-delete in Queue (✕ button)
- Dynamic version in Settings (from native build)
- Version bump to 3.0.0 (versionCode 4)
