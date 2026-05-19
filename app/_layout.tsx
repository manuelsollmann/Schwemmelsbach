import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: '#1a2e1a' },
        headerTintColor: '#f0f5f0',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#0f1a0f' },
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Anmelden', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="(auth)/register" options={{ title: 'Registrieren', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="news/[id]" options={{ title: 'Neuigkeit', headerBackTitle: 'Zurück' }} />
        <Stack.Screen name="events/[id]" options={{ title: 'Veranstaltung', headerBackTitle: 'Zurück' }} />
      </Stack>
    </AuthProvider>
  );
}
