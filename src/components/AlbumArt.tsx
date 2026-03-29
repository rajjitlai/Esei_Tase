import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import { ThemeColors } from '../types/Track';

interface Props {
  artUri: string | null;
  theme: ThemeColors;
  isPlaying: boolean;
}

export function AlbumArt({ artUri, theme, isPlaying }: Props) {
  return (
    <View style={styles.container}>
      {/* Glow behind the art */}
      <LinearGradient
        colors={[theme.glow, 'transparent']}
        style={[styles.glow, isPlaying && styles.glowActive]}
      />
      <View style={[styles.artWrap, isPlaying && { shadowColor: theme.accent, shadowRadius: 40, elevation: 20 }]}>
        {artUri ? (
          <Image source={{ uri: artUri }} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.surface }]}>
            <Svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.2}>
              <Circle cx={12} cy={12} r={10} />
              <Circle cx={12} cy={12} r={3} />
              <Line x1={12} y1={2} x2={12} y2={9} />
            </Svg>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.6,
  },
  glowActive: {
    opacity: 1,
  },
  artWrap: {
    width: 220,
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 12,
  },
  img: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
});
