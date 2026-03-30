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
  const playbackState = usePlaybackState();
  const progress = useProgress();

  // Debug: Log playback state changes
  useEffect(() => {
    console.log('[usePlayer] playbackState:', playbackState);
    const isPlayingDerived = playbackState.state === State.Playing || playbackState.state === State.Buffering;
    console.log('[usePlayer] isPlayingDerived:', isPlayingDerived, 'currentIndex:', currentIndex);
  }, [playbackState, currentIndex]);

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
      try {
        console.log('[usePlayer] Syncing queue, tracks length:', tracks.length);
        const tracksHash = tracks.map(t => t.id).join(',');
        if (lastTracksRef.current === tracksHash) {
          console.log('[usePlayer] Queue already in sync, skipping');
          return;
        }

        const queue = await TrackPlayer.getQueue();
        console.log('[usePlayer] Current queue length:', queue.length);
        if (queue.length !== tracks.length) {
          console.log('[usePlayer] Resetting and adding tracks');
          await TrackPlayer.reset();
          await TrackPlayer.add(tracks.map(t => ({
            id: t.id,
            url: t.uri,
            title: t.title,
            artist: t.artist,
            artwork: t.artUri || undefined,
            duration: t.duration,
          })));
          console.log('[usePlayer] Tracks added to queue');

          lastTracksRef.current = tracksHash;
          if (currentIndex === -1) {
            setCurrentIndex(0);
            console.log('[usePlayer] Set currentIndex to 0');
          }
        } else {
          console.log('[usePlayer] Queue length matches, not re-adding');
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

    console.log('[usePlayer] Setting up PlaybackActiveTrackChanged listener');
    const trackSub = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event: PlaybackActiveTrackChangedEvent) => {
      console.log('[usePlayer] PlaybackActiveTrackChanged event:', event);
      if (event.index !== undefined) {
        setCurrentIndex(event.index);
        console.log('[usePlayer] currentIndex updated to', event.index);
      }
    });

    return () => {
      trackSub.remove();
      console.log('[usePlayer] Removed PlaybackActiveTrackChanged listener');
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

  const loadTrack = useCallback(async (index: number, autoPlay = true) => {
    console.log('[usePlayer] loadTrack called:', index, 'autoPlay:', autoPlay, 'isReady:', isReady);
    if (!isReady) return;
    console.log('[usePlayer] Calling TrackPlayer.skip(', index, ')');
    await TrackPlayer.skip(index);
    setCurrentIndex(index);
    console.log('[usePlayer] TrackPlayer.skip completed, currentIndex set to', index);
    if (autoPlay) {
      console.log('[usePlayer] autoPlay=true, calling TrackPlayer.play()');
      await TrackPlayer.play();
      console.log('[usePlayer] TrackPlayer.play() completed');
    }
  }, [isReady]);

  const togglePlay = useCallback(async () => {
    if (!isReady) return;
    console.log('[usePlayer] togglePlay called');
    const { state } = await TrackPlayer.getPlaybackState();
    console.log('[usePlayer] getPlaybackState returned:', state);
    const isCurrentlyPlaying = state === State.Playing || state === State.Buffering;
    console.log('[usePlayer] isCurrentlyPlaying:', isCurrentlyPlaying);
    if (isCurrentlyPlaying) {
      await TrackPlayer.pause();
      console.log('[usePlayer] paused');
    } else {
      await TrackPlayer.play();
      console.log('[usePlayer] play() called');
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

  // isPlaying detection using TrackPlayer State enum
  const isPlaying = playbackState.state === State.Playing || playbackState.state === State.Buffering;

  const state: PlayerState = {
    currentIndex,
    isPlaying,
    position: progress.position,
    duration: progress.duration,
    volume,
    rate,
    shuffle,
    repeat,
  };

  return { state, loadTrack, togglePlay, seekTo, setVolume, setRate, nextTrack, prevTrack, toggleShuffle, toggleRepeat };
}
