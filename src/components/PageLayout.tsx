import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ThemeColors } from '../types/Track';

interface Props {
  theme: ThemeColors;
  children: React.ReactNode;
  paddingTop?: number;
}

export function PageLayout({ theme, children, paddingTop = 120 }: Props) {
  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar style="light" />
      <LinearGradient 
        colors={[theme.accent, theme.bg, theme.bg]} 
        locations={[0.0, 0.45, 1.0]}
        style={[StyleSheet.absoluteFill, { opacity: 0.28 }]}
      />
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
