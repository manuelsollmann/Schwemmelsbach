import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'Gast',
  member: 'Mitglied',
  editor: 'Redakteur',
  club_admin: 'Vereinsadmin',
  admin: 'Administrator',
};

const ROLE_COLORS: Record<UserRole, string> = {
  guest: Theme.colors.guest,
  member: Theme.colors.member,
  editor: Theme.colors.editor,
  club_admin: Theme.colors.clubAdmin,
  admin: Theme.colors.admin,
};

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, role, signOut, isGuest } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: signOut },
    ]);
  };

  if (isGuest) {
    return (
      <View style={styles.container}>
        <View style={styles.guestBox}>
          <Ionicons name="person-circle-outline" size={72} color={Theme.colors.textMuted} />
          <Text style={styles.guestTitle}>Nicht angemeldet</Text>
          <Text style={styles.guestSub}>Melde dich an um am Dorfgeschehen teilzunehmen</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Anmelden</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerBtnText}>Neu registrieren</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.full_name?.charAt(0).toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{profile?.full_name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[role] + '22', borderColor: ROLE_COLORS[role] }]}>
          <Text style={[styles.roleText, { color: ROLE_COLORS[role] }]}>{ROLE_LABELS[role]}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={22} color={Theme.colors.textSecondary} />
          <Text style={styles.menuLabel}>Profil bearbeiten</Text>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={22} color={Theme.colors.textSecondary} />
          <Text style={styles.menuLabel}>Benachrichtigungen</Text>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-outline" size={22} color={Theme.colors.textSecondary} />
          <Text style={styles.menuLabel}>Datenschutz</Text>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={22} color={Theme.colors.textSecondary} />
          <Text style={styles.menuLabel}>Impressum</Text>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={Theme.colors.danger} />
        <Text style={styles.signOutText}>Abmelden</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, gap: Theme.spacing.md },
  header: { alignItems: 'center', paddingVertical: Theme.spacing.xl, gap: Theme.spacing.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: Theme.font.sizeXxl, fontWeight: Theme.font.weightBold },
  name: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold },
  email: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: Theme.radius.full, borderWidth: 1 },
  roleText: { fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  section: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: Theme.colors.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  menuLabel: { flex: 1, color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Theme.spacing.sm, padding: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: Theme.colors.danger + '44' },
  signOutText: { color: Theme.colors.danger, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  guestBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.xl, gap: Theme.spacing.md },
  guestTitle: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold },
  guestSub: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, textAlign: 'center' },
  loginBtn: { backgroundColor: Theme.colors.primary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: Theme.radius.lg, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  registerBtn: { paddingVertical: 14, width: '100%', alignItems: 'center' },
  registerBtnText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
});
