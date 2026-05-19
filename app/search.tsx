import { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';

type Result = { id: string; type: 'news' | 'event'; title: string; sub: string };

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const q = `%${text.trim()}%`;
    const [{ data: news }, { data: events }] = await Promise.all([
      supabase.from('news').select('id, title, published_at').ilike('title', q).limit(10),
      supabase.from('events').select('id, title, date, location').ilike('title', q).limit(10),
    ]);
    const r: Result[] = [
      ...(news ?? []).map(n => ({ id: n.id, type: 'news' as const, title: n.title, sub: new Date(n.published_at).toLocaleDateString('de-DE') })),
      ...(events ?? []).map(e => ({ id: e.id, type: 'event' as const, title: e.title, sub: `${new Date(e.date).toLocaleDateString('de-DE')}${e.location ? ` · ${e.location}` : ''}` })),
    ];
    setResults(r);
    setLoading(false);
  };

  const open = (item: Result) => {
    if (item.type === 'news') router.push(`/news/${item.id}`);
    else router.push(`/events/${item.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Theme.colors.textMuted} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={search}
          placeholder="News und Veranstaltungen suchen..."
          placeholderTextColor={Theme.colors.textMuted}
          autoFocus
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <Ionicons name="close-circle" size={20} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 20 }} />}

      <FlatList
        data={results}
        keyExtractor={i => `${i.type}-${i.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => open(item)}>
            <View style={styles.typeIcon}>
              <Ionicons
                name={item.type === 'news' ? 'newspaper-outline' : 'calendar-outline'}
                size={20}
                color={Theme.colors.primary}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={Theme.colors.textMuted} />
              <Text style={styles.emptyText}>Keine Ergebnisse für „{query}"</Text>
            </View>
          ) : query.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={Theme.colors.textMuted} />
              <Text style={styles.emptyText}>Suchbegriff eingeben</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, paddingHorizontal: Theme.spacing.md, paddingVertical: 12, gap: Theme.spacing.sm, borderWidth: 1, borderColor: Theme.colors.border },
  input: { flex: 1, color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd },
  list: { padding: Theme.spacing.md, gap: Theme.spacing.sm },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  typeIcon: { width: 36, height: 36, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  sub: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
});
