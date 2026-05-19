import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { HelperList } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function HelpersScreen() {
  const router = useRouter();
  const { canEdit, session } = useAuth();
  const [lists, setLists] = useState<HelperList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('helper_lists')
      .select('*, club:clubs(name), slots:helper_slots(id, task, max_helpers)')
      .order('created_at', { ascending: false });
    setLists(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const renderItem = ({ item }: { item: HelperList }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/helpers/${item.id}`)}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name="hand-left-outline" size={24} color={Theme.colors.primary} />
        </View>
        <View style={styles.info}>
          {item.club && <Text style={styles.clubLabel}>{item.club.name}</Text>}
          <Text style={styles.title}>{item.title}</Text>
          {item.description && <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Theme.colors.textMuted} />
      </View>
      {item.slots && item.slots.length > 0 && (
        <View style={styles.slots}>
          <Text style={styles.slotsLabel}>{item.slots.length} Aufgabe{item.slots.length !== 1 ? 'n' : ''}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="hand-left-outline" size={48} color={Theme.colors.textMuted} />
              <Text style={styles.emptyText}>Keine Helferlisten vorhanden</Text>
              {!session && <Text style={styles.emptyHint}>Melde dich an um mitzumachen</Text>}
            </View>
          ) : null
        }
      />
      {canEdit && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/helpers/create')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  list: { padding: Theme.spacing.md, gap: Theme.spacing.sm },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  iconWrap: { width: 44, height: 44, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  clubLabel: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, textTransform: 'uppercase' },
  title: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  desc: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, marginTop: 2 },
  slots: { marginTop: Theme.spacing.sm, paddingTop: Theme.spacing.sm, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  slotsLabel: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
  emptyHint: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: Theme.colors.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
