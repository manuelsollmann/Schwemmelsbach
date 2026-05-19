import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Club } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function ClubsScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('clubs').select('*').order('name');
    setClubs(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const renderItem = ({ item }: { item: Club }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/clubs/${item.id}`)}>
      <View style={styles.logo}>
        {item.logo_url
          ? <Image source={{ uri: item.logo_url }} style={styles.logoImg} />
          : <Ionicons name={(item.icon ?? 'shield-outline') as any} size={32} color={Theme.colors.primary} />}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Theme.colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clubs}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={Theme.colors.textMuted} />
              <Text style={styles.emptyText}>Keine Vereine angelegt</Text>
            </View>
          ) : null
        }
      />
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/clubs/create')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  list: { padding: Theme.spacing.md, gap: Theme.spacing.sm },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  logo: { width: 52, height: 52, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  logoImg: { width: 52, height: 52, borderRadius: Theme.radius.md },
  info: { flex: 1 },
  name: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  desc: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, marginTop: 3 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: Theme.colors.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
