import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerContext } from '../../src/context/PlayerContext';
import { QueueList } from '../../src/components/QueueList';
import { MiniPlayer } from '../../src/components/MiniPlayer';

export default function QueueScreen() {
  const { tracks, currentIndex, theme, loadTrack } = usePlayerContext();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.07)' }]}>
        <Text style={[styles.label, { color: theme.muted }]}>QUEUE</Text>
        <Text style={[styles.count, { color: theme.accent }]}>{tracks.length} tracks</Text>
      </View>
      <MiniPlayer />
      <View style={styles.list}>
        <QueueList
          tracks={tracks}
          currentIndex={currentIndex}
          theme={theme}
          onSelect={(i) => loadTrack(i, true)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  label: { fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase' },
  count: { fontSize: 12, fontWeight: '600' },
  list: { flex: 1 },
});
