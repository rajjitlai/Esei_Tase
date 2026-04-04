import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { MusicWidget } from './MusicWidget';
import { WIDGET_KEYS, WIDGET_NAME } from './widget-constants';
import { FAVORITES_KEY } from '../hooks/useFavorites';
import * as SecureStore from 'expo-secure-store';
import { Linking } from 'react-native';
import TrackPlayer, { State } from 'react-native-track-player';

async function syncWidgetFromTrackPlayer() {
  try {
    // Check if TrackPlayer is initialized
    let status;
    try {
      status = await TrackPlayer.getPlaybackState();
    } catch {
      return; // TrackPlayer not ready
    }

    if (!status) return;

    const active = await TrackPlayer.getActiveTrack();
    if (active) {
      await SecureStore.setItemAsync(WIDGET_KEYS.TITLE, (active as any).title || 'Esei Tase');
      await SecureStore.setItemAsync(WIDGET_KEYS.ARTIST, (active as any).artist || 'Ready to play');
      await SecureStore.setItemAsync(
        WIDGET_KEYS.ART_URI,
        ((active as any).artwork as string) || ''
      );
    }

    const playing = status.state === State.Playing || status.state === State.Buffering;
    await SecureStore.setItemAsync(WIDGET_KEYS.IS_PLAYING, String(playing));
  } catch {
    // TrackPlayer not ready or widget not available — silent
  }
}

export async function renderCurrentWidget() {
  try {
    // Skip if widget has no state yet (avoids forcing a render on fresh installs)
    const title = await SecureStore.getItemAsync(WIDGET_KEYS.TITLE);
    if (!title) return; // No track loaded yet, nothing to show

    const artist = (await SecureStore.getItemAsync(WIDGET_KEYS.ARTIST)) || '';
    const isPlaying = (await SecureStore.getItemAsync(WIDGET_KEYS.IS_PLAYING)) === 'true';
    const artUri = (await SecureStore.getItemAsync(WIDGET_KEYS.ART_URI)) || '';
    const isFavorite = (await SecureStore.getItemAsync(WIDGET_KEYS.IS_FAVORITE)) === 'true';

    requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: () => (
        <MusicWidget title={title} artist={artist} isPlaying={isPlaying} artUri={artUri} isFavorite={isFavorite} />
      ),
    });
  } catch (e) {
    // Native widget API not available or storage busy
  }
}

export async function widgetTaskHandler(props: any) {
  const { clickAction } = props;

  if (clickAction) {
    try {
      let shouldSync = true;
      // Direct Background Control (single source of execution for widget actions)
      if (clickAction === 'OPEN_APP') {
        Linking.openURL('esei-tase://');
        shouldSync = false;
      } else if (clickAction === 'PLAY' || clickAction === 'PAUSE') {
        const { state } = await TrackPlayer.getPlaybackState();
        if (state === State.Playing) {
          await TrackPlayer.pause();
        } else {
          await TrackPlayer.play();
        }
      } else if (clickAction === 'NEXT') {
        await TrackPlayer.skipToNext();
        await TrackPlayer.play();
      } else if (clickAction === 'PREV') {
        await TrackPlayer.skipToPrevious();
        await TrackPlayer.play();
      } else if (clickAction === 'LIKE') {
        const trackId = await SecureStore.getItemAsync(WIDGET_KEYS.CURRENT_TRACK_ID);
        if (trackId) {
          const favsJson = await SecureStore.getItemAsync(FAVORITES_KEY);
          const favs: string[] = favsJson ? JSON.parse(favsJson) : [];
          const isFav = favs.includes(trackId);
          const newFavs = isFav ? favs.filter(id => id !== trackId) : [...favs, trackId];
          await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(newFavs));
          await SecureStore.setItemAsync(WIDGET_KEYS.IS_FAVORITE, String(!isFav));
        }
      }
      if (shouldSync) {
        await syncWidgetFromTrackPlayer();
        await renderCurrentWidget();
      }
    } catch (e) {
      // Handle cases where engine isn't ready
    }
  }

  await syncWidgetFromTrackPlayer();
  await renderCurrentWidget();
}
