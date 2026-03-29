import { useEffect, useState } from 'react';
import ImageColors from 'react-native-image-colors';
import { ThemeColors } from '../types/Track';
import { DEFAULT_THEME } from '../constants/theme';

function hslStr(h: number, s: number, l: number) {
  return `hsl(${Math.round(h)},${Math.round(s * 100)}%,${Math.round(l * 100)}%)`;
}

function rgb2hsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), s, l];
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m || m.length < 3) return null;
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}

export function useAlbumColor(artUri: string | null): ThemeColors {
  const [theme, setTheme] = useState<ThemeColors>(DEFAULT_THEME);

  useEffect(() => {
    if (!artUri) {
      setTheme(DEFAULT_THEME);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const result = await ImageColors.getColors(artUri, {
          fallback: '#1db954',
          cache: true,
          key: artUri,
        });
        if (cancelled) return;

        let hex = '#1db954';
        if (result.platform === 'android') {
          hex = result.vibrant ?? result.dominant ?? '#1db954';
        } else if (result.platform === 'ios') {
          hex = result.primary ?? result.background ?? '#1db954';
        } else if (result.platform === 'web') {
          hex = result.vibrant ?? '#1db954';
        }

        const rgb = hexToRgb(hex);
        if (!rgb) { setTheme(DEFAULT_THEME); return; }
        const [h, s] = rgb2hsl(...rgb);
        const sat = Math.max(s, 0.55);

        setTheme({
          accent: hslStr(h, sat, 0.55),
          bg: hslStr(h, s * 0.22, 0.07),
          surface: hslStr(h, s * 0.18, 0.12),
          muted: hslStr(h, 0.12, 0.52),
          glow: `hsla(${Math.round(h)},${Math.round(sat * 100)}%,50%,0.2)`,
        });
      } catch {
        if (!cancelled) setTheme(DEFAULT_THEME);
      }
    })();
    return () => { cancelled = true; };
  }, [artUri]);

  return theme;
}
