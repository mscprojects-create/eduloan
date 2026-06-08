# EduLoan — Student Loan Management System

A full-stack demo of an educational loan portal: students apply, upload documents,
track status, and repay EMIs; admins review applications and approve/reject them.
All money, receipts, and sanction letters are **simulated** (every PDF is watermarked
"SAMPLE / DEMO — NOT A FINANCIAL INSTRUMENT").

**Stack:** Next.js 14 (App Router) · Supabase (Postgres + Auth + Storage + RLS) ·
Tailwind CSS · @react-pdf/renderer · deploys to Vercel.

---

## 1. Supabase setup

1. Create a project at https://supabase.com (free tier is fine).
2. Open **SQL Editor** → **New query**, paste the entire contents of
   [`supabase/setup.sql`](supabase/setup.sql), and **Run**. This creates all tables,
   the signup trigger, RLS policies, and the documents storage bucket.
3. (Optional, recommended) Open a new query, paste
   [`supabase/seed.sql`](supabase/seed.sql), and **Run** to populate the admin queue
   with 10 realistic sample applications.
4. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
5. **Turn off email confirmation** for the demo: Authentication → Providers → Email →
   disable "Confirm email" (lets you log in immediately after registering).

### Making yourself an admin
Register an account through the app, then in the Supabase SQL editor run:
```sql
update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';
```
Sign out and back in — you'll land on the admin dashboard.

## 2. Run locally
```bash
npm install
cp .env.example .env.local   # then fill in the 3 values from step 4
npm run dev                  # http://localhost:3000
```

## 3. Deploy to Vercel
1. Push this folder to a GitHub repo.
2. On vercel.com → **Add New → Project** → import the repo (framework auto-detected as Next.js).
3. Add the three environment variables (same as `.env.local`) under **Environment Variables**.
4. **Deploy.**

## Project structure
```
app/                  routes (landing, auth, /student, /admin, /api)
components/           UI primitives, wizard, queue, decision panel, PDF docs
lib/                  supabase clients, emi math, constants, utils
supabase/migrations/  0001 schema · 0002 auth+helpers · 0003 RLS · 0004 storage
supabase/setup.sql    all migrations combined (one-paste)
supabase/seed.sql     10 realistic demo applications
```

## Notes
- Role-based access is enforced at the **database layer** via Postgres RLS, not just the UI.
- Admin approval runs the EMI engine server-side and records a disbursement + sanction reference.
- This is a demonstration project; it is not a real financial product.
