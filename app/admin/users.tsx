import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Profile, UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';

const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'Gast',
  member: 'Mitglied',
  editor: 'Redakteur',
  club_admin: 'Vereinsadmin',
  admin: 'Administrator',
};

const ROLES_ORDER: UserRole[] = ['member', 'editor', 'club_admin', 'admin'];

export default function AdminUsersScreen() {
  const { profile: myProfile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    setUsers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const changeRole = (user: Profile) => {
    if (user.id === myProfile?.id) { Alert.alert('Hinweis', 'Du kannst deine eigene Rolle nicht ändern.'); return; }
    Alert.alert(
      `Rolle für ${user.full_name}`,
      `Aktuelle Rolle: ${ROLE_LABELS[user.role]}`,
      [
        ...ROLES_ORDER.filter(r => r !== user.role).map(r => ({
          text: ROLE_LABELS[r],
          onPress: () => updateRole(user.id, r),
        })),
        { text: 'Abbrechen', style: 'cancel' as const },
      ]
    );
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) { Alert.alert('Fehler', error.message); return; }
    setUsers(u => u.map(p => p.id === userId ? { ...p, role: newRole } : p));
  };

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = (role: UserRole) => ({
    guest: Theme.colors.guest,
    member: Theme.colors.member,
    editor: Theme.colors.editor,
    club_admin: Theme.colors.clubAdmin,
    admin: Theme.colors.admin,
  }[role]);

  const renderItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity style={styles.card} onPress={() => changeRole(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.full_name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        {item.phone && <Text style={styles.phone}>{item.phone}</Text>}
      </View>
      <View style={[styles.roleBadge, { backgroundColor: roleColor(item.role) + '22', borderColor: roleColor(item.role) }]}>
        <Text style={[styles.roleText, { color: roleColor(item.role) }]}>{ROLE_LABELS[item.role]}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={Theme.colors.textMuted} />
            <Text
              style={styles.searchInput}
              onPress={() => {}}
            />
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Keine Nutzer gefunden</Text>
            </View>
          ) : null
        }
      />
      {loading && <ActivityIndicator color={Theme.colors.primary} style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  list: { padding: Theme.spacing.md, gap: Theme.spacing.sm },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.md, padding: Theme.spacing.md, gap: Theme.spacing.sm, borderWidth: 1, borderColor: Theme.colors.border, marginBottom: Theme.spacing.sm },
  searchInput: { flex: 1, color: Theme.colors.textMuted, fontSize: Theme.font.sizeMd },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: Theme.font.sizeLg, fontWeight: Theme.font.weightBold },
  info: { flex: 1 },
  name: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  email: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  phone: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Theme.radius.full, borderWidth: 1 },
  roleText: { fontSize: 11, fontWeight: Theme.font.weightBold },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
  loader: { position: 'absolute', top: '50%', alignSelf: 'center' },
});
