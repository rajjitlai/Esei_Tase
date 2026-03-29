import { useEffect, useState } from 'react';
import { ThemeColors } from '../types/Track';
import { DEFAULT_THEME } from '../constants/theme';

/** Convert HSL to hex color string (#rrggbb) — Android only supports hex/rgb/rgba */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const x = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * x).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Parse hex color from react-native-image-colors result to [h, s, l] */
function hexToHsl(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m || m.length < 3) return null;
  let r = parseInt(m[0], 16) / 255;
  let g = parseInt(m[1], 16) / 255;
  let b = parseInt(m[2], 16) / 255;
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
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/** rgba string safe for Android native views */
function rgba(r: number, g: number, b: number, a: number) {
  return `rgba(${r},${g},${b},${a})`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m || m.length < 3) return null;
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}

function deriveTheme(hex: string): ThemeColors {
  const hsl = hexToHsl(hex);
  if (!hsl) return DEFAULT_THEME;
  const [h, s] = hsl;
  const sat = Math.max(s, 55);

  const accent = hslToHex(h, sat, 55);
  const bg = hslToHex(h, Math.round(s * 0.22), 7);
  const surface = hslToHex(h, Math.round(s * 0.18), 12);
  const muted = hslToHex(h, 12, 52);

  // glow as rgba (hex accent with transparency)
  const accentRgb = hexToRgb(accent);
  const glow = accentRgb ? rgba(accentRgb[0], accentRgb[1], accentRgb[2], 0.2) : 'rgba(29,185,84,0.2)';

  return { accent, bg, surface, muted, glow };
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
        // Dynamic import — degrades gracefully in Expo Go if native module absent
        const ImageColors = await import('react-native-image-colors')
          .then((m) => m.default)
          .catch(() => null);

        if (!ImageColors || cancelled) return;

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

        setTheme(deriveTheme(hex));
      } catch {
        if (!cancelled) setTheme(DEFAULT_THEME);
      }
    })();

    return () => { cancelled = true; };
  }, [artUri]);

  return theme;
}
