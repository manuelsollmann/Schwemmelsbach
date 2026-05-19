import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Club, NewsPost, Event } from '@/types';

type ClubDetail = Club & { member_count: number };

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: clubData }, { count: memberCount }, { data: newsData }, { data: eventsData }] = await Promise.all([
        supabase.from('clubs').select('*').eq('id', id).single(),
        supabase.from('club_memberships').select('*', { count: 'exact', head: true }).eq('club_id', id),
        supabase.from('news').select('id, title, published_at').eq('club_id', id).order('published_at', { ascending: false }).limit(5),
        supabase.from('events').select('id, title, date, location').eq('club_id', id).gte('date', new Date().toISOString()).order('date').limit(5),
      ]);
      if (clubData) setClub({ ...clubData, member_count: memberCount ?? 0 });
      setNews(newsData ?? []);
      setEvents(eventsData ?? []);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator color={Theme.colors.primary} size="large" /></View>;
  if (!club) return <View style={styles.center}><Text style={styles.error}>Nicht gefunden</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logo}>
          {club.logo_url
            ? <Image source={{ uri: club.logo_url }} style={styles.logoImg} />
            : <Ionicons name={(club.icon ?? 'shield-outline') as any} size={48} color={Theme.colors.primary} />}
        </View>
        <Text style={styles.name}>{club.name}</Text>
        {club.description && <Text style={styles.desc}>{club.description}</Text>}
        <View style={styles.memberBadge}>
          <Ionicons name="people-outline" size={16} color={Theme.colors.textMuted} />
          <Text style={styles.memberText}>{club.member_count} Mitglieder</Text>
        </View>
      </View>

      {events.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nächste Veranstaltungen</Text>
          {events.map(e => {
            const d = new Date(e.date);
            return (
              <TouchableOpacity key={e.id} style={styles.row} onPress={() => router.push(`/events/${e.id}`)}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateDay}>{d.getDate()}</Text>
                  <Text style={styles.dateMonth}>{d.toLocaleDateString('de-DE', { month: 'short' })}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{e.title}</Text>
                  {e.location && <Text style={styles.rowSub}>{e.location}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {news.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Neuigkeiten</Text>
          {news.map(n => (
            <TouchableOpacity key={n.id} style={styles.row} onPress={() => router.push(`/news/${n.id}`)}>
              <Ionicons name="newspaper-outline" size={20} color={Theme.colors.primary} style={{ width: 28 }} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{n.title}</Text>
                <Text style={styles.rowSub}>{new Date(n.published_at).toLocaleDateString('de-DE')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {events.length === 0 && news.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="information-circle-outline" size={40} color={Theme.colors.textMuted} />
          <Text style={styles.emptyText}>Noch keine Inhalte vorhanden</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, gap: Theme.spacing.md, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  error: { color: Theme.colors.textSecondary },
  header: { alignItems: 'center', gap: Theme.spacing.sm, paddingVertical: Theme.spacing.lg },
  logo: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  logoImg: { width: 80, height: 80, borderRadius: 40 },
  name: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold, textAlign: 'center' },
  desc: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, textAlign: 'center', lineHeight: 22 },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Theme.colors.surface, paddingHorizontal: 14, paddingVertical: 6, borderRadius: Theme.radius.full, borderWidth: 1, borderColor: Theme.colors.border },
  memberText: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  section: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: Theme.colors.border, overflow: 'hidden' },
  sectionTitle: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold, padding: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  row: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  dateBox: { backgroundColor: Theme.colors.primary, borderRadius: Theme.radius.sm, width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  dateDay: { color: '#fff', fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold, lineHeight: 22 },
  dateMonth: { color: 'rgba(255,255,255,0.8)', fontSize: 10, textTransform: 'uppercase' },
  rowInfo: { flex: 1 },
  rowTitle: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  rowSub: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeMd },
});
