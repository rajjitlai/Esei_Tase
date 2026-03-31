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
  const isDragging = useSharedValue(false);
  const dragX = useSharedValue(0);

  const progress = duration > 0 ? position / duration : 0;
  
  // Update dragX when position changes naturally (if not dragging)
  useEffect(() => {
    if (!isDragging.value) {
      dragX.value = progress;
    }
  }, [progress]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      isDragging.value = true;
      const newPos = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
      dragX.value = newPos;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (e) => {
      const newPos = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
      dragX.value = newPos;
    },
    onPanResponderRelease: (e) => {
      const finalDim = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
      isDragging.value = false;
      onSeek(finalDim * duration);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
  });

  const animatedHandleStyle = useAnimatedStyle(() => ({
    left: dragX.value * barWidth,
    backgroundColor: '#ffffff',
    shadowColor: theme.accent,
  }));

  const animatedProgressProps = useAnimatedProps(() => ({
    width: dragX.value * barWidth,
  }));

  const [displayTime, setDisplayTime] = useState(fmt(position));

  // Sync the time label using a side effect to avoid stale values
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDragging.value) {
        setDisplayTime(fmt(dragX.value * duration));
      } else {
        setDisplayTime(fmt(position));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [position, duration]);

  return (
    <View style={styles.wrap}>
      <View style={styles.times}>
        <Text style={[styles.time, { color: theme.muted }]}>{displayTime}</Text>
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
          <AnimatedRect 
            x={0} y={9} height={2} rx={1}
            fill={theme.accent}
            animatedProps={animatedProgressProps}
          />
        </Svg>

        {/* Handle - SLEEK DOT */}
        <Animated.View style={[styles.handle, animatedHandleStyle]} />
      </View>
    </View>
  );
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

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
