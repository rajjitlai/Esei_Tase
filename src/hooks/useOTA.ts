import { useState, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import packageJson from '../../package.json';

const GITHUB_API_URL = 'https://api.github.com/repos/rajjitlai/Esei_Tase/releases/latest';

function parseVersion(v: string): number[] | null {
  const cleaned = v.trim().replace(/^v/i, '').split('-')[0];
  const parts = cleaned.split('.');
  if (!parts.length) return null;
  const nums = parts.map((p) => {
    const n = Number.parseInt(p.replace(/[^0-9].*$/, ''), 10);
    return Number.isFinite(n) ? n : 0;
  });
  return nums;
}

function compareVersions(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  if (!va || !vb) return a === b ? 0 : a > b ? 1 : -1;
  const len = Math.max(va.length, vb.length);
  for (let i = 0; i < len; i++) {
    const da = va[i] ?? 0;
    const db = vb[i] ?? 0;
    if (da !== db) return da > db ? 1 : -1;
  }
  return 0;
}

export function useOTA() {
  const [checking, setChecking] = useState(false);

  const checkForUpdates = useCallback(async (manual = false) => {
    setChecking(true);
    try {
      const response = await fetch(GITHUB_API_URL);
      const data = await response.json();

      if (data.tag_name) {
        const latestVersion = String(data.tag_name);
        const currentVersion = packageJson.version;

        if (compareVersions(latestVersion, currentVersion) > 0) {
          Alert.alert(
            'Update Available',
            `A new version (${data.tag_name}) is available. Would you like to download it?`,
            [
              { text: 'Later', style: 'cancel' },
              {
                text: 'Download',
                onPress: () => Linking.openURL(data.html_url),
              },
            ]
          );
        } else if (manual) {
          Alert.alert('No Updates', 'You are already on the latest version.');
        }
      }
    } catch (error) {
      console.error('Update check failed:', error);
      if (manual) {
        Alert.alert('Error', 'Failed to check for updates. Please try again later.');
      }
    } finally {
      setChecking(false);
    }
  }, []);

  return { checkForUpdates, checking };
}
