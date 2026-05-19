import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function CreateClubScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { Alert.alert('Fehler', 'Bitte einen Namen eingeben.'); return; }
    setSaving(true);
    const { error } = await supabase.from('clubs').insert({
      name: name.trim(),
      description: description.trim() || null,
      created_by: session!.user.id,
    });
    setSaving(false);
    if (error) { Alert.alert('Fehler', error.message); return; }
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="z.B. Sportverein Schwemmelsbach"
          placeholderTextColor={Theme.colors.textMuted}
        />

        <Text style={styles.label}>Beschreibung <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Kurze Beschreibung des Vereins..."
          placeholderTextColor={Theme.colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.btn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verein anlegen</Text>}
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
  multiline: { minHeight: 120, paddingTop: 14 },
  btn: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: Theme.radius.lg, alignItems: 'center', marginTop: Theme.spacing.lg },
  btnText: { color: '#fff', fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
});
