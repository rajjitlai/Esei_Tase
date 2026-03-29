import { useEffect, useRef, useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, AudioSource } from 'expo-audio';
import * as SecureStore from 'expo-secure-store';
import { Track } from '../types/Track';

export interface PlayerState {
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
}

const STORAGE_KEYS = {
  SHUFFLE: 'esei_tase_shuffle',
  REPEAT: 'esei_tase_repeat',
};

export function usePlayer(tracks: Track[]) {
  const tracksRef = useRef(tracks);
  const currentIndexRef = useRef(-1);
  const volumeRef = useRef(0.8);
  const autoPlayRef = useRef(false);
  const shuffleRef = useRef(false);
  const repeatRef = useRef(true); // Default to repeating the playlist

  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [stateOverride, setStateOverride] = useState<Partial<PlayerState>>({});
  const [shuffleState, setShuffleState] = useState(false);
  const [repeatState, setRepeatState] = useState(true);

  // Persistence: Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedShuffle = await SecureStore.getItemAsync(STORAGE_KEYS.SHUFFLE);
        const savedRepeat = await SecureStore.getItemAsync(STORAGE_KEYS.REPEAT);
        
        if (savedShuffle !== null) {
          const isShuffle = savedShuffle === 'true';
          shuffleRef.current = isShuffle;
          setShuffleState(isShuffle);
        }
        
        if (savedRepeat !== null) {
          const isRepeat = savedRepeat === 'true';
          repeatRef.current = isRepeat;
          setRepeatState(isRepeat);
        }
      } catch (e) {
        console.error('Failed to load player settings:', e);
      }
    };
    loadSettings();
  }, []);

  async function toggleShuffle() {
    const newVal = !shuffleRef.current;
    shuffleRef.current = newVal;
    setShuffleState(newVal);
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.SHUFFLE, String(newVal));
    } catch (e) {
      console.error('Failed to save shuffle setting:', e);
    }
  }
  
  async function toggleRepeat() {
    const newVal = !repeatRef.current;
    repeatRef.current = newVal;
    setRepeatState(newVal);
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.REPEAT, String(newVal));
    } catch (e) {
      console.error('Failed to save repeat setting:', e);
    }
  }

  useEffect(() => { tracksRef.current = tracks; }, [tracks]);

  const currentTrack = currentIndexRef.current >= 0 ? tracksRef.current[currentIndexRef.current] : null;

  const source: AudioSource | null = currentUri ? { uri: currentUri } : null;
  const player = useAudioPlayer(source ?? { uri: '' });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (status.didJustFinish) {
      nextTrack();
    }
  }, [status.didJustFinish]);

  useEffect(() => {
    if (source && player && currentTrack) {
      player.volume = volumeRef.current;
      
      // Update Lock Screen / Notification Metadata
      player.setActiveForLockScreen(true, {
        title: currentTrack.title,
        artist: currentTrack.artist,
        artworkUrl: currentTrack.artUri ?? undefined,
      });

      if (autoPlayRef.current) {
        player.play();
      }
    }
  }, [currentUri]);

  function _loadTrack(index: number, autoPlay: boolean) {
    const currentTracks = tracksRef.current;
    if (index < 0 || index >= currentTracks.length) return;
    currentIndexRef.current = index;
    autoPlayRef.current = autoPlay;
    
    const newUri = currentTracks[index].uri;
    if (newUri === currentUri && player) {
      // Replaying the exact same song! Just rewind.
      player.seekTo(0);
      if (autoPlay) player.play();
    } else {
      setCurrentUri(newUri);
    }
    
    setStateOverride({ currentIndex: index, position: 0, duration: 0 });
  }

  function loadTrack(index: number, autoPlay = true) {
    _loadTrack(index, autoPlay);
  }

  function togglePlay() {
    if (!source || !player) {
      if (tracksRef.current.length > 0) loadTrack(0, true);
      return;
    }
    if (status.playing) {
      player.pause();
    } else {
      // Automatically rewind if the user hits play at the very end of the track
      if (status.currentTime !== undefined && status.duration !== undefined && 
          status.duration > 0 && status.currentTime >= status.duration - 0.5) {
        player.seekTo(0);
      }
      player.play();
    }
  }

  function seekTo(seconds: number) {
    player.seekTo(seconds);
  }

  function setVolume(v: number) {
    volumeRef.current = v;
    player.volume = v;
    setStateOverride((prev) => ({ ...prev, volume: v }));
  }

  function nextTrack() {
    if (!tracksRef.current.length) return;
    let next;
    if (shuffleRef.current) {
      next = Math.floor(Math.random() * tracksRef.current.length);
    } else {
      next = currentIndexRef.current + 1;
      if (next >= tracksRef.current.length) {
        if (repeatRef.current) {
          next = 0;
        } else {
          if (player) player.pause();
          return;
        }
      }
    }
    _loadTrack(next, status.playing ?? false);
  }

  function prevTrack() {
    if (!tracksRef.current.length) return;
    if ((status.currentTime ?? 0) > 3) {
      seekTo(0);
    } else {
      if (shuffleRef.current) {
        _loadTrack(Math.floor(Math.random() * tracksRef.current.length), status.playing ?? false);
      } else {
        let prev = currentIndexRef.current - 1;
        if (prev < 0) {
          if (repeatRef.current) prev = tracksRef.current.length - 1;
          else prev = 0;
        }
        _loadTrack(prev, status.playing ?? false);
      }
    }
  }

  const state: PlayerState = {
    currentIndex: stateOverride.currentIndex ?? currentIndexRef.current,
    isPlaying: status.playing ?? false,
    position: status.currentTime ?? 0,
    duration: status.duration ?? 0,
    volume: stateOverride.volume ?? volumeRef.current,
    shuffle: shuffleState,
    repeat: repeatState,
  };

  return { state, loadTrack, togglePlay, seekTo, setVolume, nextTrack, prevTrack, toggleShuffle, toggleRepeat };
}
