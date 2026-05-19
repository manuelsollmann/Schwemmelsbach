import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Event } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session, isGuest, isAdmin } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('events').select('*, club:clubs(name)').eq('id', id).single();
    if (data && session) {
      const { count } = await supabase.from('event_registrations').select('*', { count: 'exact', head: true }).eq('event_id', id);
      const { data: reg } = await supabase.from('event_registrations').select('id').eq('event_id', id).eq('user_id', session.user.id).single();
      setEvent({ ...data, attendee_count: count ?? 0, is_registered: !!reg });
    } else {
      setEvent(data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const canManage = event && (event.created_by === session?.user.id || isAdmin);

  const toggleRegistration = async () => {
    if (!session) { Alert.alert('Anmelden', 'Bitte melde dich an um dich zu einer Veranstaltung anzumelden.'); return; }
    setRegistering(true);
    if (event?.is_registered) {
      await supabase.from('event_registrations').delete().eq('event_id', id).eq('user_id', session.user.id);
    } else {
      await supabase.from('event_registrations').insert({ event_id: id, user_id: session.user.id });
    }
    await load();
    setRegistering(false);
  };

  const handleDelete = () => {
    Alert.alert('Löschen', 'Diese Veranstaltung wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        await supabase.from('events').delete().eq('id', id);
        router.back();
      }},
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Theme.colors.primary} size="large" /></View>;
  if (!event) return <View style={styles.center}><Text style={styles.error}>Nicht gefunden</Text></View>;

  const date = new Date(event.date);
  const isFull = event.max_attendees ? (event.attendee_count ?? 0) >= event.max_attendees && !event.is_registered : false;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{date.getDate()}</Text>
          <Text style={styles.dateMonth}>{date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</Text>
          <Text style={styles.dateTime}>{date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</Text>
        </View>
      </View>

      {event.club && <Text style={styles.club}>{event.club.name}</Text>}
      <Text style={styles.title}>{event.title}</Text>

      {event.location && (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={Theme.colors.textMuted} />
          <Text style={styles.infoText}>{event.location}</Text>
        </View>
      )}

      {event.max_attendees && (
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={18} color={Theme.colors.textMuted} />
          <Text style={styles.infoText}>{event.attendee_count} / {event.max_attendees} Teilnehmer</Text>
        </View>
      )}

      {event.description && <Text style={styles.body}>{event.description}</Text>}

      <TouchableOpacity
        style={[styles.registerBtn, event.is_registered && styles.unregisterBtn, isFull && styles.fullBtn]}
        onPress={toggleRegistration}
        disabled={registering || isFull}
      >
        {registering
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.registerText}>{isFull ? 'Ausgebucht' : event.is_registered ? 'Abmelden' : 'Anmelden'}</Text>}
      </TouchableOpacity>

      {canManage && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/events/edit?id=${id}`)}>
            <Ionicons name="pencil-outline" size={18} color={Theme.colors.primary} />
            <Text style={styles.editText}>Bearbeiten</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={Theme.colors.danger} />
            <Text style={styles.deleteText}>Löschen</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, gap: Theme.spacing.md, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  header: { alignItems: 'center', paddingVertical: Theme.spacing.md },
  dateBox: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, padding: Theme.spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  dateDay: { color: Theme.colors.primary, fontSize: 48, fontWeight: Theme.font.weightBold, lineHeight: 56 },
  dateMonth: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeLg, fontWeight: Theme.font.weightBold },
  dateTime: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd, marginTop: 4 },
  club: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, textTransform: 'uppercase' },
  title: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold, lineHeight: 30 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  infoText: { color: Theme.colors.textSecondary, fontSize: Theme.font.sizeMd },
  body: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, lineHeight: 24 },
  registerBtn: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: Theme.radius.lg, alignItems: 'center', marginTop: Theme.spacing.md },
  unregisterBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Theme.colors.danger },
  fullBtn: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border },
  registerText: { color: '#fff', fontSize: Theme.font.sizeMd, fontWeight: Theme.font.weightBold },
  error: { color: Theme.colors.textSecondary },
  actions: { flexDirection: 'row', gap: Theme.spacing.sm },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.primary },
  editText: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.danger },
  deleteText: { color: Theme.colors.danger, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
});
