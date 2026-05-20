import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

type Helper = { user_id: string; first_name: string; last_name: string };

type Slot = {
  id: string;
  task: string;
  description: string | null;
  max_helpers: number;
  helper_count: number;
  is_signed_up: boolean;
  helpers: Helper[];
};

type HelperListDetail = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  club_id: string | null;
  club: { name: string } | null;
  slots: Slot[];
};

export default function HelperListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, canManageContent } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<HelperListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('helper_lists')
      .select('id, title, description, date, club_id, club:clubs(name), slots:helper_slots(id, task, description, max_helpers)')
      .eq('id', id)
      .single();

    if (!data) { setLoading(false); return; }

    const slotIds = data.slots?.map((s: any) => s.id) ?? [];

    const { data: regs } = await supabase
      .from('helper_registrations')
      .select('slot_id, user_id, profile:profiles(first_name, last_name)')
      .in('slot_id', slotIds);

    const helpersMap: Record<string, Helper[]> = {};
    regs?.forEach((r: any) => {
      if (!helpersMap[r.slot_id]) helpersMap[r.slot_id] = [];
      helpersMap[r.slot_id].push({ user_id: r.user_id, first_name: r.profile?.first_name ?? '', last_name: r.profile?.last_name ?? '' });
    });

    const myUserId = session?.user.id;

    setList({
      ...data,
      date: data.date ?? null,
      club_id: data.club_id ?? null,
      club: Array.isArray(data.club) ? data.club[0] ?? null : data.club,
      slots: (data.slots ?? []).map((s: any) => {
        const helpers = helpersMap[s.id] ?? [];
        return {
          ...s,
          helper_count: helpers.length,
          is_signed_up: helpers.some(h => h.user_id === myUserId),
          helpers,
        };
      }),
    });
    setLoading(false);
  }, [id, session]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (slot: Slot) => {
    if (!session) { Alert.alert('Anmelden', 'Bitte melde dich an um dich einzutragen.'); return; }
    setBusy(slot.id);
    if (slot.is_signed_up) {
      await supabase.from('helper_registrations').delete().eq('slot_id', slot.id).eq('user_id', session.user.id);
    } else {
      if (slot.helper_count >= slot.max_helpers) { Alert.alert('Voll', 'Dieser Slot ist bereits belegt.'); setBusy(null); return; }
      await supabase.from('helper_registrations').insert({ slot_id: slot.id, user_id: session.user.id });
    }
    await load();
    setBusy(null);
  };

  const canManage = list && canManageContent(list.club_id);

  const handleDelete = () => {
    Alert.alert('Löschen', 'Diese Helferliste wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        await supabase.from('helper_lists').delete().eq('id', id);
        router.back();
      }},
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Theme.colors.primary} size="large" /></View>;
  if (!list) return <View style={styles.center}><Text style={styles.error}>Nicht gefunden</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {list.club && <Text style={styles.club}>{list.club.name}</Text>}
      <Text style={styles.title}>{list.title}</Text>
      {list.date && (
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={15} color={Theme.colors.textMuted} />
          <Text style={styles.dateText}>
            {new Date(list.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
            {new Date(list.date).getHours() !== 0 && ` · ${new Date(list.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`}
          </Text>
        </View>
      )}
      {list.description && <Text style={styles.desc}>{list.description}</Text>}

      {canManage && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/helpers/edit?id=${id}`)}>
            <Ionicons name="pencil-outline" size={18} color={Theme.colors.primary} />
            <Text style={styles.editText}>Bearbeiten</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={Theme.colors.danger} />
            <Text style={styles.deleteText}>Löschen</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.slotsHeading}>Aufgaben</Text>

      {list.slots.map(slot => {
        const full = slot.helper_count >= slot.max_helpers && !slot.is_signed_up;
        return (
          <View key={slot.id} style={styles.slotCard}>
            <Text style={styles.slotTask}>{slot.task}</Text>
            {slot.description && <Text style={styles.slotDesc}>{slot.description}</Text>}
            <View style={styles.slotMeta}>
              <Ionicons name="people-outline" size={14} color={Theme.colors.textMuted} />
              <Text style={styles.slotCount}>{slot.helper_count} / {slot.max_helpers}</Text>
              {slot.is_signed_up && <View style={styles.signedBadge}><Text style={styles.signedText}>Eingetragen</Text></View>}
            </View>
            {slot.helpers.length > 0 && (
              <View style={styles.helpersList}>
                {slot.helpers.map(h => (
                  <View key={h.user_id} style={styles.helperRow}>
                    <Ionicons name="person-outline" size={13} color={Theme.colors.textSecondary} />
                    <Text style={styles.helperName}>{h.first_name} {h.last_name}</Text>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={[styles.btn, slot.is_signed_up && styles.btnOut, full && styles.btnFull]}
              onPress={() => toggle(slot)}
              disabled={busy === slot.id || full}
            >
              {busy === slot.id
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnText}>{full ? 'Voll' : slot.is_signed_up ? 'Austragen' : 'Eintragen'}</Text>}
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, gap: Theme.spacing.md, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  error: { color: Theme.colors.textSecondary },
  club: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, textTransform: 'uppercase' },
  title: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  desc: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, lineHeight: 22 },
  slotsHeading: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold, marginTop: Theme.spacing.sm },
  slotCard: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border, gap: 6 },
  slotTask: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  slotDesc: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm },
  slotMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slotCount: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  signedBadge: { backgroundColor: Theme.colors.primary + '33', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.radius.full },
  signedText: { color: Theme.colors.primary, fontSize: 11, fontWeight: Theme.font.weightBold },
  helpersList: { borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 6, gap: 4 },
  helperRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helperName: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm },
  actions: { flexDirection: 'row', gap: Theme.spacing.sm },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.primary },
  editText: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.danger },
  deleteText: { color: Theme.colors.danger, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  btn: { backgroundColor: Theme.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Theme.radius.md, minWidth: 80, alignItems: 'center' },
  btnOut: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Theme.colors.danger },
  btnFull: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border },
  btnText: { color: '#fff', fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
});
