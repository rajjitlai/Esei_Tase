import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { PlayerProvider, usePlayerContext } from '../../src/context/PlayerContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon({ name, color }: { name: string; color: string }) {
  if (name === 'home') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
        <Circle cx={12} cy={12} r={10} />
        <Circle cx={12} cy={12} r={3} />
        <Line x1={12} y1={2} x2={12} y2={9} stroke={color} strokeWidth={2} />
      </Svg>
    );
  }
  if (name === 'queue') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
        <Line x1={8} y1={6} x2={21} y2={6} stroke={color} strokeWidth={2} />
        <Line x1={8} y1={12} x2={21} y2={12} stroke={color} strokeWidth={2} />
        <Line x1={8} y1={18} x2={21} y2={18} stroke={color} strokeWidth={2} />
        <Line x1={3} y1={6} x2={3.01} y2={6} stroke={color} strokeWidth={2} />
        <Line x1={3} y1={12} x2={3.01} y2={12} stroke={color} strokeWidth={2} />
        <Line x1={3} y1={18} x2={3.01} y2={18} stroke={color} strokeWidth={2} />
      </Svg>
    );
  }
  if (name === 'liked') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill={color === 'transparent' ? 'none' : 'none'} stroke={color} strokeWidth={2}>
        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

function ThemedTabs() {
  const { theme } = usePlayerContext();
  const insets = useSafeAreaInsets();
  
  return (
    <ThemeProvider value={DarkTheme}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarBackground: () => (
            <BlurView intensity={65} style={StyleSheet.absoluteFill} tint="dark" />
          ),
          tabBarStyle: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
            borderTopWidth: 0,
            height: 60 + insets.top,
            paddingTop: insets.top,
            zIndex: 1000,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}>
                <TabBarIcon name="home" color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="queue"
          options={{
            title: 'Queue',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}>
                <TabBarIcon name="queue" color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="liked"
          options={{
            title: 'Liked',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}>
                <TabBarIcon name="liked" color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}>
                <TabBarIcon name="settings" color={color} />
              </View>
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    paddingBottom: 4,
    paddingHorizontal: 12,
  }
});

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <ThemedTabs />
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
