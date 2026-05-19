import { supabase } from '@/lib/supabase';

export async function sendPushNotification(title: string, body: string) {
  try {
    await supabase.functions.invoke('send-push', { body: { title, body } });
  } catch {}
}
