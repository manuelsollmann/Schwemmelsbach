import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Event } from '@/types';
import { useAuth } from '@/context/AuthContext';

type HelperItem = {
  type: 'helper';
  id: string;
  listId: string;
  task: string;
  listTitle: string;
  date: string;
  club: { name: string } | null;
};

type EventItem = { type: 'event' } & Event;
type FeedItem = EventItem | HelperItem;

type Filter = 'all' | 'events' | 'helpers';

export default function EventsScreen() {
  const router = useRouter();
  const { canEdit, session } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const now = new Date().toISOString();

    const queries: Promise<any>[] = [
      supabase.from('events').select('*, club:clubs(name)').gte('date', now).order('date', { ascending: true }),
    ];

    if (session) {
      queries.push(
        supabase
          .from('helper_registrations')
          .select('slot_id, slot:helper_slots(id, task, list:helper_lists(id, title, date, club:clubs(name)))')
          .eq('user_id', session.user.id)
      );
    }

    const [{ data: events }, helperResult] = await Promise.all(queries);
    const helperRegs = helperResult?.data ?? [];

    const helperItems: HelperItem[] = helperRegs
      .filter((r: any) => r.slot?.list?.date && new Date(r.slot.list.date) >= new Date(now))
      .map((r: any) => ({
        type: 'helper' as const,
        id: r.slot.list.id + '_' + r.slot_id,
        listId: r.slot.list.id,
        task: r.slot.task,
        listTitle: r.slot.list.title,
        date: r.slot.list.date,
        club: Array.isArray(r.slot.list.club) ? r.slot.list.club[0] ?? null : r.slot.list.club,
      }));

    const eventItems: EventItem[] = (events ?? []).map((e: Event) => ({ ...e, type: 'event' as const }));

    const merged = [...eventItems, ...helperItems].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setItems(merged);
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const renderItem = ({ item }: { item: FeedItem }) => {
    const date = new Date(item.date);
    const day = date.getDate();
    const month = date.toLocaleDateString('de-DE', { month: 'short' });

    if (item.type === 'helper') {
      return (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/helpers/${item.listId}` as any)}>
          <View style={[styles.dateBox, styles.dateBoxHelper]}>
            <Text style={styles.dateDay}>{day}</Text>
            <Text style={styles.dateMonth}>{month}</Text>
          </View>
          <View style={styles.info}>
            {item.club && <Text style={styles.clubLabel}>{item.club.name}</Text>}
            <Text style={styles.title}>{item.task}</Text>
            <View style={styles.helperBadgeRow}>
              <Ionicons name="hand-left-outline" size={12} color={Theme.colors.primary} />
              <Text style={styles.helperBadge}>{item.listTitle}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Theme.colors.textMuted} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/events/${item.id}`)}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateMonth}>{month}</Text>
        </View>
        <View style={styles.info}>
          {item.club && <Text style={styles.clubLabel}>{item.club.name}</Text>}
          <Text style={styles.title}>{item.title}</Text>
          {item.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={Theme.colors.textMuted} />
              <Text style={styles.location}>{item.location}</Text>
            </View>
          )}
          {item.max_attendees && (
            <Text style={styles.capacity}>{item.attendee_count ?? 0} / {item.max_attendees} Teilnehmer</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Theme.colors.textMuted} />
      </TouchableOpacity>
    );
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === (filter === 'events' ? 'event' : 'helper'));

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {([['all', 'Alle'], ['events', 'Veranstaltungen'], ['helpers', 'Helferdienste']] as [Filter, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterBtn, filter === key && styles.filterBtnActive]}
            onPress={() => setFilter(key)}
          >
            <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
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
              <Ionicons name="calendar-outline" size={48} color={Theme.colors.textMuted} />
              <Text style={styles.emptyText}>Keine bevorstehenden Veranstaltungen</Text>
            </View>
          ) : null
        }
      />
      {canEdit && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/events/create')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  filterBar: { flexDirection: 'row', gap: Theme.spacing.sm, padding: Theme.spacing.md, paddingBottom: 0 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface, alignItems: 'center' },
  filterBtnActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  filterText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  filterTextActive: { color: '#fff' },
  list: { padding: Theme.spacing.md, gap: Theme.spacing.sm },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  dateBox: { backgroundColor: Theme.colors.primary, borderRadius: Theme.radius.md, width: 50, height: 56, alignItems: 'center', justifyContent: 'center' },
  dateBoxHelper: { backgroundColor: Theme.colors.primary + 'cc' },
  dateDay: { color: '#fff', fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold, lineHeight: 28 },
  dateMonth: { color: 'rgba(255,255,255,0.8)', fontSize: Theme.font.sizeSm, textTransform: 'uppercase' },
  info: { flex: 1, gap: 3 },
  clubLabel: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, textTransform: 'uppercase' },
  title: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  location: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  capacity: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  helperBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  helperBadge: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: Theme.colors.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
