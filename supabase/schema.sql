-- Schwemmelsbach Datenbank Schema
-- Ausführen im Supabase SQL Editor: https://supabase.com/dashboard

-- ============================================================
-- PROFILES (erweitert auth.users)
-- ============================================================
create type user_role as enum ('guest', 'member', 'editor', 'club_admin', 'admin');

create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  avatar_url text,
  role user_role not null default 'member',
  created_at timestamptz default now()
);

-- Automatisch Profil anlegen bei Registrierung
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- CLUBS (Vereine)
-- ============================================================
create table clubs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  logo_url text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table club_memberships (
  user_id uuid references profiles(id) on delete cascade,
  club_id uuid references clubs(id) on delete cascade,
  role text not null default 'member', -- 'member' | 'admin'
  joined_at timestamptz default now(),
  primary key (user_id, club_id)
);

-- ============================================================
-- NEWS
-- ============================================================
create table news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  image_url text,
  author_id uuid references profiles(id),
  club_id uuid references clubs(id),
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- EVENTS (Veranstaltungen)
-- ============================================================
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  date timestamptz not null,
  end_date timestamptz,
  location text,
  image_url text,
  max_attendees integer,
  club_id uuid references clubs(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table event_registrations (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  status text not null default 'confirmed', -- 'confirmed' | 'waitlist'
  registered_at timestamptz default now(),
  unique(event_id, user_id)
);

-- ============================================================
-- HELFERLISTEN
-- ============================================================
create table helper_lists (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_id uuid references events(id),
  club_id uuid references clubs(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table helper_slots (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references helper_lists(id) on delete cascade,
  task text not null,
  description text,
  max_helpers integer not null default 1,
  created_at timestamptz default now()
);

create table helper_registrations (
  user_id uuid references profiles(id) on delete cascade,
  slot_id uuid references helper_slots(id) on delete cascade,
  registered_at timestamptz default now(),
  primary key (user_id, slot_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table profiles enable row level security;
alter table clubs enable row level security;
alter table club_memberships enable row level security;
alter table news enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table helper_lists enable row level security;
alter table helper_slots enable row level security;
alter table helper_registrations enable row level security;

-- Profiles: jeder kann lesen, nur eigenes Profil bearbeiten
create policy "Profiles sind öffentlich lesbar" on profiles for select using (true);
create policy "Nutzer bearbeiten eigenes Profil" on profiles for update using (auth.uid() = id);

-- Clubs: jeder kann lesen
create policy "Clubs sind öffentlich lesbar" on clubs for select using (true);
create policy "Admins können Clubs erstellen" on clubs for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- News: jeder kann lesen, Editoren/Admins können schreiben
create policy "News sind öffentlich lesbar" on news for select using (true);
create policy "Editoren können News erstellen" on news for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor', 'club_admin', 'admin'))
);
create policy "Autoren können eigene News bearbeiten" on news for update using (
  author_id = auth.uid() or
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Events: jeder kann lesen, Editoren können erstellen
create policy "Events sind öffentlich lesbar" on events for select using (true);
create policy "Editoren können Events erstellen" on events for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor', 'club_admin', 'admin'))
);

-- Event Registrierungen: nur angemeldete Nutzer
create policy "Angemeldete Nutzer können Events sehen" on event_registrations for select using (auth.uid() is not null);
create policy "Nutzer können sich anmelden" on event_registrations for insert with check (auth.uid() = user_id);
create policy "Nutzer können sich abmelden" on event_registrations for delete using (auth.uid() = user_id);

-- Helferlisten: jeder kann lesen
create policy "Helferlisten sind öffentlich lesbar" on helper_lists for select using (true);
create policy "Helferlisten Slots sind öffentlich lesbar" on helper_slots for select using (true);
create policy "Nutzer können sich als Helfer eintragen" on helper_registrations for insert with check (auth.uid() = user_id);
create policy "Nutzer können sich austragen" on helper_registrations for delete using (auth.uid() = user_id);
