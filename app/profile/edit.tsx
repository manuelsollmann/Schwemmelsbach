import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { useAuth, WASSERLOSEN_GEMEINDE_ID } from '@/context/AuthContext';
import { Village } from '@/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [selectedVillage, setSelectedVillage] = useState<string | null>(profile?.village_id ?? null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('villages')
      .select('*')
      .eq('gemeinde_id', WASSERLOSEN_GEMEINDE_ID)
      .order('name')
      .then(({ data }) => setVillages(data ?? []));
  }, []);

  const save = async () => {
    if (!firstName.trim()) { Alert.alert('Fehler', 'Bitte Vornamen eingeben.'); return; }
    if (!lastName.trim()) { Alert.alert('Fehler', 'Bitte Nachnamen eingeben.'); return; }
    if (!selectedVillage) { Alert.alert('Fehler', 'Bitte einen Ortsteil auswählen.'); return; }
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      phone: phone.trim() || null,
      village_id: selectedVillage,
    }).eq('id', profile!.id);
    setSaving(false);
    if (error) { Alert.alert('Fehler', error.message); return; }
    await refreshProfile();
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Text style={styles.label}>Vorname *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Max"
              placeholderTextColor={Theme.colors.textMuted}
              autoCorrect={false}
            />
          </View>
          <View style={styles.nameField}>
            <Text style={styles.label}>Nachname *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Mustermann"
              placeholderTextColor={Theme.colors.textMuted}
              autoCorrect={false}
            />
          </View>
        </View>

        <Text style={styles.label}>Ortsteil *</Text>
        <View style={styles.villageGrid}>
          {villages.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[styles.villageBtn, selectedVillage === v.id && styles.villageBtnActive]}
              onPress={() => setSelectedVillage(v.id)}
            >
              <Text style={[styles.villageBtnText, selectedVillage === v.id && styles.villageBtnTextActive]}>
                {v.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Handynummer <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+49 151 12345678"
          placeholderTextColor={Theme.colors.textMuted}
        />

        <Text style={styles.hint}>E-Mail-Adresse kann nicht geändert werden.</Text>

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
  nameRow: { flexDirection: 'row', gap: Theme.spacing.sm },
  nameField: { flex: 1 },
  label: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, marginBottom: 6, marginTop: 8 },
  optional: { color: Theme.colors.textMuted, fontWeight: '400' },
  input: { backgroundColor: Theme.colors.surface, color: Theme.colors.textPrimary, borderRadius: Theme.radius.md, padding: 14, fontSize: Theme.font.sizeMd, borderWidth: 1, borderColor: Theme.colors.border },
  villageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  villageBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface },
  villageBtnActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  villageBtnText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  villageBtnTextActive: { color: '#fff' },
  hint: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm, marginTop: 4 },
  btn: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: Theme.radius.lg, alignItems: 'center', marginTop: Theme.spacing.lg },
  btnText: { color: '#fff', fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
});
