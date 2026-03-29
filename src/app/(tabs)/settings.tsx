import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerContext } from '../../context/PlayerContext';
import { MiniPlayer } from '../../components/MiniPlayer';

const APP_VERSION = '1.0.0';
const GITHUB_URL = 'https://github.com/rajjitlaishram';

interface SectionProps {
  title: string;
  accent: string;
  children: React.ReactNode;
}

function Section({ title, accent, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>
      {children}
    </View>
  );
}

interface RowProps {
  label: string;
  value?: string;
  accent: string;
  muted: string;
  surface: string;
  onPress?: () => void;
  right?: React.ReactNode;
}

function Row({ label, value, accent, muted, surface, onPress, right }: RowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.row, { backgroundColor: surface }]}
    >
      <Text style={[styles.rowLabel, { color: '#f0f0f0' }]}>{label}</Text>
      {value ? (
        <Text style={[styles.rowValue, { color: muted }]}>{value}</Text>
      ) : right}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { theme } = usePlayerContext();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.07)' }]}>
        <Text style={[styles.headerTitle, { color: '#f0f0f0' }]}>Settings</Text>
      </View>

      <MiniPlayer />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* About */}
        <Section title="About" accent={theme.accent}>
          <Row
            label="App"
            value="Esei Tase"
            accent={theme.accent}
            muted={theme.muted}
            surface={theme.surface}
          />
          <Row
            label="Version"
            value={APP_VERSION}
            accent={theme.accent}
            muted={theme.muted}
            surface={theme.surface}
          />
          <Row
            label="Description"
            value="100% offline. No accounts. Just your music."
            accent={theme.accent}
            muted={theme.muted}
            surface={theme.surface}
          />
        </Section>

        {/* Developer */}
        <Section title="Developer" accent={theme.accent}>
          <Row
            label="Name"
            value="Rajjit Laishram"
            accent={theme.accent}
            muted={theme.muted}
            surface={theme.surface}
          />
          <Row
            label="GitHub"
            value="@rajjitlaishram →"
            accent={theme.accent}
            muted={theme.muted}
            surface={theme.surface}
            onPress={() => Linking.openURL(GITHUB_URL)}
          />
        </Section>

        {/* Preferences */}
        <Section title="Preferences" accent={theme.accent}>
          <Row
            label="Shuffle"
            accent={theme.accent}
            muted={theme.muted}
            surface={theme.surface}
            right={
              <Switch
                value={false}
                disabled
                thumbColor={theme.muted}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.accent }}
              />
            }
          />
          <Row
            label="Repeat"
            accent={theme.accent}
            muted={theme.muted}
            surface={theme.surface}
            right={
              <Switch
                value={false}
                disabled
                thumbColor={theme.muted}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.accent }}
              />
            }
          />
          <Row
            label="Theme Override"
            value="Coming soon"
            accent={theme.accent}
            muted={theme.muted}
            surface={theme.surface}
          />
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, gap: 24 },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 2,
  },
  rowLabel: { fontSize: 14, flex: 1 },
  rowValue: { fontSize: 13, flexShrink: 0, maxWidth: '55%', textAlign: 'right' },
});
