import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { sendPushNotification } from '@/lib/notifications';
import { Theme } from '@/constants/theme';
import { Club } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function CreateNewsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('clubs').select('id, name').order('name').then(({ data }) => setClubs(data ?? []));
  }, []);

  const save = async () => {
    if (!title.trim()) { Alert.alert('Fehler', 'Bitte einen Titel eingeben.'); return; }
    if (!content.trim()) { Alert.alert('Fehler', 'Bitte einen Text eingeben.'); return; }
    setSaving(true);
    const { error } = await supabase.from('news').insert({
      title: title.trim(),
      content: content.trim(),
      club_id: selectedClub,
      author_id: session!.user.id,
    });
    setSaving(false);
    if (error) { Alert.alert('Fehler', error.message); return; }
    await sendPushNotification('Neue Neuigkeit', title.trim());
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Titel *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Überschrift der Neuigkeit"
          placeholderTextColor={Theme.colors.textMuted}
        />

        <Text style={styles.label}>Text *</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={content}
          onChangeText={setContent}
          placeholder="Was gibt es zu berichten?"
          placeholderTextColor={Theme.colors.textMuted}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Verein <Text style={styles.optional}>(optional)</Text></Text>
        <View style={styles.clubRow}>
          <TouchableOpacity
            style={[styles.clubBtn, !selectedClub && styles.clubBtnActive]}
            onPress={() => setSelectedClub(null)}
          >
            <Text style={[styles.clubBtnText, !selectedClub && styles.clubBtnTextActive]}>Keiner</Text>
          </TouchableOpacity>
          {clubs.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.clubBtn, selectedClub === c.id && styles.clubBtnActive]}
              onPress={() => setSelectedClub(c.id)}
            >
              <Text style={[styles.clubBtnText, selectedClub === c.id && styles.clubBtnTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Veröffentlichen</Text>}
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
  multiline: { minHeight: 160, paddingTop: 14 },
  clubRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clubBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface },
  clubBtnActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  clubBtnText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm },
  clubBtnTextActive: { color: '#fff', fontWeight: Theme.font.weightBold },
  btn: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: Theme.radius.lg, alignItems: 'center', marginTop: Theme.spacing.lg },
  btnText: { color: '#fff', fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
});
