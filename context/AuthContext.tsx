import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types';

export const WASSERLOSEN_GEMEINDE_ID = '11111111-1111-1111-1111-111111111111';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  isLoaded: boolean;
  isGuest: boolean;
  canEdit: boolean;
  isAdmin: boolean;
  adminClubIds: string[];
  villageId: string | null;
  gemeindeId: string | null;
  canManageContent: (clubId: string | null, authorId?: string | null) => boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, firstName: string, lastName: string, villageId: string, phone?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [adminClubIds, setAdminClubIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const role: UserRole = profile?.role ?? 'guest';
  const isGuest = !session;
  const canEdit = ['editor', 'club_admin', 'admin'].includes(role);
  const isAdmin = role === 'admin';
  const villageId = profile?.village_id ?? null;
  const gemeindeId = profile?.gemeinde_id ?? WASSERLOSEN_GEMEINDE_ID;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setIsLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else { setProfile(null); setIsLoaded(true); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const [{ data: profileData }, { data: memberships }] = await Promise.all([
      supabase.from('profiles').select('*, village:villages(id, name, gemeinde_id)').eq('id', userId).single(),
      supabase.from('club_memberships').select('club_id').eq('user_id', userId).eq('role', 'admin'),
    ]);
    setProfile(profileData);
    setAdminClubIds(memberships?.map(m => m.club_id) ?? []);
    setIsLoaded(true);
    setTimeout(() => registerPushToken(userId), 2000);
  };

  const registerPushToken = async (userId: string) => {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      const { status } = existing === 'granted'
        ? { status: existing }
        : await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
      await supabase.from('push_tokens').upsert({ user_id: userId, token }, { onConflict: 'user_id,token' });
    } catch {}
  };

  const canManageContent = (clubId: string | null, _authorId?: string | null): boolean => {
    if (role === 'admin') return true;
    if (role === 'club_admin' && clubId && adminClubIds.includes(clubId)) return true;
    return false;
  };

  const refreshProfile = async () => {
    if (session) await loadProfile(session.user.id);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, villageId: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          phone: phone ?? null,
          village_id: villageId,
          gemeinde_id: WASSERLOSEN_GEMEINDE_ID,
        },
      },
    });
    return error?.message ?? null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      session, user: session?.user ?? null, profile, role,
      isLoaded, isGuest, canEdit, isAdmin, adminClubIds,
      villageId, gemeindeId,
      canManageContent, signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
