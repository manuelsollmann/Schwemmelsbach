-- Drop old permissive policy that allowed authors to edit their own news
drop policy if exists "Autoren können eigene News bearbeiten" on news;

-- Helper function condition: is global admin OR is club_admin for this club
-- Used inline below

-- News: update + delete for club_admin (their club) or global admin
create policy "Admins können News bearbeiten" on news for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or (
    exists (select 1 from profiles where id = auth.uid() and role = 'club_admin')
    and exists (select 1 from club_memberships where user_id = auth.uid() and club_id = news.club_id and role = 'admin')
  )
);

create policy "Admins können News löschen" on news for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or (
    exists (select 1 from profiles where id = auth.uid() and role = 'club_admin')
    and exists (select 1 from club_memberships where user_id = auth.uid() and club_id = news.club_id and role = 'admin')
  )
);

-- Events: update + delete for club_admin (their club) or global admin
create policy "Admins können Events bearbeiten" on events for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or (
    exists (select 1 from profiles where id = auth.uid() and role = 'club_admin')
    and exists (select 1 from club_memberships where user_id = auth.uid() and club_id = events.club_id and role = 'admin')
  )
);

create policy "Admins können Events löschen" on events for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or (
    exists (select 1 from profiles where id = auth.uid() and role = 'club_admin')
    and exists (select 1 from club_memberships where user_id = auth.uid() and club_id = events.club_id and role = 'admin')
  )
);

-- Helper lists: update + delete for club_admin (their club) or global admin
create policy "Admins können Helferlisten bearbeiten" on helper_lists for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or (
    exists (select 1 from profiles where id = auth.uid() and role = 'club_admin')
    and exists (select 1 from club_memberships where user_id = auth.uid() and club_id = helper_lists.club_id and role = 'admin')
  )
);

create policy "Admins können Helferlisten löschen" on helper_lists for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or (
    exists (select 1 from profiles where id = auth.uid() and role = 'club_admin')
    and exists (select 1 from club_memberships where user_id = auth.uid() and club_id = helper_lists.club_id and role = 'admin')
  )
);

-- Helper slots: update + delete based on the parent list's club
create policy "Admins können Helfer-Slots bearbeiten" on helper_slots for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or (
    exists (select 1 from profiles where id = auth.uid() and role = 'club_admin')
    and exists (
      select 1 from helper_lists hl
      join club_memberships cm on cm.club_id = hl.club_id
      where hl.id = helper_slots.list_id and cm.user_id = auth.uid() and cm.role = 'admin'
    )
  )
);

create policy "Admins können Helfer-Slots löschen" on helper_slots for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or (
    exists (select 1 from profiles where id = auth.uid() and role = 'club_admin')
    and exists (
      select 1 from helper_lists hl
      join club_memberships cm on cm.club_id = hl.club_id
      where hl.id = helper_slots.list_id and cm.user_id = auth.uid() and cm.role = 'admin'
    )
  )
);
