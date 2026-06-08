import { createClient } from "@/lib/supabase/server";
import { AdminQueue } from "@/components/admin-queue";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("applications")
    .select("id, applicant_name, course_name, university, requested_amount, status, submitted_at, created_at")
    .neq("status", "Draft")
    .order("created_at", { ascending: false });

  const list = apps ?? [];
  const counts = {
    total: list.length,
    review: list.filter((a) => a.status === "Under Review" || a.status === "Submitted").length,
    approved: list.filter((a) => a.status === "Approved").length,
    rejected: list.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Application queue</h1>
        <p className="mt-1 text-sm text-zinc-500">Review, verify, and decide on incoming loan applications.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Total" value={counts.total} />
        <Tile label="Awaiting review" value={counts.review} accent />
        <Tile label="Approved" value={counts.approved} />
        <Tile label="Rejected" value={counts.rejected} />
      </div>

      <AdminQueue apps={list} />
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`glass rounded-xl p-5 ${accent ? "ring-1 ring-accent/30" : ""}`}>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
    </div>
  );
}
