import React, { useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
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

function Particle({ theme, initialPos }: { theme: ThemeColors, initialPos: { x: number, y: number } }) {
  const x = useSharedValue(initialPos.x);
  const y = useSharedValue(initialPos.y);
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    x.value = withRepeat(
      withSequence(
        withTiming(initialPos.x + 40, { duration: 15000 + Math.random() * 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming(initialPos.x, { duration: 15000 + Math.random() * 5000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    y.value = withRepeat(
      withSequence(
        withTiming(initialPos.y - 30, { duration: 12000 + Math.random() * 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(initialPos.y, { duration: 12000 + Math.random() * 8000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 4000 + Math.random() * 2000 }),
        withTiming(0.1, { duration: 4000 + Math.random() * 2000 })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value,
    top: y.value,
    opacity: opacity.value,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.accent,
    zIndex: 0,
  }));

  return <Animated.View style={style} />;
}

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
  artUri: string | null;
  theme: ThemeColors;
  isPlaying: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function AlbumArt({ artUri, theme, isPlaying, isFavorite, onToggleFavorite }: Props) {
  const p1 = useSharedValue(0);
  const breath = useSharedValue(1);
  const w1 = useSharedValue(0);
  
  // Transition effects
  const spin = useSharedValue(0);
  const transitPulse = useSharedValue(1);

  // Triggered on track change
  useEffect(() => {
    if (artUri) {
      spin.value = 0;
      spin.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
      
      transitPulse.value = withSequence(
        withTiming(1.12, { duration: 200, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.in(Easing.ease) })
      );
    }
  }, [artUri]);

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
      
      w1.value = 0;
      w1.value = withRepeat(withTiming(2 * Math.PI, { duration: 2500, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(p1);
      cancelAnimation(breath);
      p1.value = withTiming(0, { duration: 800 });
      breath.value = withTiming(1, { duration: 1200 });
      w1.value = 0;
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
    transform: [
      { scale: breath.value * transitPulse.value },
      { rotate: `${spin.value * 360}deg` }
    ],
  }));

  return (
    <View style={styles.superContainer}>
      <Particle theme={theme} initialPos={{ x: 40, y: 80 }} />
      <Particle theme={theme} initialPos={{ x: 280, y: 50 }} />
      <Particle theme={theme} initialPos={{ x: 100, y: 280 }} />
      <Particle theme={theme} initialPos={{ x: 300, y: 240 }} />
      <Particle theme={theme} initialPos={{ x: 50, y: 180 }} />
      <Particle theme={theme} initialPos={{ x: 200, y: 300 }} />

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
          <Image source={{ uri: artUri }} style={styles.artwork} />
        ) : (
          <View style={styles.placeholder} />
        )}
        
        <View style={styles.favoriteOverlay}>
          <TouchableOpacity 
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onToggleFavorite();
            }} 
            style={styles.favBtn}
            activeOpacity={0.6}
          >
            <LiquidIcon isActive={isFavorite}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill={isFavorite ? theme.accent : 'rgba(0,0,0,0.3)'} stroke={isFavorite ? theme.accent : 'rgba(255,255,255,0.8)'} strokeWidth={2.5}>
                <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </Svg>
            </LiquidIcon>
          </TouchableOpacity>
        </View>
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
  favoriteOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  favBtn: {
    padding: 20,
    borderRadius: 50,
  },
});
