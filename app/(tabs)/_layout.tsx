import React from 'react';
import { Tabs } from 'expo-router';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { PlayerProvider, usePlayerContext } from '../../src/context/PlayerContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

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
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

function ThemedTabs() {
  const { theme } = usePlayerContext();
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: 'rgba(255,255,255,0.07)',
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.muted,
          tabBarLabelStyle: { fontSize: 11, letterSpacing: 0.4 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="queue"
          options={{
            title: 'Queue',
            tabBarIcon: ({ color }) => <TabBarIcon name="queue" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <ThemedTabs />
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
