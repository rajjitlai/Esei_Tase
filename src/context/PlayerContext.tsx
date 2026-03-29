import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Track, ThemeColors } from '../types/Track';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { usePlayer } from '../hooks/usePlayer';
import { useAlbumColor } from '../hooks/useAlbumColor';

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
  loadTrack: (index: number, autoPlay?: boolean) => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
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
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { tracks, setTracks, loading, permissionDenied } = useMediaLibrary();
  const { state, loadTrack, togglePlay, seekTo, setVolume, nextTrack, prevTrack, toggleShuffle, toggleRepeat } = usePlayer(tracks);

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
        loadTrack,
        togglePlay,
        seekTo,
        setVolume,
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
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayerContext must be used inside PlayerProvider');
  return ctx;
}
