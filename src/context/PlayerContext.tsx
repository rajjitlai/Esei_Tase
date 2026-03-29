import React, { createContext, useContext, useState, useCallback } from 'react';
import { Track, ThemeColors } from '../types/Track';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { usePlayer } from '../hooks/usePlayer';
import { useAlbumColor } from '../hooks/useAlbumColor';
import { DEFAULT_THEME } from '../constants/theme';

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
  // Theme
  theme: ThemeColors;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { tracks, setTracks, loading, permissionDenied } = useMediaLibrary();
  const { state, loadTrack, togglePlay, seekTo, setVolume, nextTrack, prevTrack } = usePlayer(tracks);

  const currentTrack = state.currentIndex >= 0 ? tracks[state.currentIndex] : null;
  const theme = useAlbumColor(currentTrack?.artUri ?? null);

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
        theme,
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
