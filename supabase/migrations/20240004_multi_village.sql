-- Multi-Village / Multi-Tenant Migration
-- Gemeinden (Municipalities) und Dörfer (Villages)

-- ============================================================
-- GEMEINDEN (Tenants)
-- ============================================================
create table gemeinden (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table gemeinden enable row level security;
create policy "Gemeinden sind öffentlich lesbar" on gemeinden for select using (true);

-- ============================================================
-- VILLAGES (Dörfer / Gemeindeteile)
-- ============================================================
create table villages (
  id uuid default gen_random_uuid() primary key,
  gemeinde_id uuid references gemeinden(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

alter table villages enable row level security;
create policy "Dörfer sind öffentlich lesbar" on villages for select using (true);

-- ============================================================
-- BESTEHENDE TABELLEN ERWEITERN
-- ============================================================
alter table profiles add column gemeinde_id uuid references gemeinden(id);
alter table profiles add column village_id uuid references villages(id);

alter table clubs add column gemeinde_id uuid references gemeinden(id);
alter table clubs add column village_id uuid references villages(id);

alter table news add column gemeinde_id uuid references gemeinden(id);
alter table news add column village_id uuid references villages(id);

alter table events add column gemeinde_id uuid references gemeinden(id);
alter table events add column village_id uuid references villages(id);

alter table helper_lists add column gemeinde_id uuid references gemeinden(id);
alter table helper_lists add column village_id uuid references villages(id);

-- ============================================================
-- TRIGGER: Profil bei Registrierung mit Dorf und Gemeinde anlegen
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, first_name, last_name, phone, village_id, gemeinde_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'village_id')::uuid,
    (new.raw_user_meta_data->>'gemeinde_id')::uuid
  );
  return new;
end;
$$ language plpgsql security definer;

-- ============================================================
-- SEED: Gemeinde Wasserlosen + 8 Gemeindeteile
-- ============================================================
insert into gemeinden (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Gemeinde Wasserlosen', 'wasserlosen');

insert into villages (gemeinde_id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Brebersdorf'),
  ('11111111-1111-1111-1111-111111111111', 'Burghausen'),
  ('11111111-1111-1111-1111-111111111111', 'Greßthal'),
  ('11111111-1111-1111-1111-111111111111', 'Kaisten'),
  ('11111111-1111-1111-1111-111111111111', 'Rütschenhausen'),
  ('11111111-1111-1111-1111-111111111111', 'Schwemmelsbach'),
  ('11111111-1111-1111-1111-111111111111', 'Wasserlosen'),
  ('11111111-1111-1111-1111-111111111111', 'Wülfershausen');
