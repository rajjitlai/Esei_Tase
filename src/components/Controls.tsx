import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Polygon, Rect, Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { ThemeColors } from '../types/Track';

function LiquidIcon({ isActive, children }: { isActive: boolean, children: React.ReactNode }) {
  const glow = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      glow.value = withTiming(1, { duration: 400 });
    }
  }, [isActive]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: glow.value }],
    opacity: isActive ? 1 : 0.6,
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

interface Props {
  isPlaying: boolean;
  theme: ThemeColors;
  shuffle: boolean;
  repeat: boolean;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export function Controls({ 
  isPlaying, theme, shuffle, repeat, 
  onToggle, onNext, onPrev, onToggleShuffle, onToggleRepeat 
}: Props) {
  return (
    <View style={styles.row}>
      {/* Shuffle */}
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggleShuffle();
        }} 
        style={styles.prefBtn}
        activeOpacity={0.6}
      >
        <LiquidIcon isActive={shuffle}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={shuffle ? theme.accent : theme.muted} strokeWidth={shuffle ? 3 : 2.5}>
            <Path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
          </Svg>
        </LiquidIcon>
      </TouchableOpacity>

      {/* Prev */}
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPrev();
        }} 
        style={styles.navBtn} 
        activeOpacity={0.7}
      >
        <Svg width={32} height={32} viewBox="0 0 24 24" fill={theme.muted}>
          <Polygon points="19 20 9 12 19 4" />
          <Rect x={5} y={4} width={2} height={16} rx={1} />
        </Svg>
      </TouchableOpacity>

      {/* Play / Pause */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onToggle();
        }}
        style={[styles.playBtn, { backgroundColor: theme.accent }]}
        activeOpacity={0.85}
      >
        {isPlaying ? (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="#000">
            <Rect x={6} y={4} width={4} height={16} rx={1} />
            <Rect x={14} y={4} width={4} height={16} rx={1} />
          </Svg>
        ) : (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="#000">
            <Polygon points="5 3 19 12 5 21" />
          </Svg>
        )}
      </TouchableOpacity>

      {/* Next */}
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onNext();
        }} 
        style={styles.navBtn} 
        activeOpacity={0.7}
      >
        <Svg width={32} height={32} viewBox="0 0 24 24" fill={theme.muted}>
          <Polygon points="5 4 15 12 5 20" />
          <Rect x={17} y={4} width={2} height={16} rx={1} />
        </Svg>
      </TouchableOpacity>

      {/* Repeat */}
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggleRepeat();
        }} 
        style={styles.prefBtn}
        activeOpacity={0.6}
      >
        <LiquidIcon isActive={repeat}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={repeat ? theme.accent : theme.muted} strokeWidth={repeat ? 3 : 2.5}>
            <Path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
          </Svg>
        </LiquidIcon>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    paddingVertical: 10,
  },
  navBtn: {
    padding: 6,
    borderRadius: 50,
  },
  prefBtn: {
    padding: 10,
    borderRadius: 50,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
