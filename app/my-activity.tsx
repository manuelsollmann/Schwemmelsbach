import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function MyActivityScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [helperSlots, setHelperSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const [{ data: regs }, { data: helpers }] = await Promise.all([
        supabase.from('event_registrations')
          .select('event:events(id, title, date, location)')
          .eq('user_id', session.user.id)
          .order('registered_at', { ascending: false }),
        supabase.from('helper_registrations')
          .select('slot:helper_slots(id, task, list:helper_lists(id, title, club:clubs(name)))')
          .eq('user_id', session.user.id),
      ]);
      setEvents(regs?.map(r => r.event).filter(Boolean) ?? []);
      setHelperSlots(helpers?.map(r => r.slot).filter(Boolean) ?? []);
      setLoading(false);
    };
    load();
  }, [session]);

  if (loading) return <View style={styles.center}><ActivityIndicator color={Theme.colors.primary} size="large" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Meine Veranstaltungen</Text>
      {events.length === 0
        ? <Text style={styles.empty}>Keine Anmeldungen vorhanden</Text>
        : events.map((e: any) => (
          <TouchableOpacity key={e.id} style={styles.card} onPress={() => router.push(`/events/${e.id}`)}>
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>{new Date(e.date).getDate()}</Text>
              <Text style={styles.dateMonth}>{new Date(e.date).toLocaleDateString('de-DE', { month: 'short' })}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{e.title}</Text>
              {e.location && <Text style={styles.sub}>{e.location}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        ))
      }

      <Text style={[styles.heading, { marginTop: Theme.spacing.lg }]}>Meine Helfereinsätze</Text>
      {helperSlots.length === 0
        ? <Text style={styles.empty}>Keine Helfereinsätze vorhanden</Text>
        : helperSlots.map((s: any) => (
          <TouchableOpacity key={s.id} style={styles.card} onPress={() => router.push(`/helpers/${s.list?.id}`)}>
            <View style={styles.helperIcon}>
              <Ionicons name="hand-left-outline" size={22} color={Theme.colors.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{s.task}</Text>
              <Text style={styles.sub}>{s.list?.title}{s.list?.club ? ` · ${s.list.club.name}` : ''}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, gap: Theme.spacing.sm, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  heading: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold, marginBottom: 4 },
  empty: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm, paddingVertical: Theme.spacing.sm },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  dateBox: { backgroundColor: Theme.colors.primary, borderRadius: Theme.radius.md, width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  dateDay: { color: '#fff', fontSize: Theme.font.sizeLg, fontWeight: Theme.font.weightBold, lineHeight: 24 },
  dateMonth: { color: 'rgba(255,255,255,0.8)', fontSize: 10, textTransform: 'uppercase' },
  helperIcon: { width: 44, height: 44, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  sub: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm, marginTop: 2 },
});
