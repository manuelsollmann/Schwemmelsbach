import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAuth, WASSERLOSEN_GEMEINDE_ID } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Village } from '@/types';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase
      .from('villages')
      .select('*')
      .eq('gemeinde_id', WASSERLOSEN_GEMEINDE_ID)
      .order('name')
      .then(({ data }) => setVillages(data ?? []));
  }, []);

  const handleRegister = async () => {
    if (!firstName.trim()) { setError('Bitte Vornamen eingeben.'); return; }
    if (!lastName.trim()) { setError('Bitte Nachnamen eingeben.'); return; }
    if (!selectedVillage) { setError('Bitte deinen Ortsteil auswählen.'); return; }
    if (!email.trim()) { setError('Bitte E-Mail eingeben.'); return; }
    if (!password) { setError('Bitte Passwort eingeben.'); return; }
    if (password.length < 6) { setError('Passwort muss mindestens 6 Zeichen haben.'); return; }
    setLoading(true);
    setError('');
    const err = await signUp(email.trim(), password, firstName.trim(), lastName.trim(), selectedVillage, phone.trim() || undefined);
    setLoading(false);
    if (err) setError(err);
    else setSuccess(true);
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Registrierung erfolgreich!</Text>
        <Text style={styles.successText}>Bitte bestätige deine E-Mail-Adresse und melde dich dann an.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.btnText}>Zur Anmeldung</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.headline}>Konto erstellen</Text>
        <Text style={styles.sub}>Werde Teil der Gemeinde Wasserlosen</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

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

        <Text style={styles.label}>E-Mail *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="deine@email.de"
          placeholderTextColor={Theme.colors.textMuted}
        />

        <Text style={styles.label}>Passwort *</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Mindestens 6 Zeichen"
          placeholderTextColor={Theme.colors.textMuted}
        />

        <Text style={styles.hint}>Mit der Registrierung stimmst du unserer Datenschutzerklärung zu.</Text>

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Registrieren</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.switchRow}>
          <Text style={styles.switchText}>Bereits ein Konto? <Text style={styles.switchLink}>Anmelden</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.lg, gap: Theme.spacing.sm, paddingTop: Theme.spacing.xl },
  headline: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeXxl, fontWeight: Theme.font.weightBold, marginBottom: 4 },
  sub: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, marginBottom: Theme.spacing.lg },
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
  btn: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: Theme.radius.lg, alignItems: 'center', marginTop: Theme.spacing.md },
  btnText: { color: '#fff', fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  switchRow: { alignItems: 'center', paddingTop: Theme.spacing.md },
  switchText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
  switchLink: { color: Theme.colors.primary, fontWeight: Theme.font.weightBold },
  errorBox: { backgroundColor: Theme.colors.danger + '22', borderRadius: Theme.radius.md, padding: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.danger + '44' },
  errorText: { color: Theme.colors.danger, fontSize: Theme.font.sizeSm },
  successContainer: { flex: 1, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.xl, gap: Theme.spacing.md },
  successIcon: { fontSize: 64, color: Theme.colors.success },
  successTitle: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold },
  successText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, textAlign: 'center' },
});
