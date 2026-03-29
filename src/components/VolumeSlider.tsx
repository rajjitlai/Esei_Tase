import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Polygon, Path } from 'react-native-svg';
import { ThemeColors } from '../types/Track';

interface Props {
  volume: number;
  theme: ThemeColors;
  onVolumeChange: (v: number) => void;
}

export function VolumeSlider({ volume, theme, onVolumeChange }: Props) {
  return (
    <View style={styles.row}>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.muted} strokeWidth={2}>
        <Polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <Path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </Svg>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        onValueChange={onVolumeChange}
        minimumTrackTintColor={theme.accent}
        maximumTrackTintColor="rgba(255,255,255,0.12)"
        thumbTintColor={theme.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slider: { width: 120, height: 20 },
});
