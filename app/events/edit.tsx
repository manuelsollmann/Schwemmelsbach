import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Club } from '@/types';

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('clubs').select('id, name').order('name'),
    ]).then(([{ data: event }, { data: clubData }]) => {
      if (event) {
        const d = new Date(event.date);
        setTitle(event.title);
        setDescription(event.description ?? '');
        setDate(`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`);
        setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
        setLocation(event.location ?? '');
        setMaxAttendees(event.max_attendees ? String(event.max_attendees) : '');
        setSelectedClub(event.club_id);
      }
      setClubs(clubData ?? []);
      setLoading(false);
    });
  }, [id]);

  const save = async () => {
    if (!title.trim()) { Alert.alert('Fehler', 'Bitte einen Titel eingeben.'); return; }
    const [day, month, year] = date.split('.');
    const dateObj = new Date(`${year}-${month}-${day}T${time}:00`);
    if (isNaN(dateObj.getTime())) { Alert.alert('Fehler', 'Ungültiges Datum oder Uhrzeit.'); return; }
    setSaving(true);
    const { error } = await supabase.from('events').update({
      title: title.trim(),
      description: description.trim() || null,
      date: dateObj.toISOString(),
      location: location.trim() || null,
      max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
      club_id: selectedClub,
    }).eq('id', id);
    setSaving(false);
    if (error) { Alert.alert('Fehler', error.message); return; }
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
            <Text style={styles.label}>Uhrzeit *</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" placeholderTextColor={Theme.colors.textMuted} />
          </View>
        </View>

        <Text style={styles.label}>Ort</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholderTextColor={Theme.colors.textMuted} />

        <Text style={styles.label}>Max. Teilnehmer</Text>
        <TextInput style={styles.input} value={maxAttendees} onChangeText={setMaxAttendees} keyboardType="number-pad" placeholderTextColor={Theme.colors.textMuted} />

        <Text style={styles.label}>Beschreibung</Text>
        <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline numberOfLines={5} textAlignVertical="top" placeholderTextColor={Theme.colors.textMuted} />

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
  multiline: { minHeight: 120, paddingTop: 14 },
  clubRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clubBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface },
  clubBtnActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  clubBtnText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm },
  clubBtnTextActive: { color: '#fff', fontWeight: Theme.font.weightBold },
  btn: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: Theme.radius.lg, alignItems: 'center', marginTop: Theme.spacing.lg },
  btnText: { color: '#fff', fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
});
