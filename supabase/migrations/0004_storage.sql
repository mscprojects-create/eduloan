-- Private bucket for uploaded loan documents
insert into storage.buckets (id, name, public)
values ('loan-documents', 'loan-documents', false)
on conflict (id) do nothing;

-- Path convention: <applicationId>/<filename>
drop policy if exists docs_owner_rw on storage.objects;
create policy docs_owner_rw on storage.objects
  for all to authenticated
  using (
    bucket_id = 'loan-documents'
    and (public.owns_application(((storage.foldername(name))[1])::uuid) or public.is_admin())
  )
  with check (
    bucket_id = 'loan-documents'
    and public.owns_application(((storage.foldername(name))[1])::uuid)
  );
