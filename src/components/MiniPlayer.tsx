import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Polygon, Rect, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { usePlayerContext } from '../context/PlayerContext';

export function MiniPlayer() {
  const { tracks, currentIndex, isPlaying, togglePlay, theme, isFavorite, toggleFavorite } = usePlayerContext();
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
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={[styles.title, { color: '#f0f0f0' }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={{ fontSize: 11, color: theme.muted }} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          toggleFavorite(track.id);
        }} 
        style={styles.btn}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill={isFavorite(track.id) ? theme.accent : 'none'} stroke={isFavorite(track.id) ? theme.accent : theme.muted} strokeWidth={2}>
          <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </Svg>
      </TouchableOpacity>

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
