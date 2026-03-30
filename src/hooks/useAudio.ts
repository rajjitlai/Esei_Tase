import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as SecureStore from 'expo-secure-store';
import { Track } from '../types/Track';

export interface PlayerState {
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  rate: number;
  shuffle: boolean;
  repeat: boolean;
}

const STORAGE_KEYS = {
  SHUFFLE: 'esei_tase_shuffle',
  REPEAT: 'esei_tase_repeat',
};

export function useAudio(tracks: Track[]) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [volume, setVolumeState] = useState(0.8);
  const [rate, setRateState] = useState(1.0);
  const [realtimePosition, setRealtimePosition] = useState(0);

  // Initialize the player with the first track or current track
  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] : null;
  const player = useAudioPlayer(currentTrack?.uri ?? '');
  const status = useAudioPlayerStatus(player);

  const lastTracksRef = useRef<string>('');

  // Persisted Settings
  useEffect(() => {
    async function loadSettings() {
      const savedShuffle = await SecureStore.getItemAsync(STORAGE_KEYS.SHUFFLE);
      const savedRepeat = await SecureStore.getItemAsync(STORAGE_KEYS.REPEAT);
      if (savedShuffle !== null) setShuffle(savedShuffle === 'true');
      if (savedRepeat !== null) {
        const repeatVal = savedRepeat === 'true';
        setRepeat(repeatVal);
        player.loop = repeatVal;
      }
    }
    loadSettings();
  }, [player]);

  // Real-time Progress Heartbeat (500ms)
  useEffect(() => {
    if (!player.playing) {
      setRealtimePosition((player as any).currentTime ?? 0);
      return;
    }

    const interval = setInterval(() => {
      setRealtimePosition((player as any).currentTime ?? 0);
    }, 500);

    return () => clearInterval(interval);
  }, [player.playing, player]);

  // Handle Track Completion
  useEffect(() => {
    const cur = (player as any).currentTime ?? 0;
    const dur = (player as any).duration ?? 0;
    if (cur > 0 && dur > 0 && cur >= dur && !player.loop) {
      nextTrack();
    }
  }, [status, player.loop]);

  const loadTrack = useCallback((index: number, autoPlay = true) => {
    if (index < 0 || index >= tracks.length) return;
    setCurrentIndex(index);
    const uri = tracks[index].uri;
    if (uri) {
      // In expo-audio, we use replace or direct source change
      if ((player as any).replace) {
        (player as any).replace(uri);
      } else {
        (player as any).source = uri;
      }
      
      if (autoPlay) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [tracks, player]);

  const togglePlay = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const seekTo = useCallback((seconds: number) => {
    player.seekTo(seconds * 1000); 
  }, [player]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    player.volume = v;
  }, [player]);

  const setRate = useCallback((r: number) => {
    setRateState(r);
    (player as any).playbackRate = r;
  }, [player]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    loadTrack(nextIndex);
  }, [currentIndex, tracks, shuffle, loadTrack]);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    const curTime = (status as any)?.currentTime ?? 0;
    if (curTime > 3000) {
      (player as any).seekTo(0);
    } else {
      const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
      loadTrack(prevIndex);
    }
  }, [currentIndex, tracks, status, loadTrack, player]);

  const toggleShuffle = useCallback(async () => {
    const newVal = !shuffle;
    setShuffle(newVal);
    await SecureStore.setItemAsync(STORAGE_KEYS.SHUFFLE, String(newVal));
  }, [shuffle]);

  const toggleRepeat = useCallback(async () => {
    const newVal = !repeat;
    setRepeat(newVal);
    (player as any).loop = newVal;
    await SecureStore.setItemAsync(STORAGE_KEYS.REPEAT, String(newVal));
  }, [repeat, player]);

  const state: PlayerState = {
    currentIndex,
    isPlaying: (status as any)?.playing ?? player.playing,
    position: realtimePosition / 1000,
    duration: Number((player as any).duration || (tracks[currentIndex]?.duration ?? 0) * 1000 || 0) / 1000,
    volume,
    rate,
    shuffle,
    repeat,
  };

  return { 
    state, 
    loadTrack, 
    togglePlay, 
    seekTo, 
    setVolume, 
    setRate, 
    nextTrack, 
    prevTrack, 
    toggleShuffle, 
    toggleRepeat 
  };
}
