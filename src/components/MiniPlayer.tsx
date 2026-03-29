import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';
import { usePlayerContext } from '../context/PlayerContext';

export function MiniPlayer() {
  const { tracks, currentIndex, isPlaying, togglePlay, theme } = usePlayerContext();
  if (currentIndex < 0 || !tracks.length) return null;

  const track = tracks[currentIndex];

  return (
    <View style={[styles.bar, { backgroundColor: theme.surface, borderTopColor: 'rgba(255,255,255,0.08)' }]}>
      {track.artUri ? (
        <Image source={{ uri: track.artUri }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: theme.accent + '30', alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: theme.accent, fontSize: 18 }}>♪</Text>
        </View>
      )}
      <Text style={[styles.title, { color: '#f0f0f0' }]} numberOfLines={1}>
        {track.title}
      </Text>
      <TouchableOpacity onPress={togglePlay} style={styles.btn} activeOpacity={0.7}>
        {isPlaying ? (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill={theme.accent}>
            <Rect x={6} y={4} width={4} height={16} rx={1} />
            <Rect x={14} y={4} width={4} height={16} rx={1} />
          </Svg>
        ) : (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill={theme.accent}>
            <Polygon points="5 3 19 12 5 21" />
          </Svg>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 12,
  },
  thumb: { width: 40, height: 40, borderRadius: 6 },
  title: { flex: 1, fontSize: 13, fontWeight: '500' },
  btn: { padding: 6 },
});
