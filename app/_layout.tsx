import { Stack } from 'expo-router';
import { AppRegistry } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import TrackPlayer from 'react-native-track-player';
import { widgetTaskHandler, renderCurrentWidget } from '../src/widgets/widget-task';
import { setWidgetUpdater } from '../src/widgets/widget-logic';
import { PlaybackService } from '../src/service';
import { ErrorBoundary } from '../src/error/ErrorBoundary';

// Inject the update logic to break the circular dependency
setWidgetUpdater(() => {
  renderCurrentWidget();
});

// Use a global to ensure registration only happens once even if the module is re-evaluated
if (!(global as any).__REGISTERED__) {
  (global as any).__REGISTERED__ = true;

  // Guard widget registration — native module may not be linked in all builds
  try {
    if (typeof registerWidgetTaskHandler === 'function') {
      registerWidgetTaskHandler(widgetTaskHandler);
      AppRegistry.registerHeadlessTask('RNWidgetBackgroundTask', () => widgetTaskHandler);
    }
  } catch (e) {
    console.warn('[Widget] Registration skipped:', e);
  }

  // Guard TrackPlayer service registration
  try {
    if (TrackPlayer.registerPlaybackService) {
      TrackPlayer.registerPlaybackService(() => PlaybackService);
    }
  } catch (e) {
    console.warn('[TrackPlayer] Service registration skipped:', e);
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ErrorBoundary>
  );
}
