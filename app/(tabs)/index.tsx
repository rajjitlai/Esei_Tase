import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerContext } from '../../src/context/PlayerContext';
import { AlbumArt } from '../../src/components/AlbumArt';
import { TrackInfo } from '../../src/components/TrackInfo';
import { SeekBar } from '../../src/components/SeekBar';
import { Controls } from '../../src/components/Controls';
import { VolumeSlider } from '../../src/components/VolumeSlider';

export default function HomeScreen() {
  const {
    tracks, currentIndex, isPlaying, position, duration, volume,
    theme, loading, permissionDenied,
    togglePlay, seekTo, setVolume, nextTrack, prevTrack, loadTrack,
  } = usePlayerContext();

  useEffect(() => {
    if (tracks.length && currentIndex === -1) {
      loadTrack(0, false);
    }
  }, [tracks.length]);

  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] : null;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.accent} size="large" />
        <Text style={[styles.hint, { color: theme.muted }]}>Loading your library...</Text>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={[styles.hint, { color: theme.muted }]}>
          Media permission denied. Please grant access in Settings.
        </Text>
      </View>
    );
  }

  const subtitle = currentTrack
    ? `${currentTrack.filename.split('.').pop()?.toUpperCase()} · ${currentIndex + 1} of ${tracks.length}`
    : 'Open a folder to begin';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AlbumArt artUri={currentTrack?.artUri ?? null} theme={theme} isPlaying={isPlaying} />
        <TrackInfo
          title={currentTrack?.title ?? 'No track loaded'}
          subtitle={subtitle}
          theme={theme}
        />
        <SeekBar position={position} duration={duration} theme={theme} onSeek={seekTo} />
        <Controls isPlaying={isPlaying} theme={theme} onToggle={togglePlay} onNext={nextTrack} onPrev={prevTrack} />
        <VolumeSlider volume={volume} theme={theme} onVolumeChange={setVolume} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 12 },
});
