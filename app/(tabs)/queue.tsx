import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerContext } from '../../src/context/PlayerContext';
import { QueueList } from '../../src/components/QueueList';
import { MiniPlayer } from '../../src/components/MiniPlayer';
import { useDebounce } from '../../src/hooks/useDebounce';
import { TextInput } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { PageLayout } from '../../src/components/PageLayout';

export default function QueueScreen() {
  const { tracks, currentIndex, theme, loadTrack } = usePlayerContext();
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);

  const filteredTracks = React.useMemo(() => {
    if (!debouncedSearch) return tracks;
    const query = debouncedSearch.toLowerCase();
    return tracks.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.artist.toLowerCase().includes(query)
    );
  }, [tracks, debouncedSearch]);

  return (
    <PageLayout theme={theme}>
      <MiniPlayer />
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrap, { backgroundColor: theme.surface }]}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.muted} strokeWidth={2.5}>
            <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </Svg>
          <TextInput
            placeholder="Search queue..."
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: '#f0f0f0' }]}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>
      </View>
      <View style={styles.list}>
        <QueueList
          tracks={filteredTracks}
          currentIndex={currentIndex}
          theme={theme}
          onSelect={(i) => {
            const track = filteredTracks[i];
            const originalIndex = tracks.findIndex(t => t.id === track.id);
            loadTrack(originalIndex, true);
          }}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 24,
    padding: 0,
  },
});
