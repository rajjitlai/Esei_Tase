import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import MetadataRetriever from '@missingcore/react-native-metadata-retriever';
import { Track } from '../types/Track';

export function useMediaLibrary() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    loadTracks();
  }, []);

  async function loadTracks() {
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

    const initialTracks: Track[] = allAssets.map((a) => ({
      id: a.id,
      title: a.filename.replace(/\.[^.]+$/, ''),
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
            const metadata = await MetadataRetriever.getMetadata(track.uri);
            if (metadata.picture) {
              const artUri = `data:${metadata.picture.pictureType};base64,${metadata.picture.data}`;
              // Optimistically update the single track in-place to avoid massive re-renders
              track.artUri = artUri;
            }
            if (metadata.title) {
              track.title = metadata.title;
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

  return { tracks, setTracks, loading, permissionDenied, reload: loadTracks };
}
