import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { MusicWidget } from './MusicWidget';
import { WIDGET_KEYS, WIDGET_NAME } from './widget-constants';
import * as SecureStore from 'expo-secure-store';

export async function renderCurrentWidget() {
  try {
    const title = (await SecureStore.getItemAsync(WIDGET_KEYS.TITLE)) || 'Esei Tase';
    const artist = (await SecureStore.getItemAsync(WIDGET_KEYS.ARTIST)) || 'Ready to play';
    const isPlaying = (await SecureStore.getItemAsync(WIDGET_KEYS.IS_PLAYING)) === 'true';
    const artUri = (await SecureStore.getItemAsync(WIDGET_KEYS.ART_URI)) || '';

    requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: () => (
        <MusicWidget 
          title={title} 
          artist={artist} 
          isPlaying={isPlaying} 
          artUri={artUri} 
        />
      ),
    });
  } catch (e) {
    // Background task might fail if storage is busy
  }
}

export async function widgetTaskHandler(props: any) {
  const { clickAction } = props;

  if (clickAction) {
    await SecureStore.setItemAsync(WIDGET_KEYS.COMMAND, clickAction);
    await SecureStore.setItemAsync(WIDGET_KEYS.COMMAND_ID, String(Date.now()));
  }

  await renderCurrentWidget();
}
