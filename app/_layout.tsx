import { Stack } from 'expo-router';
import { AppRegistry } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import TrackPlayer from 'react-native-track-player';
import { widgetTaskHandler, renderCurrentWidget } from '../src/widgets/widget-task';
import { setWidgetUpdater } from '../src/widgets/widget-logic';
import { PlaybackService } from '../src/service';

// Inject the update logic to break the circular dependency
setWidgetUpdater(() => {
  renderCurrentWidget();
});

// Use a global to ensure registration only happens once even if the module is re-evaluated
if (!(global as any).__REGISTERED__) {
  (global as any).__REGISTERED__ = true;
  // Register widget task for clicks
  registerWidgetTaskHandler(widgetTaskHandler);

  // Fix the "No task registered for key RNWidgetBackgroundTask" warning
  AppRegistry.registerHeadlessTask('RNWidgetBackgroundTask', () => widgetTaskHandler);

  // Register Audio background service
  TrackPlayer.registerPlaybackService(() => PlaybackService);
}

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
