import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Track, ThemeColors } from '../types/Track';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { useAudio } from '../hooks/useAudio';
import { useAlbumColor } from '../hooks/useAlbumColor';
import { useFavorites } from '../hooks/useFavorites';

const BG_KEYS = {
  MODE: 'esei_tase_bg_mode',
  URI: 'esei_tase_custom_bg_uri',
  OPACITY: 'esei_tase_bg_opacity',
};

type BgMode = 'adaptive' | 'custom';

interface PlayerContextValue {
  // Tracks
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  loading: boolean;
  permissionDenied: boolean;
  // Player
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  rate: number;
  loadTrack: (index: number, autoPlay?: boolean) => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
  setRate: (r: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  shuffle: boolean;
  repeat: boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  // Theme
  theme: ThemeColors;
  // Background Customization
  bgMode: BgMode;
  setBgMode: (mode: BgMode) => void;
  customBgUri: string | null;
  setCustomBgUri: (uri: string | null) => void;
  bgOpacity: number;
  setBgOpacity: (opacity: number) => void;
  // Filtering
  minDuration: number;
  updateMinDuration: (seconds: number) => void;
  // Favorites
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  // Sleep Timer
  sleepTimer: number; // seconds remaining
  setSleepTimer: (minutes: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { tracks, setTracks, loading, permissionDenied, minDuration, updateMinDuration } = useMediaLibrary();
  const { state, loadTrack, togglePlay, seekTo, setVolume, setRate, nextTrack, prevTrack, toggleShuffle, toggleRepeat } = useAudio(tracks);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Sleep Timer State
  const [sleepTimer, _setSleepTimer] = useState(0);
  const timerRef = useRef<any>(null);

  const setSleepTimer = useCallback((minutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (minutes <= 0) {
      _setSleepTimer(0);
      return;
    }

    const seconds = minutes * 60;
    _setSleepTimer(seconds);

    timerRef.current = setInterval(() => {
      _setSleepTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          togglePlay(); // Pause playback
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [togglePlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const currentTrack = state.currentIndex >= 0 ? tracks[state.currentIndex] : null;
  const theme = useAlbumColor(currentTrack?.artUri ?? null);

  // Background State
  const [bgMode, _setBgMode] = useState<BgMode>('adaptive');
  const [customBgUri, _setCustomBgUri] = useState<string | null>(null);
  const [bgOpacity, _setBgOpacity] = useState<number>(0.1);

  // Persistence: Load
  useEffect(() => {
    async function load() {
      try {
        const mode = await SecureStore.getItemAsync(BG_KEYS.MODE);
        const uri = await SecureStore.getItemAsync(BG_KEYS.URI);
        const opacity = await SecureStore.getItemAsync(BG_KEYS.OPACITY);

        if (mode) _setBgMode(mode as BgMode);
        if (uri) _setCustomBgUri(uri);
        if (opacity) _setBgOpacity(parseFloat(opacity));
      } catch (e) {
        console.error('Failed to load BG settings', e);
      }
    }
    load();
  }, []);

  // Setters with Persistence
  const setBgMode = useCallback(async (mode: BgMode) => {
    _setBgMode(mode);
    await SecureStore.setItemAsync(BG_KEYS.MODE, mode);
  }, []);

  const setCustomBgUri = useCallback(async (uri: string | null) => {
    _setCustomBgUri(uri);
    if (uri) await SecureStore.setItemAsync(BG_KEYS.URI, uri);
    else await SecureStore.deleteItemAsync(BG_KEYS.URI);
  }, []);

  const setBgOpacity = useCallback(async (opacity: number) => {
    _setBgOpacity(opacity);
    await SecureStore.setItemAsync(BG_KEYS.OPACITY, opacity.toString());
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        tracks,
        setTracks,
        loading,
        permissionDenied,
        currentIndex: state.currentIndex,
        isPlaying: state.isPlaying,
        position: state.position,
        duration: state.duration,
        volume: state.volume,
        rate: state.rate,
        loadTrack,
        togglePlay,
        seekTo,
        setVolume,
        setRate,
        nextTrack,
        prevTrack,
        shuffle: state.shuffle,
        repeat: state.repeat,
        toggleShuffle,
        toggleRepeat,
        theme,
        // BG
        bgMode,
        setBgMode,
        customBgUri,
        setCustomBgUri,
        bgOpacity,
        setBgOpacity,
        // Filtering
        minDuration,
        updateMinDuration,
        // Favorites
        isFavorite,
        toggleFavorite,
        // Sleep Timer
        sleepTimer,
        setSleepTimer,
      }}
    >
      {bgMode === 'custom' && customBgUri ? (
        <View style={StyleSheet.absoluteFill}>
          <Image source={{ uri: customBgUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: bgOpacity }]} />
        </View>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg }]} />
      )}
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayerContext must be used inside PlayerProvider');
  return ctx;
}
