import TrackPlayer from 'react-native-track-player';
import { Stack } from 'expo-router';
import { PlaybackService } from '../src/service';

TrackPlayer.registerPlaybackService(() => PlaybackService);

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
