-- Add the 'investor' role and staff helpers (admin + investor).

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('student','admin','investor'));

create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','investor'));
$$;

create or replace function public.is_investor()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'investor');
$$;

-- Widen staff read/manage access from admin-only to all staff (admin + investor).
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (id = auth.uid() or public.is_staff());

drop policy if exists app_select on public.applications;
create policy app_select on public.applications
  for select using (student_id = auth.uid() or public.is_staff());
drop policy if exists app_update on public.applications;
create policy app_update on public.applications
  for update using (student_id = auth.uid() or public.is_staff());

drop policy if exists det_all on public.application_details;
create policy det_all on public.application_details
  for all using (public.owns_application(application_id) or public.is_staff())
  with check (public.owns_application(application_id) or public.is_staff());

drop policy if exists doc_all on public.documents;
create policy doc_all on public.documents
  for all using (public.owns_application(application_id) or public.is_staff())
  with check (public.owns_application(application_id) or public.is_staff());

drop policy if exists dis_select on public.disbursements;
create policy dis_select on public.disbursements
  for select using (public.owns_application(application_id) or public.is_staff());
drop policy if exists dis_write on public.disbursements;
create policy dis_write on public.disbursements
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists rep_select on public.repayments;
create policy rep_select on public.repayments
  for select using (public.owns_application(application_id) or public.is_staff());
