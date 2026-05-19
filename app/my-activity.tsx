import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
  const [leaving, setLeaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    const [{ data: regs }, { data: helpers }] = await Promise.all([
      supabase.from('event_registrations')
        .select('event:events(id, title, date, location)')
        .eq('user_id', session.user.id)
        .order('registered_at', { ascending: false }),
      supabase.from('helper_registrations')
        .select('slot_id, slot:helper_slots(id, task, max_helpers, list:helper_lists(id, title, event:events(title, date), club:clubs(name)))')
        .eq('user_id', session.user.id),
    ]);
    setEvents(regs?.map(r => r.event).filter(Boolean) ?? []);
    setHelperSlots(helpers?.map(r => ({ ...r.slot, slot_id: r.slot_id })).filter(Boolean) ?? []);
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const leaveSlot = (slot: any) => {
    Alert.alert('Austragen', `Aus "${slot.task}" austragen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Austragen', style: 'destructive', onPress: async () => {
        setLeaving(slot.id);
        await supabase.from('helper_registrations').delete().eq('slot_id', slot.id).eq('user_id', session!.user.id);
        await load();
        setLeaving(null);
      }},
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Theme.colors.primary} size="large" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Helfereinsätze */}
      <View style={styles.sectionHeader}>
        <Ionicons name="hand-left-outline" size={20} color={Theme.colors.primary} />
        <Text style={styles.heading}>Meine Helfereinsätze</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{helperSlots.length}</Text></View>
      </View>

      {helperSlots.length === 0
        ? <View style={styles.emptyBox}>
            <Ionicons name="hand-left-outline" size={36} color={Theme.colors.textMuted} />
            <Text style={styles.emptyText}>Keine Helfereinsätze eingetragen</Text>
          </View>
        : helperSlots.map((s: any) => (
          <View key={s.id} style={styles.helperCard}>
            <View style={styles.helperTop}>
              <View style={styles.helperIcon}>
                <Ionicons name="hand-left-outline" size={20} color={Theme.colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.title}>{s.task}</Text>
                <Text style={styles.sub}>{s.list?.title}</Text>
                {s.list?.club && <Text style={styles.club}>{s.list.club.name}</Text>}
                {s.list?.event && (
                  <View style={styles.eventRow}>
                    <Ionicons name="calendar-outline" size={13} color={Theme.colors.textMuted} />
                    <Text style={styles.eventText}>
                      {s.list.event.title} · {new Date(s.list.event.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.helperBottom}>
              <TouchableOpacity style={styles.detailBtn} onPress={() => router.push(`/helpers/${s.list?.id}`)}>
                <Text style={styles.detailText}>Zur Liste</Text>
                <Ionicons name="chevron-forward" size={14} color={Theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.leaveBtn} onPress={() => leaveSlot(s)} disabled={leaving === s.id}>
                {leaving === s.id
                  ? <ActivityIndicator size="small" color={Theme.colors.danger} />
                  : <><Ionicons name="exit-outline" size={14} color={Theme.colors.danger} /><Text style={styles.leaveText}>Austragen</Text></>
                }
              </TouchableOpacity>
            </View>
          </View>
        ))
      }

      {/* Veranstaltungen */}
      <View style={[styles.sectionHeader, { marginTop: Theme.spacing.lg }]}>
        <Ionicons name="calendar-outline" size={20} color={Theme.colors.primary} />
        <Text style={styles.heading}>Meine Veranstaltungen</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{events.length}</Text></View>
      </View>

      {events.length === 0
        ? <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={36} color={Theme.colors.textMuted} />
            <Text style={styles.emptyText}>Keine Veranstaltungen angemeldet</Text>
          </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, gap: Theme.spacing.sm, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm, marginBottom: 4 },
  heading: { flex: 1, color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  badge: { backgroundColor: Theme.colors.primary, borderRadius: Theme.radius.full, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: Theme.font.weightBold },
  emptyBox: { alignItems: 'center', paddingVertical: Theme.spacing.xl, gap: 10, backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: Theme.colors.border },
  emptyText: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  helperCard: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: Theme.colors.border, overflow: 'hidden' },
  helperTop: { flexDirection: 'row', padding: Theme.spacing.md, gap: Theme.spacing.md },
  helperIcon: { width: 40, height: 40, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  helperBottom: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Theme.colors.border },
  detailBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 10, borderRightWidth: 1, borderRightColor: Theme.colors.border },
  detailText: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  leaveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 10 },
  leaveText: { color: Theme.colors.danger, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  info: { flex: 1, gap: 2 },
  title: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  sub: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm },
  club: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  eventText: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  dateBox: { backgroundColor: Theme.colors.primary, borderRadius: Theme.radius.md, width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  dateDay: { color: '#fff', fontSize: Theme.font.sizeLg, fontWeight: Theme.font.weightBold, lineHeight: 24 },
  dateMonth: { color: 'rgba(255,255,255,0.8)', fontSize: 10, textTransform: 'uppercase' },
});
