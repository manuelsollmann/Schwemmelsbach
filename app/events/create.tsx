import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { sendPushNotification } from '@/lib/notifications';
import { Theme } from '@/constants/theme';
import { Club } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function CreateEventScreen() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [scope, setScope] = useState<'all' | 'village'>('all');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('clubs').select('id, name').order('name').then(({ data }) => setClubs(data ?? []));
  }, []);

  const save = async () => {
    if (!title.trim()) { Alert.alert('Fehler', 'Bitte einen Titel eingeben.'); return; }
    if (!date.trim()) { Alert.alert('Fehler', 'Bitte ein Datum eingeben (TT.MM.JJJJ).'); return; }
    if (!time.trim()) { Alert.alert('Fehler', 'Bitte eine Uhrzeit eingeben (HH:MM).'); return; }

    const [day, month, year] = date.split('.');
    const dateObj = new Date(`${year}-${month}-${day}T${time}:00`);
    if (isNaN(dateObj.getTime())) { Alert.alert('Fehler', 'Ungültiges Datum oder Uhrzeit.'); return; }

    setSaving(true);
    const { error } = await supabase.from('events').insert({
      title: title.trim(),
      description: description.trim() || null,
      date: dateObj.toISOString(),
      location: location.trim() || null,
      max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
      club_id: selectedClub,
      created_by: session!.user.id,
      gemeinde_id: profile?.gemeinde_id,
      village_id: scope === 'village' ? profile?.village_id : null,
    });
    setSaving(false);
    if (error) { Alert.alert('Fehler', error.message); return; }
    await sendPushNotification('Neue Veranstaltung', title.trim());
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Titel *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Name der Veranstaltung" placeholderTextColor={Theme.colors.textMuted} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Datum * <Text style={styles.hint}>TT.MM.JJJJ</Text></Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="19.07.2025" placeholderTextColor={Theme.colors.textMuted} keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ width: 100 }}>
            <Text style={styles.label}>Uhrzeit * <Text style={styles.hint}>HH:MM</Text></Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="15:00" placeholderTextColor={Theme.colors.textMuted} keyboardType="numbers-and-punctuation" />
          </View>
        </View>

        <Text style={styles.label}>Ort <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Dorfplatz, Turnhalle, ..." placeholderTextColor={Theme.colors.textMuted} />

        <Text style={styles.label}>Max. Teilnehmer <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput style={styles.input} value={maxAttendees} onChangeText={setMaxAttendees} placeholder="z.B. 100" placeholderTextColor={Theme.colors.textMuted} keyboardType="number-pad" />

        <Text style={styles.label}>Beschreibung <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Was erwartet die Besucher?"
          placeholderTextColor={Theme.colors.textMuted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Sichtbarkeit</Text>
        <View style={styles.clubRow}>
          <TouchableOpacity style={[styles.clubBtn, scope === 'all' && styles.clubBtnActive]} onPress={() => setScope('all')}>
            <Text style={[styles.clubBtnText, scope === 'all' && styles.clubBtnTextActive]}>Alle Gemeindeteile</Text>
          </TouchableOpacity>
          {profile?.village && (
            <TouchableOpacity style={[styles.clubBtn, scope === 'village' && styles.clubBtnActive]} onPress={() => setScope('village')}>
              <Text style={[styles.clubBtnText, scope === 'village' && styles.clubBtnTextActive]}>Nur {profile.village.name}</Text>
            </TouchableOpacity>
          )}
        </View>

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

        <TouchableOpacity style={styles.btn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Veranstaltung erstellen</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.lg, gap: Theme.spacing.sm, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: Theme.spacing.sm, alignItems: 'flex-start' },
  label: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, marginBottom: 6, marginTop: 8 },
  hint: { color: Theme.colors.textMuted, fontWeight: '400', fontSize: Theme.font.sizeSm },
  optional: { color: Theme.colors.textMuted, fontWeight: '400' },
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
