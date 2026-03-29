import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../types/Track';

interface Props {
  title: string;
  subtitle: string;
  theme: ThemeColors;
}

export function TrackInfo({ title, subtitle, theme }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: theme.accent === '#1db954' ? '#f0f0f0' : '#f0f0f0' }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.sub, { color: theme.muted }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', marginBottom: 20, paddingHorizontal: 16 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  sub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
