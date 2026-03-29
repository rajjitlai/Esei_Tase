import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ThemeColors } from '../types/Track';
import { usePlayerContext } from '../context/PlayerContext';

interface Props {
  theme: ThemeColors;
  children: React.ReactNode;
  paddingTop?: number;
}

export function PageLayout({ theme, children, paddingTop = 120 }: Props) {
  const { bgMode, customBgUri, bgOpacity } = usePlayerContext();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar style="light" />
      {bgMode === 'custom' && customBgUri ? (
        <View style={StyleSheet.absoluteFill}>
          <Image source={{ uri: customBgUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: bgOpacity }]} />
        </View>
      ) : (
        <LinearGradient 
          colors={[theme.accent, theme.bg, theme.bg]} 
          locations={[0.0, 0.45, 1.0]}
          style={[StyleSheet.absoluteFill, { opacity: 0.28 }]}
        />
      )}
      <View style={[styles.content, { paddingTop }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
