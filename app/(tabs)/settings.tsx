import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerContext } from '../../src/context/PlayerContext';
import { MiniPlayer } from '../../src/components/MiniPlayer';

import { PageLayout } from '../../src/components/PageLayout';

const APP_VERSION = '1.0.0';
const GITHUB_URL = 'https://github.com/rajjitlai';

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value, muted, surface, onPress, right }: {
  label: string; value?: string; muted: string; surface: string; onPress?: () => void; right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} style={[styles.row, { backgroundColor: surface }]}>
      <Text style={[styles.rowLabel, { color: '#f0f0f0' }]}>{label}</Text>
      {value ? <Text style={[styles.rowValue, { color: muted }]}>{value}</Text> : right}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { theme, shuffle, repeat, toggleShuffle, toggleRepeat } = usePlayerContext();

  return (
    <PageLayout theme={theme}>
      <MiniPlayer />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ... rest of content */}

        <Section title="About" accent={theme.accent}>
          <Row label="App" value="Esei Tase" muted={theme.muted} surface={theme.surface} />
          <Row label="Version" value={APP_VERSION} muted={theme.muted} surface={theme.surface} />
        </Section>

        <Section title="Developer" accent={theme.accent}>
          <Row label="Name" value="Rajjit Laishram" muted={theme.muted} surface={theme.surface} />
          <Row
            label="GitHub"
            value="@rajjitlai"
            muted={theme.muted}
            surface={theme.surface}
            onPress={() => Linking.openURL(GITHUB_URL)}
          />
        </Section>

        <Section title="Preferences" accent={theme.accent}>
          <Row label="Shuffle" muted={theme.muted} surface={theme.surface}
            right={<Switch value={shuffle} onValueChange={toggleShuffle} thumbColor={shuffle ? theme.accent : theme.muted} trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.accent + '80' }} />}
          />
          <Row label="Repeat" muted={theme.muted} surface={theme.surface}
            right={<Switch value={repeat} onValueChange={toggleRepeat} thumbColor={repeat ? theme.accent : theme.muted} trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.accent + '80' }} />}
          />
          <Row label="Media Notifications" muted={theme.muted} surface={theme.surface}
            right={<Switch value={true} trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.accent + '80' }} />}
          />
        </Section>

      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, gap: 24 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 13, borderRadius: 10, marginBottom: 2 },
  rowLabel: { fontSize: 14, flex: 1 },
  rowValue: { fontSize: 13, flexShrink: 0, maxWidth: '55%', textAlign: 'right' },
});
