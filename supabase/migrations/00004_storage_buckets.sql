-- Migration: 00004_storage_buckets.sql
-- Description: Provision Supabase Storage buckets and access policies for receipts/quotes.

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "receipts_upload_authenticated" on storage.objects for insert to authenticated
with check (bucket_id = 'receipts');

create policy "receipts_read_authenticated" on storage.objects for select to authenticated
using (bucket_id = 'receipts');

create policy "receipts_delete_authenticated" on storage.objects for delete to authenticated
using (bucket_id = 'receipts' and (auth.uid() = owner or exists (select 1 from public.profiles where id = auth.uid() and role in ('officer', 'admin'))));
