import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Image, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Club, Village } from '@/types';
import { useAuth, WASSERLOSEN_GEMEINDE_ID } from '@/context/AuthContext';

export default function ClubsScreen() {
  const router = useRouter();
  const { isAdmin, profile } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [villageFilter, setVillageFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: clubData }, { data: villageData }] = await Promise.all([
      supabase.from('clubs').select('*').order('name'),
      supabase.from('villages').select('*').eq('gemeinde_id', WASSERLOSEN_GEMEINDE_ID).order('name'),
    ]);
    setClubs(clubData ?? []);
    setVillages(villageData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = useMemo(() => {
    let result = clubs;

    if (villageFilter === 'gemeinde') {
      result = result.filter(c => c.village_id === null);
    } else if (villageFilter) {
      result = result.filter(c => c.village_id === villageFilter || c.village_id === null);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    return result;
  }, [clubs, villageFilter, search]);

  const villageName = (id: string | null) => {
    if (!id) return null;
    return villages.find(v => v.id === id)?.name ?? null;
  };

  const renderItem = ({ item }: { item: Club }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/clubs/${item.id}`)}>
      <View style={styles.logo}>
        {item.logo_url
          ? <Image source={{ uri: item.logo_url }} style={styles.logoImg} />
          : <Ionicons name={(item.icon ?? 'shield-outline') as any} size={32} color={Theme.colors.primary} />}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.village_id && villageName(item.village_id)
          ? <Text style={styles.village}>{villageName(item.village_id)}</Text>
          : <Text style={styles.villageMuted}>Gemeinde Wasserlosen</Text>}
        {item.description && <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Theme.colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={Theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Verein suchen..."
            placeholderTextColor={Theme.colors.textMuted}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={Theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[styles.chip, villageFilter === null && styles.chipActive]}
            onPress={() => setVillageFilter(null)}
          >
            <Text style={[styles.chipText, villageFilter === null && styles.chipTextActive]}>Alle</Text>
          </TouchableOpacity>
          {villages.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[styles.chip, villageFilter === v.id && styles.chipActive]}
              onPress={() => setVillageFilter(villageFilter === v.id ? null : v.id)}
            >
              <Text style={[styles.chipText, villageFilter === v.id && styles.chipTextActive]}>{v.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.chip, villageFilter === 'gemeinde' && styles.chipActive]}
            onPress={() => setVillageFilter(villageFilter === 'gemeinde' ? null : 'gemeinde')}
          >
            <Text style={[styles.chipText, villageFilter === 'gemeinde' && styles.chipTextActive]}>Gemeindeübergreifend</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={Theme.colors.textMuted} />
              <Text style={styles.emptyText}>
                {search ? `Kein Verein gefunden für „${search}"` : 'Keine Vereine in diesem Ortsteil'}
              </Text>
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
  header: { backgroundColor: Theme.colors.background, paddingTop: Theme.spacing.md, gap: Theme.spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.border, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, paddingVertical: 12 },
  clearBtn: { padding: 4 },
  filterRow: { paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.sm, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface },
  chipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  chipText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  chipTextActive: { color: '#fff' },
  list: { padding: Theme.spacing.md, gap: Theme.spacing.sm },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  logo: { width: 52, height: 52, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  logoImg: { width: 52, height: 52, borderRadius: Theme.radius.md },
  info: { flex: 1, gap: 2 },
  name: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  village: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  villageMuted: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  desc: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, textAlign: 'center' },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: Theme.colors.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
