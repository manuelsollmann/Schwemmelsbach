import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Club } from '@/types';

type ExistingSlot = { id: string; task: string; maxHelpers: string };
type NewSlot = { task: string; maxHelpers: string };

export default function EditHelperListScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [existingSlots, setExistingSlots] = useState<ExistingSlot[]>([]);
  const [newSlots, setNewSlots] = useState<NewSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('helper_lists').select('*, slots:helper_slots(id, task, max_helpers)').eq('id', id).single(),
      supabase.from('clubs').select('id, name').order('name'),
    ]).then(([{ data: list }, { data: clubData }]) => {
      if (list) {
        setTitle(list.title);
        setDescription(list.description ?? '');
        setSelectedClub(list.club_id);
        if (list.date) {
          const d = new Date(list.date);
          setDate(`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`);
          setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
        }
        setExistingSlots((list.slots ?? []).map((s: any) => ({ id: s.id, task: s.task, maxHelpers: String(s.max_helpers) })));
      }
      setClubs(clubData ?? []);
      setLoading(false);
    });
  }, [id]);

  const addNewSlot = () => setNewSlots(s => [...s, { task: '', maxHelpers: '1' }]);
  const removeNewSlot = (i: number) => setNewSlots(s => s.filter((_, idx) => idx !== i));
  const updateNewSlot = (i: number, field: keyof NewSlot, value: string) =>
    setNewSlots(s => s.map((slot, idx) => idx === i ? { ...slot, [field]: value } : slot));
  const updateExistingSlot = (i: number, field: keyof Omit<ExistingSlot, 'id'>, value: string) =>
    setExistingSlots(s => s.map((slot, idx) => idx === i ? { ...slot, [field]: value } : slot));

  const removeExistingSlot = (slot: ExistingSlot) => {
    Alert.alert('Aufgabe löschen', `"${slot.task}" wirklich löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        await supabase.from('helper_slots').delete().eq('id', slot.id);
        setExistingSlots(s => s.filter(x => x.id !== slot.id));
      }},
    ]);
  };

  const save = async () => {
    if (!title.trim()) { Alert.alert('Fehler', 'Bitte einen Titel eingeben.'); return; }
    if (!date.trim()) { Alert.alert('Fehler', 'Bitte ein Datum eingeben.'); return; }

    const [day, month, year] = date.split('.');
    const dateObj = new Date(`${year}-${month}-${day}T${time || '00:00'}:00`);
    if (isNaN(dateObj.getTime())) { Alert.alert('Fehler', 'Ungültiges Datum.'); return; }

    setSaving(true);

    const { error: listError } = await supabase.from('helper_lists').update({
      title: title.trim(),
      description: description.trim() || null,
      date: dateObj.toISOString(),
      club_id: selectedClub,
    }).eq('id', id);

    if (listError) { setSaving(false); Alert.alert('Fehler', listError.message); return; }

    for (const slot of existingSlots) {
      await supabase.from('helper_slots').update({
        task: slot.task.trim(),
        max_helpers: parseInt(slot.maxHelpers) || 1,
      }).eq('id', slot.id);
    }

    const validNew = newSlots.filter(s => s.task.trim());
    if (validNew.length > 0) {
      await supabase.from('helper_slots').insert(
        validNew.map(s => ({ list_id: id, task: s.task.trim(), max_helpers: parseInt(s.maxHelpers) || 1 }))
      );
    }

    setSaving(false);
    router.back();
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Theme.colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Titel *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor={Theme.colors.textMuted} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Datum * <Text style={styles.hint}>TT.MM.JJJJ</Text></Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" placeholderTextColor={Theme.colors.textMuted} />
          </View>
          <View style={{ width: 100 }}>
            <Text style={styles.label}>Uhrzeit</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="08:00" keyboardType="numbers-and-punctuation" placeholderTextColor={Theme.colors.textMuted} />
          </View>
        </View>

        <Text style={styles.label}>Beschreibung</Text>
        <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline numberOfLines={3} textAlignVertical="top" placeholderTextColor={Theme.colors.textMuted} />

        <Text style={styles.label}>Verein</Text>
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
          <Text style={styles.slotsTitle}>Bestehende Aufgaben</Text>
        </View>

        {existingSlots.map((slot, i) => (
          <View key={slot.id} style={styles.slotRow}>
            <TextInput style={[styles.input, { flex: 1 }]} value={slot.task} onChangeText={v => updateExistingSlot(i, 'task', v)} placeholderTextColor={Theme.colors.textMuted} />
            <View style={styles.slotMeta}>
              <Text style={styles.slotMetaLabel}>Max</Text>
              <TextInput style={[styles.input, styles.maxInput]} value={slot.maxHelpers} onChangeText={v => updateExistingSlot(i, 'maxHelpers', v)} keyboardType="number-pad" />
            </View>
            <TouchableOpacity onPress={() => removeExistingSlot(slot)} style={styles.removeBtn}>
              <Ionicons name="remove-circle-outline" size={22} color={Theme.colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.slotsHeader}>
          <Text style={styles.slotsTitle}>Neue Aufgaben</Text>
          <TouchableOpacity onPress={addNewSlot} style={styles.addSlotBtn}>
            <Ionicons name="add-circle-outline" size={20} color={Theme.colors.primary} />
            <Text style={styles.addSlotText}>Hinzufügen</Text>
          </TouchableOpacity>
        </View>

        {newSlots.map((slot, i) => (
          <View key={i} style={styles.slotRow}>
            <TextInput style={[styles.input, { flex: 1 }]} value={slot.task} onChangeText={v => updateNewSlot(i, 'task', v)} placeholder="Aufgabe beschreiben..." placeholderTextColor={Theme.colors.textMuted} />
            <View style={styles.slotMeta}>
              <Text style={styles.slotMetaLabel}>Max</Text>
              <TextInput style={[styles.input, styles.maxInput]} value={slot.maxHelpers} onChangeText={v => updateNewSlot(i, 'maxHelpers', v)} keyboardType="number-pad" />
            </View>
            <TouchableOpacity onPress={() => removeNewSlot(i)} style={styles.removeBtn}>
              <Ionicons name="remove-circle-outline" size={22} color={Theme.colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Speichern</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.lg, gap: Theme.spacing.sm, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  row: { flexDirection: 'row', gap: Theme.spacing.sm },
  label: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, marginBottom: 6, marginTop: 8 },
  hint: { color: Theme.colors.textMuted, fontWeight: '400' },
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
