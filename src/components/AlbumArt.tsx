import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { 
  SharedValue,
  useSharedValue, 
  useAnimatedProps, 
  useAnimatedStyle,
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing, 
  cancelAnimation 
} from 'react-native-reanimated';
import { ThemeColors } from '../types/Track';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  artUri: string | null;
  theme: ThemeColors;
  isPlaying: boolean;
}

export function AlbumArt({ artUri, theme, isPlaying }: Props) {
  const p1 = useSharedValue(0);
  const breath = useSharedValue(1);
  const w1 = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      p1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 450, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );
      
      breath.value = withRepeat(
        withTiming(1.04, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      
      w1.value = withRepeat(withTiming(2 * Math.PI, { duration: 2500, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(p1);
      cancelAnimation(breath);
      p1.value = withTiming(0, { duration: 800 });
      breath.value = withTiming(1, { duration: 1200 });
      
      // Gentle shimmer when paused
      w1.value = withRepeat(withTiming(2 * Math.PI, { duration: 15000, easing: Easing.linear }), -1, false);
    }
  }, [isPlaying]);

  const useWave = (radius: number, freq: number, phase: SharedValue<number>, ampMult: number) => {
    return useAnimatedProps(() => {
      const points = 120;
      const amp = (isPlaying ? 12 * p1.value + 4 : 4) * ampMult;
      
      let path = '';
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const r = radius + Math.sin(angle * freq + phase.value) * amp;
        const x = 180 + r * Math.cos(angle);
        const y = 180 + r * Math.sin(angle);
        path += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
      }
      return { d: path };
    });
  };

  const wp1 = useWave(120, 8, w1, 1.0);

  const animatedArtStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
  }));

  return (
    <View style={styles.superContainer}>
      <View style={styles.visualizerWrap}>
        <Svg width={360} height={360} viewBox="0 0 360 360">
          <AnimatedPath
            fill="none"
            stroke={theme.accent}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.8}
            animatedProps={wp1}
          />
        </Svg>
      </View>

      <Animated.View style={[styles.artWrap, animatedArtStyle]}>
        {artUri ? (
          <Image
            source={{ uri: artUri }}
            style={styles.artwork}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  superContainer: {
    width: 360,
    height: 360,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 40,
  },
  visualizerWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  artWrap: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    zIndex: 5,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
  },
});
