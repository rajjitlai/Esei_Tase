import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerContext } from '../../src/context/PlayerContext';
import { QueueList } from '../../src/components/QueueList';
import { MiniPlayer } from '../../src/components/MiniPlayer';

import { PageLayout } from '../../src/components/PageLayout';

export default function QueueScreen() {
  const { tracks, currentIndex, theme, loadTrack } = usePlayerContext();

  return (
    <PageLayout theme={theme}>
      <MiniPlayer />
      <View style={styles.list}>
        <QueueList
          tracks={tracks}
          currentIndex={currentIndex}
          theme={theme}
          onSelect={(i) => loadTrack(i, true)}
        />
      </View>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  label: { fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase' },
  count: { fontSize: 12, fontWeight: '600' },
  list: { flex: 1 },
});
