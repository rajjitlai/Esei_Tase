export interface Track {
  id: string;
  title: string;
  artist: string;
  filename: string;
  uri: string;
  duration: number; // seconds
  artUri: string | null;
}

export interface ThemeColors {
  accent: string;
  bg: string;
  surface: string;
  muted: string;
  glow: string;
}
