-- EduLoan schema
create extension if not exists pgcrypto;

-- Profiles (one row per auth user; id mirrors auth.users.id)
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  applicant_name text,
  applicant_email text,
  course_name text,
  university text,
  course_duration_months int,
  requested_amount numeric,
  tenure_months int default 60,
  status text not null default 'Draft'
    check (status in ('Draft','Submitted','Under Review','Approved','Rejected')),
  admin_remark text,
  submitted_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists applications_student_idx on public.applications(student_id);
create index if not exists applications_status_idx on public.applications(status);

create table if not exists public.application_details (
  application_id uuid primary key references public.applications(id) on delete cascade,
  phone text,
  address text,
  prev_qualification text,
  prev_score text,
  guarantor_name text,
  guarantor_relation text,
  guarantor_income numeric
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  doc_type text not null,
  file_path text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.disbursements (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  principal numeric not null,
  annual_rate numeric not null,
  tenure_months int not null,
  emi numeric not null,
  total_payable numeric not null,
  sanction_ref text not null,
  disbursed_at timestamptz not null default now()
);

create table if not exists public.repayments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  txn_ref text not null,
  amount numeric not null,
  installment_no int,
  paid_at timestamptz not null default now()
);
-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.owns_application(app uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.applications
    where id = app and student_id = auth.uid()
  );
$$;
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

-- ===== 0005_investor =====
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
