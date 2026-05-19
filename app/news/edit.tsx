import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Club } from '@/types';

export default function EditNewsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('news').select('*').eq('id', id).single(),
      supabase.from('clubs').select('id, name').order('name'),
    ]).then(([{ data: post }, { data: clubData }]) => {
      if (post) { setTitle(post.title); setContent(post.content); setSelectedClub(post.club_id); }
      setClubs(clubData ?? []);
      setLoading(false);
    });
  }, [id]);

  const save = async () => {
    if (!title.trim()) { Alert.alert('Fehler', 'Bitte einen Titel eingeben.'); return; }
    setSaving(true);
    const { error } = await supabase.from('news').update({
      title: title.trim(),
      content: content.trim(),
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

        <Text style={styles.label}>Text *</Text>
        <TextInput style={[styles.input, styles.multiline]} value={content} onChangeText={setContent} multiline numberOfLines={8} textAlignVertical="top" placeholderTextColor={Theme.colors.textMuted} />

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
  label: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, marginBottom: 6, marginTop: 8 },
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
