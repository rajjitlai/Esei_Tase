import { useState, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import packageJson from '../../package.json';

const GITHUB_API_URL = 'https://api.github.com/repos/rajjitlai/Esei_Tase/releases/latest';

export function useOTA() {
  const [checking, setChecking] = useState(false);

  const checkForUpdates = useCallback(async (manual = false) => {
    setChecking(true);
    try {
      const response = await fetch(GITHUB_API_URL);
      const data = await response.json();

      if (data.tag_name) {
        const latestVersion = data.tag_name.replace('v', '');
        const currentVersion = packageJson.version;

        if (latestVersion !== currentVersion) {
          Alert.alert(
            'Update Available',
            `A new version (${data.tag_name}) is available. Would you like to download it?`,
            [
              { text: 'Later', style: 'cancel' },
              { 
                text: 'Download', 
                onPress: () => Linking.openURL(data.html_url) 
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
