import { Stack } from 'expo-router';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler, renderCurrentWidget } from '../src/widgets/widget-task';
import { setWidgetUpdater } from '../src/widgets/widget-logic';

// Register widget task at the very top of the entry point
registerWidgetTaskHandler(widgetTaskHandler);

// Inject the update logic to break the circular dependency
setWidgetUpdater(() => {
  renderCurrentWidget();
});

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
