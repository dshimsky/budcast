-- Phase 1: Storage buckets for user-uploaded media.

-- Portfolio bucket: creator portfolio images. Public read, owner write.
insert into storage.buckets (id, name, public)
values ('portfolios', 'portfolios', true)
on conflict (id) do nothing;

-- Avatar bucket: user profile photos. Public read, owner write.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Campaign images bucket: brand-uploaded campaign hero images. Public read, owner write.
insert into storage.buckets (id, name, public)
values ('campaign-images', 'campaign-images', true)
on conflict (id) do nothing;

-- RLS: anyone can read images (so creator profiles are publicly viewable)
create policy "Public can read portfolio images"
  on storage.objects for select
  using ( bucket_id = 'portfolios' );

create policy "Public can read avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Public can read campaign images"
  on storage.objects for select
  using ( bucket_id = 'campaign-images' );

-- RLS: authenticated users can only upload to their own folder {user_id}/...
create policy "Users upload to own portfolio folder"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolios'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users upload to own avatar folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users upload to own campaign folder"
  on storage.objects for insert
  with check (
    bucket_id = 'campaign-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: users can only delete/update their own uploads
create policy "Users manage own portfolio uploads"
  on storage.objects for delete
  using (
    bucket_id = 'portfolios'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users manage own avatar uploads"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users manage own campaign uploads"
  on storage.objects for delete
  using (
    bucket_id = 'campaign-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
