alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.application_details enable row level security;
alter table public.documents enable row level security;
alter table public.disbursements enable row level security;
alter table public.repayments enable row level security;

-- profiles
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid());

-- applications
drop policy if exists app_select on public.applications;
create policy app_select on public.applications
  for select using (student_id = auth.uid() or public.is_admin());
drop policy if exists app_insert on public.applications;
create policy app_insert on public.applications
  for insert with check (student_id = auth.uid());
drop policy if exists app_update on public.applications;
create policy app_update on public.applications
  for update using (student_id = auth.uid() or public.is_admin());

-- application_details
drop policy if exists det_all on public.application_details;
create policy det_all on public.application_details
  for all using (public.owns_application(application_id) or public.is_admin())
  with check (public.owns_application(application_id) or public.is_admin());

-- documents
drop policy if exists doc_all on public.documents;
create policy doc_all on public.documents
  for all using (public.owns_application(application_id) or public.is_admin())
  with check (public.owns_application(application_id) or public.is_admin());

-- disbursements (admin writes; owner/admin read)
drop policy if exists dis_select on public.disbursements;
create policy dis_select on public.disbursements
  for select using (public.owns_application(application_id) or public.is_admin());
drop policy if exists dis_write on public.disbursements;
create policy dis_write on public.disbursements
  for all using (public.is_admin()) with check (public.is_admin());

-- repayments (owner pays; owner/admin read)
drop policy if exists rep_select on public.repayments;
create policy rep_select on public.repayments
  for select using (public.owns_application(application_id) or public.is_admin());
drop policy if exists rep_insert on public.repayments;
create policy rep_insert on public.repayments
  for insert with check (public.owns_application(application_id));
