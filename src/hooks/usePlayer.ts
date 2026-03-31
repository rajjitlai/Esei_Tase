import { useEffect, useRef, useState, useCallback } from 'react';
import TrackPlayer, {
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

export function usePlayer(tracks: Track[]) {
  const [isReady, setIsReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [volume, setVolumeState] = useState(0.8);
  const [rate, setRateState] = useState(1.0);

  const lastTracksRef = useRef<string>('');
  const progress = useProgress(200); // 200ms for smoother slider
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync isPlaying with TrackPlayer state events
  useEffect(() => {
    if (!isReady) return;

    let mounted = true;

    async function fetchInitialState() {
      try {
        const { state } = await TrackPlayer.getPlaybackState();
        if (mounted) {
          const playing = state === State.Playing || state === State.Buffering;
          setIsPlaying(playing);
        }
      } catch (e) {
        console.error('[usePlayer] Error fetching initial playback state:', e);
      }
    }

    fetchInitialState();

    const sub = TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
      // Handle difference between plain state and RN TP v4 event object
      const eventState = (event as any).state ?? event;
      const playing = eventState === State.Playing || eventState === State.Buffering;
      setIsPlaying(playing);
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, [isReady]);

  // Initialize Player
  useEffect(() => {
    let unmounted = false;
    async function setup() {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
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
      try {
        const tracksHash = tracks.map(t => t.id).join(',');
        if (lastTracksRef.current === tracksHash) return;

        const queue = await TrackPlayer.getQueue();
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

          lastTracksRef.current = tracksHash;
          if (currentIndex === -1) {
            setCurrentIndex(0);
            await TrackPlayer.skip(0);
          }
        }
      } catch (e) {
        console.error('[usePlayer] Queue sync error:', e);
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

    const trackSub = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event: PlaybackActiveTrackChangedEvent) => {
      if (event.index !== undefined) {
        setCurrentIndex(event.index);
      }
    });

    const queueEndedSub = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      if (repeat) {
        await nextTrack();
      } else {
        setIsPlaying(false);
      }
    });

    // Listen for errors
    const errorSub = TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
      console.error('[usePlayer] PlaybackError event:', error);
    });

    return () => {
      trackSub.remove();
      errorSub.remove();
    };
  }, [isReady]);

  // --- WIDGET SYNC & COMMANDS ---

  // Sync state to Widget (TrackPlayer handles notifications automatically via track metadata)
  useEffect(() => {
    async function syncExternalControls() {
      if (currentIndex < 0 || !tracks[currentIndex]) return;
      const track = tracks[currentIndex];

      // Sync to Home Screen Widget
      try {
        await SecureStore.setItemAsync(WIDGET_KEYS.TITLE, track.title || 'Unknown');
        await SecureStore.setItemAsync(WIDGET_KEYS.ARTIST, track.artist || 'Unknown');
        await SecureStore.setItemAsync(WIDGET_KEYS.IS_PLAYING, String(isPlaying));
        await SecureStore.setItemAsync(WIDGET_KEYS.ART_URI, track.artUri || '');

        // Trigger the native widget re-render
        triggerWidgetUpdate();
      } catch {
        // Silent fail if storage busy
      }
    }

    syncExternalControls();
  }, [currentIndex, isPlaying, tracks]);

  const loadTrack = useCallback(async (index: number, autoPlay = true) => {
    if (!isReady) return;
    try {
      await TrackPlayer.skip(index);
      setCurrentIndex(index);
      if (autoPlay) {
        setIsPlaying(true);
        await TrackPlayer.play();
      }
    } catch (e) {
      console.error('[usePlayer] loadTrack error:', e);
    }
  }, [isReady]);

  const togglePlay = useCallback(async () => {
    if (!isReady) return;
    try {
      const { state } = await TrackPlayer.getPlaybackState();
      const isCurrentlyPlaying = state === State.Playing || state === State.Buffering;
      
      setIsPlaying(!isCurrentlyPlaying); // Optimistic UI Update
      
      if (isCurrentlyPlaying) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (e) {
      console.error('[usePlayer] togglePlay error:', e);
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
    setIsPlaying(true);
    await TrackPlayer.play();
  }, [isReady, shuffle, tracks.length]);

  const prevTrack = useCallback(async () => {
    if (!isReady) return;
    const pos = await TrackPlayer.getPosition();
    if (pos > 3) {
      await TrackPlayer.seekTo(0);
    } else {
      await TrackPlayer.skipToPrevious();
    }
    setIsPlaying(true);
    await TrackPlayer.play();
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

  // Listen for Commands from Widget
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const command = await SecureStore.getItemAsync(WIDGET_KEYS.COMMAND);
        const commandId = await SecureStore.getItemAsync(WIDGET_KEYS.COMMAND_ID);

        if (command && commandId) {
          const lastCmdId = await SecureStore.getItemAsync(WIDGET_KEYS.LAST_PROCESSED_CMD);
          if (commandId !== lastCmdId) {
            await SecureStore.setItemAsync(WIDGET_KEYS.LAST_PROCESSED_CMD, commandId);

            if (command === 'PLAY' || command === 'PAUSE') await togglePlay();
            else if (command === 'NEXT') await nextTrack();
            else if (command === 'PREV') await prevTrack();

            await SecureStore.deleteItemAsync(WIDGET_KEYS.COMMAND);
          }
        }
      } catch {
        // Ignore storage errors
      }
    }, 500);

    return () => clearInterval(interval);
  }, [togglePlay, nextTrack, prevTrack]);

  // isPlaying is managed via event listener state above

  const state: PlayerState = {
    currentIndex,
    isPlaying, // from useState updated via PlaybackState events
    position: progress.position,
    duration: progress.duration,
    volume,
    rate,
    shuffle,
    repeat,
  };

  return { state, loadTrack, togglePlay, seekTo, setVolume, setRate, nextTrack, prevTrack, toggleShuffle, toggleRepeat };
}
