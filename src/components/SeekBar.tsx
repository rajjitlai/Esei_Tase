import React, { useRef, useState } from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';
import { ThemeColors } from '../types/Track';

interface Props {
  position: number;
  duration: number;
  theme: ThemeColors;
  onSeek: (seconds: number) => void;
}

function fmt(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

export function SeekBar({ position, duration, theme, onSeek }: Props) {
  const barRef = useRef<View>(null);
  const [barWidth, setBarWidth] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState(0);

  const progress = duration > 0 ? position / duration : 0;
  const displayProgress = dragging ? dragPos : progress;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      setDragging(true);
      setDragPos(Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth)));
    },
    onPanResponderMove: (e) => {
      setDragPos(Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth)));
    },
    onPanResponderRelease: (e) => {
      const pos = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
      setDragging(false);
      onSeek(pos * duration);
    },
  });

  return (
    <View style={styles.wrap}>
      <View
        ref={barRef}
        style={styles.track}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.fill,
            { width: `${displayProgress * 100}%`, backgroundColor: theme.accent },
          ]}
        />
      </View>
      <View style={styles.times}>
        <Text style={[styles.time, { color: theme.muted }]}>{fmt(position)}</Text>
        <Text style={[styles.time, { color: theme.muted }]}>{fmt(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 360, marginBottom: 20 },
  track: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: 11 },
});
