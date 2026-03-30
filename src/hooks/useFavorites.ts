import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const FAVORITES_KEY = 'esei_tase_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites on mount
  useEffect(() => {
    async function load() {
      try {
        const saved = await SecureStore.getItemAsync(FAVORITES_KEY);
        if (saved) {
          setFavorites(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
    load();
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(id);
      const next = isFav ? prev.filter((f) => f !== id) : [...prev, id];
      
      // Save to storage
      SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(next)).catch(e => {
        console.error('Failed to save favorites', e);
      });
      
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
