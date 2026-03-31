import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as SecureStore from 'expo-secure-store';
import { Track } from '../types/Track';
import { triggerWidgetUpdate } from '../widgets/widget-logic';
import { WIDGET_KEYS } from '../widgets/widget-constants';

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
  const [shouldPlay, setShouldPlay] = useState(false);

  // SINGLETON PLAYER: Use a constant initial source to keep the player object alive forever.
  // This prevents the "Cannot use shared object that was already released" crash.
  const player = useAudioPlayer('');
  const status = useAudioPlayerStatus(player);

  const lastTracksRef = useRef<string>('');


  const loadTrack = useCallback((index: number, autoPlay = true) => {
    if (index < 0 || index >= tracks.length) return;
    setCurrentIndex(index);
    const uri = tracks[index].uri;
    if (uri) {
      if ((player as any).replace) {
        (player as any).replace(uri);
      } else {
        (player as any).source = uri;
      }
      
      if (autoPlay) setShouldPlay(true);
      else setShouldPlay(false);
    }
  }, [tracks, player]);

  const togglePlay = useCallback(() => {
    if (!player) return;
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const seekTo = useCallback((seconds: number) => {
    if (!player) return;
    try {
      player.seekTo(seconds * 1000); 
    } catch (e) {
      // Safety guard against released objects
    }
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

  // --- WIDGET SYNC & COMMANDS ---

  // Sync state to Widget & System Notification (Lock Screen)
  useEffect(() => {
    async function syncExternalControls() {
      if (currentIndex < 0) return;
      const track = tracks[currentIndex];
      
      // 1. Update System Notification (Lock Screen / Control Center)
      if (player && (player as any).setMetadata) {
        (player as any).setMetadata({
          title: track.title,
          artist: track.artist,
          album: 'Esei Tase', 
          artwork: track.artUri,
        });
      }

      // 2. Sync to Home Screen Widget
      await SecureStore.setItemAsync(WIDGET_KEYS.TITLE, track.title || 'Unknown');
      await SecureStore.setItemAsync(WIDGET_KEYS.ARTIST, track.artist || 'Unknown');
      await SecureStore.setItemAsync(WIDGET_KEYS.IS_PLAYING, String(player.playing));
      await SecureStore.setItemAsync(WIDGET_KEYS.ART_URI, track.artUri || '');
      
      // Trigger the native widget re-render
      triggerWidgetUpdate();
    }
    syncExternalControls();
  }, [currentIndex, player.playing, tracks]);

  // Listen for Commands from Widget
  useEffect(() => {
    const interval = setInterval(async () => {
      const command = await SecureStore.getItemAsync(WIDGET_KEYS.COMMAND);
      const commandId = await SecureStore.getItemAsync(WIDGET_KEYS.COMMAND_ID);
      
      if (command && commandId) {
        const lastCmdId = (await SecureStore.getItemAsync(WIDGET_KEYS.LAST_PROCESSED_CMD)) || '';
        if (commandId !== lastCmdId) {
          await SecureStore.setItemAsync(WIDGET_KEYS.LAST_PROCESSED_CMD, commandId);
          
          if (command === 'PLAY' || command === 'PAUSE') togglePlay();
          if (command === 'NEXT') nextTrack();
          if (command === 'PREV') prevTrack();
          
          await SecureStore.deleteItemAsync(WIDGET_KEYS.COMMAND);
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [togglePlay, nextTrack, prevTrack]);

  // --- EFFECTS ---

  // Persisted Settings
  useEffect(() => {
    async function loadSettings() {
      const savedShuffle = await SecureStore.getItemAsync(STORAGE_KEYS.SHUFFLE);
      const savedRepeat = await SecureStore.getItemAsync(STORAGE_KEYS.REPEAT);
      if (savedShuffle !== null) setShuffle(savedShuffle === 'true');
      if (savedRepeat !== null) {
        const repeatVal = savedRepeat === 'true';
        setRepeat(repeatVal);
        (player as any).loop = repeatVal;
      }
    }
    loadSettings();
  }, [player]);

  // Handle Intentional Playback (after track change)
  useEffect(() => {
    if (shouldPlay && player) {
      player.play();
      // Auto-reset after a delay to ensure the play command is caught by the engine
      const t = setTimeout(() => setShouldPlay(false), 800);
      return () => clearTimeout(t);
    }
  }, [shouldPlay, currentIndex, player]);

  const lastTriggeredIndex = useRef(-1);

  // Real-time Progress & Auto-Play Heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      const cur = (player as any).currentTime ?? 0;
      if (typeof cur === 'number') {
        setRealtimePosition(cur);
      }

      // Handle Completion
      const dur = (player as any).duration || (tracks[currentIndex]?.duration ?? 0) * 1000;
      
      // ULTRA-ROBUST AUTO-PLAY: If we're within 1.2s of the end, jump to next.
      // We use a ref to ensure we only jump once per track.
      if (dur > 2000 && cur > 1000 && cur >= dur - 1200 && !player.loop) {
        if (lastTriggeredIndex.current !== currentIndex) {
          lastTriggeredIndex.current = currentIndex;
          nextTrack();
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player, currentIndex, tracks, player.loop, nextTrack]);

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
