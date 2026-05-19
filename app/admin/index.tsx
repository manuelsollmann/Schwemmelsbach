import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';

type Stats = { users: number; news: number; events: number; clubs: number };

export default function AdminScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ count: users }, { count: news }, { count: events }, { count: clubs }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('clubs').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ users: users ?? 0, news: news ?? 0, events: events ?? 0, clubs: clubs ?? 0 });
    };
    load();
  }, []);

  const items = [
    { icon: 'people-outline' as const, label: 'Nutzer verwalten', sub: 'Rollen zuweisen', route: '/admin/users' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Übersicht</Text>

      {stats ? (
        <View style={styles.statsGrid}>
          {[
            { label: 'Nutzer', value: stats.users, icon: 'people-outline' as const },
            { label: 'News', value: stats.news, icon: 'newspaper-outline' as const },
            { label: 'Events', value: stats.events, icon: 'calendar-outline' as const },
            { label: 'Vereine', value: stats.clubs, icon: 'shield-outline' as const },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon} size={22} color={Theme.colors.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      ) : (
        <ActivityIndicator color={Theme.colors.primary} style={{ marginVertical: 20 }} />
      )}

      <Text style={styles.heading}>Verwaltung</Text>
      <View style={styles.section}>
        {items.map(item => (
          <TouchableOpacity key={item.route} style={styles.menuItem} onPress={() => router.push(item.route as any)}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={22} color={Theme.colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, gap: Theme.spacing.md, paddingBottom: 40 },
  heading: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Theme.colors.border },
  statValue: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold },
  statLabel: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  section: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: Theme.colors.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  menuIcon: { width: 40, height: 40, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  menuInfo: { flex: 1 },
  menuLabel: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  menuSub: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm, marginTop: 2 },
});
