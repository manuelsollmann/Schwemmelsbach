export type UserRole = 'guest' | 'member' | 'editor' | 'club_admin' | 'admin';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
};

export type Club = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
};

export type NewsPost = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_id: string;
  author?: Profile;
  club_id: string | null;
  club?: Club;
  published_at: string;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  location: string | null;
  image_url: string | null;
  max_attendees: number | null;
  attendee_count?: number;
  is_registered?: boolean;
  club_id: string | null;
  club?: Club;
  created_by: string;
  created_at: string;
};

export type HelperList = {
  id: string;
  title: string;
  description: string | null;
  event_id: string | null;
  club_id: string | null;
  club?: Club;
  created_by: string;
  created_at: string;
  slots?: HelperSlot[];
};

export type HelperSlot = {
  id: string;
  list_id: string;
  task: string;
  description: string | null;
  max_helpers: number;
  helper_count?: number;
  is_signed_up?: boolean;
};
