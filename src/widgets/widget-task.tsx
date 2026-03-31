import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { MusicWidget } from './MusicWidget';
import { WIDGET_KEYS, WIDGET_NAME } from './widget-constants';
import * as SecureStore from 'expo-secure-store';
import { Linking } from 'react-native';
import TrackPlayer, { State } from 'react-native-track-player';

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
    try {
      // Direct Background Control
      if (clickAction === 'OPEN_APP') {
        Linking.openURL('esei-tase://');
      } else if (clickAction === 'PLAY' || clickAction === 'PAUSE') {
        const { state } = await TrackPlayer.getPlaybackState();
        if (state === State.Playing) {
          await TrackPlayer.pause();
          await SecureStore.setItemAsync(WIDGET_KEYS.IS_PLAYING, 'false');
        } else {
          await TrackPlayer.play();
          await SecureStore.setItemAsync(WIDGET_KEYS.IS_PLAYING, 'true');
        }
      } else if (clickAction === 'NEXT') {
        await TrackPlayer.skipToNext();
        await TrackPlayer.play();
      } else if (clickAction === 'PREV') {
        await TrackPlayer.skipToPrevious();
        await TrackPlayer.play();
      }

      // Still sync command for the main App UI if it happens to be open
      await SecureStore.setItemAsync(WIDGET_KEYS.COMMAND, clickAction);
      await SecureStore.setItemAsync(WIDGET_KEYS.COMMAND_ID, String(Date.now()));
    } catch (e) {
      // Handle cases where engine isn't ready
    }
  }

  await renderCurrentWidget();
}
