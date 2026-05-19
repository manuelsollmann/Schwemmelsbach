import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Event } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function EventsScreen() {
  const router = useRouter();
  const { canEdit, session } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('*, club:clubs(name)')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true });
    setEvents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const renderItem = ({ item }: { item: Event }) => {
    const date = new Date(item.date);
    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/events/${item.id}`)}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{date.getDate()}</Text>
          <Text style={styles.dateMonth}>{date.toLocaleDateString('de-DE', { month: 'short' })}</Text>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
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
  list: { padding: Theme.spacing.md, gap: Theme.spacing.sm },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  dateBox: { backgroundColor: Theme.colors.primary, borderRadius: Theme.radius.md, width: 50, height: 56, alignItems: 'center', justifyContent: 'center' },
  dateDay: { color: '#fff', fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold, lineHeight: 28 },
  dateMonth: { color: 'rgba(255,255,255,0.8)', fontSize: Theme.font.sizeSm, textTransform: 'uppercase' },
  info: { flex: 1, gap: 3 },
  clubLabel: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, textTransform: 'uppercase' },
  title: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  location: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  capacity: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: Theme.colors.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
