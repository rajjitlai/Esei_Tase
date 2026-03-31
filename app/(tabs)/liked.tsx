import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { usePlayerContext } from '../../src/context/PlayerContext';
import { QueueList } from '../../src/components/QueueList';
import { MiniPlayer } from '../../src/components/MiniPlayer';
import { PageLayout } from '../../src/components/PageLayout';
import { useDebounce } from '../../src/hooks/useDebounce';

export default function LikedScreen() {
  const { tracks, currentIndex, theme, loadTrack, isFavorite } = usePlayerContext();
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);

  const likedTracks = React.useMemo(() => {
    return tracks.filter(t => isFavorite(t.id));
  }, [tracks, isFavorite]);

  const filteredTracks = React.useMemo(() => {
    if (!debouncedSearch) return likedTracks;
    const query = debouncedSearch.toLowerCase();
    return likedTracks.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.artist.toLowerCase().includes(query)
    );
  }, [likedTracks, debouncedSearch]);

  return (
    <PageLayout theme={theme}>
      <MiniPlayer />
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrap, { backgroundColor: theme.surface }]}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth={2.5}>
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Svg>
          <TextInput
            placeholder="Search liked songs..."
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
          currentIndex={-1} // Liked list index doesn't map 1:1 to queue index
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
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#121212',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 24,
    padding: 0,
  },
});
