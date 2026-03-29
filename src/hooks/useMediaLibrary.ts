import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
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
        sortBy: [MediaLibrary.SortBy.filename],
      });
      allAssets = [...allAssets, ...page.assets];
      cursor = page.hasNextPage ? page.endCursor : undefined;
    } while (cursor);

    const mapped: Track[] = allAssets.map((a) => ({
      id: a.id,
      title: a.filename.replace(/\.[^.]+$/, ''),
      filename: a.filename,
      uri: a.uri,
      duration: a.duration,
      artUri: null, // populated later by metadata retriever
    }));

    setTracks(mapped);
    setLoading(false);
  }

  return { tracks, setTracks, loading, permissionDenied, reload: loadTracks };
}
