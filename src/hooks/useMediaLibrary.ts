import React, { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as MetadataRetriever from '@missingcore/react-native-metadata-retriever';
import * as SecureStore from 'expo-secure-store';
import { Track } from '../types/Track';

const MIN_DURATION_KEY = 'esei_tase_min_duration';
const DEFAULT_MIN_DURATION = 30; // seconds

export function useMediaLibrary() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const [minDuration, setMinDuration] = useState(DEFAULT_MIN_DURATION);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const saved = await SecureStore.getItemAsync(MIN_DURATION_KEY);
      if (saved !== null) {
        setMinDuration(parseInt(saved, 10));
      }
    } catch (e) {
      console.error('Failed to load minDuration setting', e);
    }
  }

  async function updateMinDuration(seconds: number) {
    setMinDuration(seconds);
    await SecureStore.setItemAsync(MIN_DURATION_KEY, seconds.toString());
    loadTracks(seconds); // Reload with new threshold
  }

  useEffect(() => {
    loadTracks(minDuration);
  }, []);

  async function loadTracks(threshold = minDuration) {
    setLoading(true);
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }

    let allAssets: MediaLibrary.Asset[] = [];
    let cursor: string | undefined;

    do {
      const page = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 500,
        after: cursor,
      });
      allAssets = [...allAssets, ...page.assets];
      cursor = page.hasNextPage ? page.endCursor : undefined;
    } while (cursor);

    allAssets = allAssets.filter(a => a.duration >= threshold);
    
    const initialTracks: Track[] = allAssets.map((a) => ({
      id: a.id,
      title: a.filename.replace(/\.[^.]+$/, ''),
      artist: 'Unknown Artist',
      filename: a.filename,
      uri: a.uri,
      duration: a.duration,
      artUri: null, // populated below
    }));

    // Perform an initial render with the basic list so UI feels fast
    setTracks([...initialTracks]);
    setLoading(false);

    // Now progressively load metadata for all tracks in parallel chunks
    const chunkSize = 20;
    for (let i = 0; i < initialTracks.length; i += chunkSize) {
      const chunk = initialTracks.slice(i, i + chunkSize);
      
      await Promise.all(
        chunk.map(async (track) => {
          try {
            const metadata = await MetadataRetriever.getMetadata(track.uri, MetadataRetriever.MetadataPresets.standardArtwork);
            const artBase64 = await MetadataRetriever.getArtwork(track.uri);
            
            if (artBase64) {
              track.artUri = artBase64;
            }
            if (metadata.title) {
              track.title = metadata.title;
            }
            if (metadata.artist) {
              track.artist = metadata.artist;
            }
          } catch (e) {
            // Ignore corrupted ID3 tags quietly
          }
        })
      );

      // Trigger a state update after each chunk finishes so UI updates progressively
      setTracks((prev) => [...prev]);
    }
  }

  return { 
    tracks, 
    setTracks, 
    loading, 
    permissionDenied, 
    reload: () => loadTracks(minDuration),
    minDuration,
    updateMinDuration 
  };
}
