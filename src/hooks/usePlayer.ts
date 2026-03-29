import { useEffect, useRef, useState } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Track } from '../types/Track';

export interface PlayerState {
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
}

export function usePlayer(tracks: Track[]) {
  const soundRef = useRef<Audio.Sound | null>(null);
  // Refs hold latest values to avoid stale closures in audio callbacks
  const currentIndexRef = useRef(-1);
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(0.8);
  const tracksRef = useRef(tracks);

  const [state, setState] = useState<PlayerState>({
    currentIndex: -1,
    isPlaying: false,
    position: 0,
    duration: 0,
    volume: 0.8,
  });

  // Keep tracksRef fresh
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  function onStatus(status: AVPlaybackStatus) {
    if (!status.isLoaded) return;
    isPlayingRef.current = status.isPlaying;
    setState((prev) => ({
      ...prev,
      isPlaying: status.isPlaying,
      position: status.positionMillis / 1000,
      duration: (status.durationMillis ?? 0) / 1000,
    }));
    if (status.didJustFinish) {
      // Use ref to avoid stale closure
      const nextIndex = (currentIndexRef.current + 1) % tracksRef.current.length;
      loadTrack(nextIndex, true);
    }
  }

  async function loadTrack(index: number, autoPlay = true) {
    const currentTracks = tracksRef.current;
    if (index < 0 || index >= currentTracks.length) return;
    const track = currentTracks[index];

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    currentIndexRef.current = index;
    setState((prev) => ({
      ...prev,
      currentIndex: index,
      isPlaying: false,
      position: 0,
      duration: 0,
    }));

    const { sound } = await Audio.Sound.createAsync(
      { uri: track.uri },
      { shouldPlay: autoPlay, volume: volumeRef.current },
      onStatus
    );
    soundRef.current = sound;
    isPlayingRef.current = autoPlay;
    setState((prev) => ({ ...prev, isPlaying: autoPlay }));
  }

  async function togglePlay() {
    if (!soundRef.current) {
      if (tracksRef.current.length > 0) loadTrack(0, true);
      return;
    }
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }

  async function seekTo(seconds: number) {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(seconds * 1000);
  }

  async function setVolume(v: number) {
    volumeRef.current = v;
    setState((prev) => ({ ...prev, volume: v }));
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(v);
    }
  }

  function nextTrack() {
    const idx = currentIndexRef.current;
    if (!tracksRef.current.length) return;
    loadTrack((idx + 1) % tracksRef.current.length, isPlayingRef.current);
  }

  function prevTrack() {
    const idx = currentIndexRef.current;
    if (!tracksRef.current.length) return;
    if (state.position > 3) {
      seekTo(0);
    } else {
      loadTrack((idx - 1 + tracksRef.current.length) % tracksRef.current.length, isPlayingRef.current);
    }
  }

  return { state, loadTrack, togglePlay, seekTo, setVolume, nextTrack, prevTrack };
}
