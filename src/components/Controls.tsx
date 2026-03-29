import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';
import { ThemeColors } from '../types/Track';

interface Props {
  isPlaying: boolean;
  theme: ThemeColors;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Controls({ isPlaying, theme, onToggle, onNext, onPrev }: Props) {
  return (
    <View style={styles.row}>
      {/* Prev */}
      <TouchableOpacity onPress={onPrev} style={styles.btn} activeOpacity={0.7}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill={theme.muted}>
          <Polygon points="19 20 9 12 19 4" />
          <Rect x={5} y={4} width={2} height={16} rx={1} />
        </Svg>
      </TouchableOpacity>

      {/* Play / Pause */}
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.playBtn, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
        activeOpacity={0.85}
      >
        {isPlaying ? (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="#000">
            <Rect x={6} y={4} width={4} height={16} rx={1} />
            <Rect x={14} y={4} width={4} height={16} rx={1} />
          </Svg>
        ) : (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="#000">
            <Polygon points="5 3 19 12 5 21" />
          </Svg>
        )}
      </TouchableOpacity>

      {/* Next */}
      <TouchableOpacity onPress={onNext} style={styles.btn} activeOpacity={0.7}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill={theme.muted}>
          <Polygon points="5 4 15 12 5 20" />
          <Rect x={17} y={4} width={2} height={16} rx={1} />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 20,
  },
  btn: {
    padding: 8,
    borderRadius: 50,
  },
  playBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
