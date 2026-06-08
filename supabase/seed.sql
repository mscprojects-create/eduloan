-- EduLoan demo seed. Run AFTER migrations. Safe to re-run (truncates demo rows).
-- These applications use synthetic student_ids (no login) purely to populate the
-- admin queue with realistic data. Your own registered student account will create
-- its own live applications through the app.

truncate table public.repayments, public.disbursements, public.documents,
  public.application_details, public.applications restart identity cascade;

insert into public.applications
  (id, student_id, applicant_name, applicant_email, course_name, university,
   course_duration_months, requested_amount, tenure_months, status, admin_remark,
   submitted_at, decided_at, created_at)
values
  ('a1111111-1111-4111-8111-111111111111','d1111111-1111-4111-8111-111111111111',
   'Ananya Krishnan','ananya.krishnan@gmail.com','MS in Computer Science',
   'University of Toronto',24,120000,60,'Under Review',null,
   now()-interval '12 days',null,now()-interval '12 days'),
  ('a2222222-2222-4222-8222-222222222222','d2222222-2222-4222-8222-222222222222',
   'Rohan Mehta','rohan.mehta@outlook.com','MBA',
   'INSEAD',12,148500,84,'Approved','Strong guarantor income; sanctioned in full.',
   now()-interval '40 days',now()-interval '33 days',now()-interval '40 days'),
  ('a3333333-3333-4333-8333-333333333333','d3333333-3333-4333-8333-333333333333',
   'Priya Sundaram','priya.s@yahoo.com','MSc Data Science',
   'Imperial College London',12,95000,48,'Submitted',null,
   now()-interval '3 days',null,now()-interval '3 days'),
  ('a4444444-4444-4444-8444-444444444444','d4444444-4444-4444-8444-444444444444',
   'Vikram Reddy','vikram.reddy@gmail.com','MEng Mechanical Engineering',
   'TU Munich',24,72000,60,'Rejected','Insufficient academic documentation.',
   now()-interval '55 days',now()-interval '50 days',now()-interval '55 days'),
  ('a5555555-5555-4555-8555-555555555555','d5555555-5555-4555-8555-555555555555',
   'Fatima Sheikh','fatima.sheikh@gmail.com','MA International Relations',
   'Sciences Po',24,68000,60,'Under Review',null,
   now()-interval '8 days',null,now()-interval '8 days'),
  ('a6666666-6666-4666-8666-666666666666','d6666666-6666-4666-8666-666666666666',
   'Arjun Nair','arjun.nair@protonmail.com','MS Artificial Intelligence',
   'Carnegie Mellon University',16,135000,72,'Approved','Approved with standard terms.',
   now()-interval '70 days',now()-interval '64 days',now()-interval '70 days'),
  ('a7777777-7777-4777-8777-777777777777','d7777777-7777-4777-8777-777777777777',
   'Sneha Patil','sneha.patil@gmail.com','MSc Nursing',
   'University of Melbourne',18,54000,48,'Submitted',null,
   now()-interval '1 days',null,now()-interval '1 days'),
  -- edge case: unusually low amount + non-standard course name
  ('a8888888-8888-4888-8888-888888888888','d8888888-8888-4888-8888-888888888888',
   'Kabir Singh','kabir.singh@gmail.com','Postgraduate Diploma in Scommercial Beekeeping & Apiary Management',
   'Massey University',9,10500,24,'Submitted',null,
   now()-interval '5 days',null,now()-interval '5 days'),
  -- edge case: very high amount near ceiling
  ('a9999999-9999-4999-8999-999999999999','d9999999-9999-4999-8999-999999999999',
   'Meera Iyer','meera.iyer@gmail.com','MD Clinical Medicine',
   'Karolinska Institute',36,150000,96,'Under Review',null,
   now()-interval '15 days',null,now()-interval '15 days'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   'Daniel Thomas','daniel.t@gmail.com','MSc Renewable Energy',
   'KTH Royal Institute',24,88000,60,'Rejected','Co-applicant credit profile did not meet threshold.',
   now()-interval '48 days',now()-interval '44 days',now()-interval '48 days');

insert into public.application_details
  (application_id, phone, address, prev_qualification, prev_score,
   guarantor_name, guarantor_relation, guarantor_income)
values
  ('a1111111-1111-4111-8111-111111111111','+91 98840 21234','14 MG Road, Bengaluru 560001','B.Tech CSE','8.7 CGPA','Suresh Krishnan','Father',1450000),
  ('a2222222-2222-4222-8222-222222222222','+91 99203 55621','7 Carter Road, Mumbai 400050','B.Com','82%','Anil Mehta','Father',2600000),
  ('a3333333-3333-4333-8333-333333333333','+91 90031 77410','22 Anna Nagar, Chennai 600040','BSc Statistics','9.1 CGPA','Lakshmi Sundaram','Mother',1200000),
  -- edge case: missing phone (null) and missing guarantor
  ('a4444444-4444-4444-8444-444444444444',null,'5 Banjara Hills, Hyderabad 500034','B.E Mechanical','71%',null,null,null),
  ('a5555555-5555-4555-8555-555555555555','+91 98119 30022','3 Vasant Vihar, New Delhi 110057','BA Political Science','78%','Imran Sheikh','Father',980000),
  ('a6666666-6666-4666-8666-666666666666','+91 96321 44518','19 Indiranagar, Bengaluru 560038','B.Tech IT','9.4 CGPA','Radha Nair','Mother',1750000),
  ('a7777777-7777-4777-8777-777777777777','+91 90288 61190','11 Koregaon Park, Pune 411001','BSc Nursing','76%','Ramesh Patil','Father',640000),
  -- edge case: guarantor income unusually high relative to small loan
  ('a8888888-8888-4888-8888-888888888888','+91 94250 18833','Plot 6, Civil Lines, Jaipur 302006','BA Sociology','69%','Harpreet Singh','Uncle',8900000),
  ('a9999999-9999-4999-8999-999999999999','+91 99876 12000','45 Alwarpet, Chennai 600018','MBBS','88%','Gopal Iyer','Father',3100000),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','+91 90042 70551','8 Salt Lake, Kolkata 700091','B.Tech EEE','7.9 CGPA','Mary Thomas','Mother',1050000);

-- Disbursements for the two Approved applications
insert into public.disbursements
  (application_id, principal, annual_rate, tenure_months, emi, total_payable, sanction_ref, disbursed_at)
values
  ('a2222222-2222-4222-8222-222222222222',148500,10.5,84,2503.41,210286.44,'SANC-2026-000231',now()-interval '32 days'),
  ('a6666666-6666-4666-8666-666666666666',135000,10.5,72,2536.97,182661.84,'SANC-2026-000198',now()-interval '63 days');

-- A couple of EMI repayments already made on one approved loan
insert into public.repayments
  (application_id, txn_ref, amount, installment_no, paid_at)
values
  ('a6666666-6666-4666-8666-666666666666','TXN-7H2K9Q0',2536.97,1,now()-interval '33 days'),
  ('a6666666-6666-4666-8666-666666666666','TXN-3P5M1ZX',2536.97,2,now()-interval '3 days');

-- ============================================================
-- AFTER you register your admin account through the app, run:
--   update public.profiles set role='admin' where email='YOUR_ADMIN_EMAIL';
-- ============================================================
