import { useEffect, useRef, useState, useCallback } from 'react';
import TrackPlayer, { 
  usePlaybackState, 
  useProgress, 
  State, 
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode,
  Event,
  PlaybackActiveTrackChangedEvent
} from 'react-native-track-player';
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

export function usePlayer(tracks: Track[]) {
  const [isReady, setIsReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [volume, setVolumeState] = useState(0.8);
  const [rate, setRateState] = useState(1.0);

  const playbackState = usePlaybackState();
  const progress = useProgress();

  // Initialize Player
  useEffect(() => {
    let unmounted = false;
    async function setup() {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
          ],
        });
        await TrackPlayer.setRate(1.0);

        const savedShuffle = await SecureStore.getItemAsync(STORAGE_KEYS.SHUFFLE);
        const savedRepeat = await SecureStore.getItemAsync(STORAGE_KEYS.REPEAT);
        
        if (savedShuffle !== null) setShuffle(savedShuffle === 'true');
        if (savedRepeat !== null) setRepeat(savedRepeat === 'true');

        if (!unmounted) setIsReady(true);
      } catch (e) {
        // Already initialized or failed
        if (!unmounted) setIsReady(true);
      }
    }
    setup();
    return () => { unmounted = true; };
  }, []);

  // Sync Tracks to Queue
  useEffect(() => {
    if (!isReady || !tracks.length) return;

    async function updateQueue() {
      const queue = await TrackPlayer.getQueue();
      // Simple check: if lengths differ or it's empty, reset
      if (queue.length !== tracks.length) {
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks.map(t => ({
          id: t.id,
          url: t.uri,
          title: t.title,
          artist: t.artist,
          artwork: t.artUri || undefined,
          duration: t.duration,
        })));
        
        if (currentIndex === -1) {
          setCurrentIndex(0);
        }
      }
    }
    updateQueue();
  }, [isReady, tracks]);

  // Handle Repeat Mode Change
  useEffect(() => {
    if (!isReady) return;
    TrackPlayer.setRepeatMode(repeat ? RepeatMode.Queue : RepeatMode.Off);
  }, [isReady, repeat]);

  // Track Index Sync
  useEffect(() => {
    if (!isReady) return;
    const sub = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event: PlaybackActiveTrackChangedEvent) => {
      if (event.index !== undefined) {
        setCurrentIndex(event.index);
      }
    });
    return () => sub.remove();
  }, [isReady]);

  const loadTrack = useCallback(async (index: number, autoPlay = true) => {
    if (!isReady) return;
    await TrackPlayer.skip(index);
    setCurrentIndex(index);
    if (autoPlay) await TrackPlayer.play();
  }, [isReady]);

  const togglePlay = useCallback(async () => {
    if (!isReady) return;
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [isReady]);

  const seekTo = useCallback(async (seconds: number) => {
    if (!isReady) return;
    await TrackPlayer.seekTo(seconds);
  }, [isReady]);

  const setVolume = useCallback(async (v: number) => {
    if (!isReady) return;
    setVolumeState(v);
    await TrackPlayer.setVolume(v);
  }, [isReady]);

  const setRate = useCallback(async (r: number) => {
    if (!isReady) return;
    setRateState(r);
    await TrackPlayer.setRate(r);
  }, [isReady]);

  const nextTrack = useCallback(async () => {
    if (!isReady) return;
    if (shuffle) {
      const next = Math.floor(Math.random() * tracks.length);
      await TrackPlayer.skip(next);
    } else {
      await TrackPlayer.skipToNext();
    }
  }, [isReady, shuffle, tracks.length]);

  const prevTrack = useCallback(async () => {
    if (!isReady) return;
    const pos = await TrackPlayer.getPosition();
    if (pos > 3) {
      await TrackPlayer.seekTo(0);
    } else {
      await TrackPlayer.skipToPrevious();
    }
  }, [isReady]);

  const toggleShuffle = useCallback(async () => {
    const newVal = !shuffle;
    setShuffle(newVal);
    await SecureStore.setItemAsync(STORAGE_KEYS.SHUFFLE, String(newVal));
  }, [shuffle]);

  const toggleRepeat = useCallback(async () => {
    const newVal = !repeat;
    setRepeat(newVal);
    await SecureStore.setItemAsync(STORAGE_KEYS.REPEAT, String(newVal));
  }, [repeat]);

  const isPlaying = (playbackState && (playbackState as any).state) === State.Playing;

  const state: PlayerState = {
    currentIndex,
    isPlaying: !!isPlaying,
    position: progress.position,
    duration: progress.duration,
    volume,
    rate,
    shuffle,
    repeat,
  };

  return { state, loadTrack, togglePlay, seekTo, setVolume, setRate, nextTrack, prevTrack, toggleShuffle, toggleRepeat };
}
