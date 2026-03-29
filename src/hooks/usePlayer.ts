import { useEffect, useRef, useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, AudioSource } from 'expo-audio';
import { Track } from '../types/Track';

export interface PlayerState {
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
}

export function usePlayer(tracks: Track[]) {
  const tracksRef = useRef(tracks);
  const currentIndexRef = useRef(-1);
  const volumeRef = useRef(0.8);
  const autoPlayRef = useRef(false);

  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [stateOverride, setStateOverride] = useState<Partial<PlayerState>>({});

  useEffect(() => { tracksRef.current = tracks; }, [tracks]);

  const source: AudioSource | null = currentUri ? { uri: currentUri } : null;
  const player = useAudioPlayer(source ?? { uri: '' });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (status.didJustFinish) {
      const next = (currentIndexRef.current + 1) % tracksRef.current.length;
      _loadTrack(next, true);
    }
  }, [status.didJustFinish]);

  useEffect(() => {
    if (source && player) {
      player.volume = volumeRef.current;
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
    setCurrentUri(currentTracks[index].uri);
    setStateOverride({ currentIndex: index, position: 0, duration: 0 });
  }

  function loadTrack(index: number, autoPlay = true) {
    _loadTrack(index, autoPlay);
  }

  function togglePlay() {
    if (!source) {
      if (tracksRef.current.length > 0) loadTrack(0, true);
      return;
    }
    if (status.playing) player.pause();
    else player.play();
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
    _loadTrack((currentIndexRef.current + 1) % tracksRef.current.length, status.playing);
  }

  function prevTrack() {
    if (!tracksRef.current.length) return;
    if ((status.currentTime ?? 0) > 3) {
      seekTo(0);
    } else {
      _loadTrack(
        (currentIndexRef.current - 1 + tracksRef.current.length) % tracksRef.current.length,
        status.playing
      );
    }
  }

  const state: PlayerState = {
    currentIndex: stateOverride.currentIndex ?? currentIndexRef.current,
    isPlaying: status.playing ?? false,
    position: status.currentTime ?? 0,
    duration: status.duration ?? 0,
    volume: stateOverride.volume ?? volumeRef.current,
  };

  return { state, loadTrack, togglePlay, seekTo, setVolume, nextTrack, prevTrack };
}
