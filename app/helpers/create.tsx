import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Club } from '@/types';
import { useAuth } from '@/context/AuthContext';

type Slot = { task: string; maxHelpers: string };

export default function CreateHelperListScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [slots, setSlots] = useState<Slot[]>([{ task: '', maxHelpers: '1' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('clubs').select('id, name').order('name').then(({ data }) => setClubs(data ?? []));
  }, []);

  const addSlot = () => setSlots(s => [...s, { task: '', maxHelpers: '1' }]);
  const removeSlot = (i: number) => setSlots(s => s.filter((_, idx) => idx !== i));
  const updateSlot = (i: number, field: keyof Slot, value: string) =>
    setSlots(s => s.map((slot, idx) => idx === i ? { ...slot, [field]: value } : slot));

  const save = async () => {
    if (!title.trim()) { Alert.alert('Fehler', 'Bitte einen Titel eingeben.'); return; }
    const validSlots = slots.filter(s => s.task.trim());
    if (validSlots.length === 0) { Alert.alert('Fehler', 'Bitte mindestens eine Aufgabe eingeben.'); return; }

    setSaving(true);
    const { data: list, error } = await supabase.from('helper_lists').insert({
      title: title.trim(),
      description: description.trim() || null,
      club_id: selectedClub,
      created_by: session!.user.id,
    }).select().single();

    if (error || !list) { setSaving(false); Alert.alert('Fehler', error?.message ?? 'Unbekannter Fehler'); return; }

    const { error: slotsError } = await supabase.from('helper_slots').insert(
      validSlots.map(s => ({
        list_id: list.id,
        task: s.task.trim(),
        max_helpers: parseInt(s.maxHelpers) || 1,
      }))
    );

    setSaving(false);
    if (slotsError) { Alert.alert('Fehler', slotsError.message); return; }
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Titel *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="z.B. Aufbauhelfer Sommerfest" placeholderTextColor={Theme.colors.textMuted} />

        <Text style={styles.label}>Beschreibung <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Weitere Informationen..."
          placeholderTextColor={Theme.colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Verein <Text style={styles.optional}>(optional)</Text></Text>
        <View style={styles.clubRow}>
          <TouchableOpacity style={[styles.clubBtn, !selectedClub && styles.clubBtnActive]} onPress={() => setSelectedClub(null)}>
            <Text style={[styles.clubBtnText, !selectedClub && styles.clubBtnTextActive]}>Keiner</Text>
          </TouchableOpacity>
          {clubs.map(c => (
            <TouchableOpacity key={c.id} style={[styles.clubBtn, selectedClub === c.id && styles.clubBtnActive]} onPress={() => setSelectedClub(c.id)}>
              <Text style={[styles.clubBtnText, selectedClub === c.id && styles.clubBtnTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.slotsHeader}>
          <Text style={styles.slotsTitle}>Aufgaben</Text>
          <TouchableOpacity onPress={addSlot} style={styles.addSlotBtn}>
            <Ionicons name="add-circle-outline" size={20} color={Theme.colors.primary} />
            <Text style={styles.addSlotText}>Hinzufügen</Text>
          </TouchableOpacity>
        </View>

        {slots.map((slot, i) => (
          <View key={i} style={styles.slotRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={slot.task}
              onChangeText={v => updateSlot(i, 'task', v)}
              placeholder="Aufgabe beschreiben..."
              placeholderTextColor={Theme.colors.textMuted}
            />
            <View style={styles.slotMeta}>
              <Text style={styles.slotMetaLabel}>Max</Text>
              <TextInput
                style={[styles.input, styles.maxInput]}
                value={slot.maxHelpers}
                onChangeText={v => updateSlot(i, 'maxHelpers', v)}
                keyboardType="number-pad"
              />
            </View>
            {slots.length > 1 && (
              <TouchableOpacity onPress={() => removeSlot(i)} style={styles.removeBtn}>
                <Ionicons name="remove-circle-outline" size={22} color={Theme.colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Helferliste erstellen</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.lg, gap: Theme.spacing.sm, paddingBottom: 40 },
  label: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, marginBottom: 6, marginTop: 8 },
  optional: { color: Theme.colors.textMuted, fontWeight: '400' },
  input: { backgroundColor: Theme.colors.surface, color: Theme.colors.textPrimary, borderRadius: Theme.radius.md, padding: 14, fontSize: Theme.font.sizeMd, borderWidth: 1, borderColor: Theme.colors.border },
  multiline: { minHeight: 90, paddingTop: 14 },
  clubRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clubBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface },
  clubBtnActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  clubBtnText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm },
  clubBtnTextActive: { color: '#fff', fontWeight: Theme.font.weightBold },
  slotsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Theme.spacing.md },
  slotsTitle: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  addSlotBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addSlotText: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slotMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slotMetaLabel: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  maxInput: { width: 52, textAlign: 'center', padding: 10 },
  removeBtn: { padding: 4 },
  btn: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: Theme.radius.lg, alignItems: 'center', marginTop: Theme.spacing.lg },
  btnText: { color: '#fff', fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
});
