import React, { useCallback } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Track, ThemeColors } from '../types/Track';

interface Props {
  tracks: Track[];
  currentIndex: number;
  theme: ThemeColors;
  onSelect: (index: number) => void;
  onDelete?: (id: string) => void;
}

function fmt(s: number): string {
  if (!s || isNaN(s)) return '--:--';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function QueueItem({
  track,
  index,
  isActive,
  theme,
  onSelect,
  onDelete,
}: {
  track: Track;
  index: number;
  isActive: boolean;
  theme: ThemeColors;
  onSelect: () => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      style={[styles.row, isActive && { backgroundColor: 'rgba(255,255,255,0.07)' }]}
    >
      <Text style={[styles.num, { color: isActive ? theme.accent : theme.muted }]}>
        {index + 1}
      </Text>
      <Text
        style={[styles.name, { color: '#f0f0f0', fontWeight: isActive ? '600' : '400' }]}
        numberOfLines={1}
      >
        {track.title}
      </Text>
      <Text style={[styles.dur, { color: theme.muted }]}>{fmt(track.duration)}</Text>
      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(track.id)}
          style={styles.deleteBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export function QueueList({ tracks, currentIndex, theme, onSelect }: Props) {
  const renderItem = useCallback(
    ({ item, index }: { item: Track; index: number }) => (
      <QueueItem
        track={item}
        index={index}
        isActive={index === currentIndex}
        theme={theme}
        onSelect={() => onSelect(index)}
        onDelete={onDelete}
      />
    ),
    [currentIndex, theme, onSelect]
  );

  if (!tracks.length) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.muted }]}>
          {'No tracks loaded.\nGrant media permission to continue.'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tracks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      getItemLayout={(_, index) => ({ length: 48, offset: 48 * index, index })}
      initialScrollIndex={currentIndex >= 0 ? currentIndex : 0}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    height: 48,
  },
  num: { fontSize: 11, width: 22, textAlign: 'right', flexShrink: 0 },
  name: { flex: 1, fontSize: 13, overflow: 'hidden' },
  dur: { fontSize: 11, flexShrink: 0 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 22 },
  deleteBtn: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,0,0,0.2)',
  },
  deleteText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
