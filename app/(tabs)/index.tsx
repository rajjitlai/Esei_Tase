import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { usePlayerContext } from '../../src/context/PlayerContext';
import { AlbumArt } from '../../src/components/AlbumArt';
import { TrackInfo } from '../../src/components/TrackInfo';
import { SeekBar } from '../../src/components/SeekBar';
import { Controls } from '../../src/components/Controls';
import { PageLayout } from '../../src/components/PageLayout';

export default function HomeScreen() {
  const {
    tracks, currentIndex, isPlaying, position, duration, volume,
    theme, loading, permissionDenied,
    togglePlay, seekTo, setVolume, nextTrack, prevTrack, loadTrack,
    shuffle, repeat, toggleShuffle, toggleRepeat
  } = usePlayerContext();

  React.useEffect(() => {
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
    <PageLayout theme={theme}>
      <View style={styles.content}>
        <AlbumArt artUri={currentTrack?.artUri ?? null} theme={theme} isPlaying={isPlaying} />
        <TrackInfo
          title={currentTrack?.title ?? 'No track loaded'}
          subtitle={subtitle}
          theme={theme}
        />
        
        <BlurView intensity={40} tint="dark" style={styles.glassPanel}>
          <SeekBar position={position} duration={duration} theme={theme} onSeek={seekTo} />
          <Controls 
            isPlaying={isPlaying} 
            theme={theme} 
            shuffle={shuffle}
            repeat={repeat}
            onToggle={togglePlay} 
            onNext={nextTrack} 
            onPrev={prevTrack} 
            onToggleShuffle={toggleShuffle}
            onToggleRepeat={toggleRepeat}
          />
        </BlurView>
      </View>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingTop: 120, // Unified offset for top navbar
    paddingBottom: 60,
    paddingHorizontal: 20 
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 12 },
  glassPanel: {
    width: '100%',
    padding: 24,
    borderRadius: 32,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
