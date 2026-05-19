import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

type Slot = {
  id: string;
  task: string;
  description: string | null;
  max_helpers: number;
  helper_count: number;
  is_signed_up: boolean;
};

type HelperListDetail = {
  id: string;
  title: string;
  description: string | null;
  club: { name: string } | null;
  slots: Slot[];
};

export default function HelperListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [list, setList] = useState<HelperListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('helper_lists')
      .select('id, title, description, club:clubs(name), slots:helper_slots(id, task, description, max_helpers)')
      .eq('id', id)
      .single();

    if (!data) { setLoading(false); return; }

    const slotIds = data.slots?.map((s: any) => s.id) ?? [];

    const [{ data: counts }, { data: myRegs }] = await Promise.all([
      supabase.from('helper_registrations').select('slot_id').in('slot_id', slotIds),
      session
        ? supabase.from('helper_registrations').select('slot_id').eq('user_id', session.user.id).in('slot_id', slotIds)
        : Promise.resolve({ data: [] }),
    ]);

    const countMap: Record<string, number> = {};
    counts?.forEach((r: any) => { countMap[r.slot_id] = (countMap[r.slot_id] ?? 0) + 1; });
    const mySet = new Set(myRegs?.map((r: any) => r.slot_id) ?? []);

    setList({
      ...data,
      club: Array.isArray(data.club) ? data.club[0] ?? null : data.club,
      slots: (data.slots ?? []).map((s: any) => ({
        ...s,
        helper_count: countMap[s.id] ?? 0,
        is_signed_up: mySet.has(s.id),
      })),
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

  if (loading) return <View style={styles.center}><ActivityIndicator color={Theme.colors.primary} size="large" /></View>;
  if (!list) return <View style={styles.center}><Text style={styles.error}>Nicht gefunden</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {list.club && <Text style={styles.club}>{list.club.name}</Text>}
      <Text style={styles.title}>{list.title}</Text>
      {list.description && <Text style={styles.desc}>{list.description}</Text>}

      <Text style={styles.slotsHeading}>Aufgaben</Text>

      {list.slots.map(slot => {
        const full = slot.helper_count >= slot.max_helpers && !slot.is_signed_up;
        return (
          <View key={slot.id} style={styles.slotCard}>
            <View style={styles.slotInfo}>
              <Text style={styles.slotTask}>{slot.task}</Text>
              {slot.description && <Text style={styles.slotDesc}>{slot.description}</Text>}
              <View style={styles.slotMeta}>
                <Ionicons name="people-outline" size={14} color={Theme.colors.textMuted} />
                <Text style={styles.slotCount}>{slot.helper_count} / {slot.max_helpers}</Text>
                {slot.is_signed_up && <View style={styles.signedBadge}><Text style={styles.signedText}>Eingetragen</Text></View>}
              </View>
            </View>
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
  desc: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, lineHeight: 22 },
  slotsHeading: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold, marginTop: Theme.spacing.sm },
  slotCard: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  slotInfo: { flex: 1, gap: 4 },
  slotTask: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  slotDesc: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm },
  slotMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slotCount: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  signedBadge: { backgroundColor: Theme.colors.primary + '33', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.radius.full },
  signedText: { color: Theme.colors.primary, fontSize: 11, fontWeight: Theme.font.weightBold },
  btn: { backgroundColor: Theme.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Theme.radius.md, minWidth: 80, alignItems: 'center' },
  btnOut: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Theme.colors.danger },
  btnFull: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border },
  btnText: { color: '#fff', fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
});
