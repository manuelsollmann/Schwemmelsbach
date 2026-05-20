import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { NewsPost } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { canManageContent } = useAuth();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('news')
      .select('*, author:profiles(full_name), club:clubs(name)')
      .eq('id', id)
      .single()
      .then(({ data }) => { setPost(data); setLoading(false); });
  }, [id]);

  const canManage = post && canManageContent(post.club_id);

  const handleDelete = () => {
    Alert.alert('Löschen', 'Diese Neuigkeit wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        await supabase.from('news').delete().eq('id', id);
        router.back();
      }},
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Theme.colors.primary} size="large" /></View>;
  if (!post) return <View style={styles.center}><Text style={styles.error}>Nicht gefunden</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {post.image_url && <Image source={{ uri: post.image_url }} style={styles.image} />}
      {post.club && <Text style={styles.club}>{post.club.name}</Text>}
      <Text style={styles.title}>{post.title}</Text>
      <View style={styles.meta}>
        <Text style={styles.author}>{post.author?.full_name}</Text>
        <Text style={styles.date}>{new Date(post.published_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
      </View>
      <Text style={styles.body}>{post.content}</Text>

      {canManage && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/news/edit?id=${id}`)}>
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
  content: { gap: Theme.spacing.md, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  image: { width: '100%', height: 240 },
  club: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold, textTransform: 'uppercase', paddingHorizontal: Theme.spacing.md },
  title: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeXl, fontWeight: Theme.font.weightBold, lineHeight: 30, paddingHorizontal: Theme.spacing.md },
  meta: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Theme.spacing.md },
  author: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  date: { color: Theme.colors.textMuted, fontSize: Theme.font.sizeSm },
  body: { color: Theme.colors.textPrimary, fontSize: Theme.font.sizeMd, lineHeight: 24, paddingHorizontal: Theme.spacing.md },
  error: { color: Theme.colors.textSecondary },
  actions: { flexDirection: 'row', gap: Theme.spacing.sm, paddingHorizontal: Theme.spacing.md, marginTop: Theme.spacing.sm },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.primary },
  editText: { color: Theme.colors.primary, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.danger },
  deleteText: { color: Theme.colors.danger, fontSize: Theme.font.sizeSm, fontWeight: Theme.font.weightBold },
});
