import React, { useRef, useState, useEffect } from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedProps,
  withTiming, 
  withRepeat,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';
import Svg, { Path, Defs, Mask, Rect, Line, LinearGradient, Stop } from 'react-native-svg';
import { ThemeColors } from '../types/Track';
import { usePlayerContext } from '../context/PlayerContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  const { isPlaying } = usePlayerContext();
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (e) => {
      const newPos = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
      if (Math.abs(newPos - dragPos) > 0.01) {
        Haptics.selectionAsync();
        setDragPos(newPos);
      }
    },
    onPanResponderRelease: (e) => {
      const pos = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
      setDragging(false);
      onSeek(pos * duration);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.times}>
        <Text style={[styles.time, { color: '#ffffff' }]}>{fmt(position)}</Text>
        <Text style={[styles.time, { color: theme.muted }]}>{fmt(duration)}</Text>
      </View>
      <View
        ref={barRef}
        style={styles.trackWrap}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <Svg width={barWidth} height={20} style={styles.svg}>
          {/* Background Track */}
          <Rect 
            x={0} y={9} width={barWidth} height={2} rx={1}
            fill="rgba(255,255,255,0.12)"
          />
          {/* Active Progress */}
          <Rect 
            x={0} y={9} width={displayProgress * barWidth} height={2} rx={1}
            fill={theme.accent}
          />
        </Svg>

        {/* Handle - SLEEK DOT */}
        <View style={[styles.handle, { 
          left: displayProgress * barWidth,
          backgroundColor: '#ffffff',
          shadowColor: theme.accent,
        }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 360, marginBottom: 28 },
  trackWrap: {
    height: 20,
    justifyContent: 'center',
    marginTop: 8,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  svg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  handle: {
    position: 'absolute',
    top: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
    zIndex: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  times: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  time: { 
    fontSize: 12, 
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
});
