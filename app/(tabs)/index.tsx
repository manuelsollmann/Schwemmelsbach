import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { NewsPost } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function NewsScreen() {
  const router = useRouter();
  const { canEdit, profile } = useAuth();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    let query = supabase
      .from('news')
      .select('*, author:profiles(full_name, avatar_url), club:clubs(name)')
      .order('published_at', { ascending: false })
      .limit(30);

    if (profile?.village_id) {
      query = query.or(`village_id.is.null,village_id.eq.${profile.village_id}`);
    }

    const { data } = await query;
    setPosts(data ?? []);
    setLoading(false);
  }, [profile?.village_id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: NewsPost }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/news/${item.id}`)}>
      {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
      <View style={styles.cardBody}>
        {item.club && <Text style={styles.clubLabel}>{item.club.name}</Text>}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.excerpt} numberOfLines={2}>{item.content}</Text>
        <View style={styles.meta}>
          <Text style={styles.author}>{item.author?.full_name ?? 'Unbekannt'}</Text>
          <Text style={styles.date}>{new Date(item.published_at).toLocaleDateString('de-DE')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={48} color={Theme.colors.textMuted} />
              <Text style={styles.emptyText}>Noch keine Neuigkeiten</Text>
            </View>
          ) : null
        }
      />
      {canEdit && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/news/create')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  list: { padding: Theme.spacing.md, gap: Theme.spacing.md },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Theme.colors.border },
  image: { width: '100%', height: 180 },
  cardBody: { padding: Theme.spacing.md },
  clubLabel: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, marginBottom: 4, textTransform: 'uppercase' },
  title: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeLg, fontWeight: Theme.font.weightBold, marginBottom: 6 },
  excerpt: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, lineHeight: 21 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Theme.spacing.sm },
  author: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  date: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: Theme.colors.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
