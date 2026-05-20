import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: '#161b22' },
        headerTintColor: '#e6edf3',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#0d1117' },
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Anmelden', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="(auth)/register" options={{ title: 'Registrieren', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="search" options={{ title: 'Suche', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="my-activity" options={{ title: 'Meine Aktivitäten', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="news/[id]" options={{ title: 'Neuigkeit', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="news/create" options={{ title: 'Neuigkeit erstellen', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="news/edit" options={{ title: 'Neuigkeit bearbeiten', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="events/[id]" options={{ title: 'Veranstaltung', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="events/create" options={{ title: 'Veranstaltung erstellen', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="events/edit" options={{ title: 'Veranstaltung bearbeiten', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="clubs/[id]" options={{ title: 'Verein', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="clubs/create" options={{ title: 'Verein anlegen', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="profile/edit" options={{ title: 'Profil bearbeiten', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="admin/index" options={{ title: 'Admin-Panel', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="admin/users" options={{ title: 'Nutzerverwaltung', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="helpers/[id]" options={{ title: 'Helferliste', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="helpers/create" options={{ title: 'Helferliste erstellen', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="helpers/edit" options={{ title: 'Helferliste bearbeiten', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="legal/impressum" options={{ title: 'Impressum', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="legal/datenschutz" options={{ title: 'Datenschutz', headerBackTitle: 'Zurück' }} />
      </Stack>
    </AuthProvider>
  );
}
