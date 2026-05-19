import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Bitte alle Felder ausfüllen.'); return; }
    setLoading(true);
    setError('');
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError('E-Mail oder Passwort falsch.');
    else router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.headline}>Willkommen zurück</Text>
        <Text style={styles.sub}>Melde dich mit deinen Zugangsdaten an</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <Text style={styles.label}>E-Mail</Text>
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

        <Text style={styles.label}>Passwort</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={Theme.colors.textMuted}
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Anmelden</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.switchRow}>
          <Text style={styles.switchText}>Noch kein Konto? <Text style={styles.switchLink}>Registrieren</Text></Text>
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
  label: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: Theme.colors.surface, color: Theme.colors.textPrimary, borderRadius: Theme.radius.md, padding: 14, fontSize: Theme.font.sizeMd, borderWidth: 1, borderColor: Theme.colors.border },
  btn: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: Theme.radius.lg, alignItems: 'center', marginTop: Theme.spacing.md },
  btnText: { color: '#fff', fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  switchRow: { alignItems: 'center', paddingTop: Theme.spacing.md },
  switchText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
  switchLink: { color: Theme.colors.primary, fontWeight: Theme.font.weightBold },
  errorBox: { backgroundColor: Theme.colors.danger + '22', borderRadius: Theme.radius.md, padding: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.danger + '44' },
  errorText: { color: Theme.colors.danger, fontSize: Theme.font.sizeSm },
});
