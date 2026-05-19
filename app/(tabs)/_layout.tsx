import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function TabsLayout() {
  const { isAdmin, canEdit } = useAuth();
  const router = useRouter();
  const searchBtn = <TouchableOpacity onPress={() => router.push('/search')} style={{ marginRight: 16 }}><Ionicons name="search-outline" size={22} color={Theme.colors.textPrimary} /></TouchableOpacity>;

  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: Theme.colors.surface, borderTopColor: Theme.colors.border },
      tabBarActiveTintColor: Theme.colors.primary,
      tabBarInactiveTintColor: Theme.colors.textSecondary,
      headerStyle: { backgroundColor: Theme.colors.surface },
      headerTintColor: Theme.colors.textPrimary,
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Neuigkeiten',
          tabBarIcon: ({ color, size }) => <Ionicons name="newspaper-outline" size={size} color={color} />,
          headerRight: () => searchBtn,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Veranstaltungen',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
          headerRight: () => searchBtn,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'Vereine',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="helpers"
        options={{
          title: 'Helfer',
          tabBarIcon: ({ color, size }) => <Ionicons name="hand-left-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
