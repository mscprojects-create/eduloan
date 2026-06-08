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
