import { createClient } from "@/lib/supabase/server";
import { AdminQueue } from "@/components/admin-queue";

export default async function InvestorDashboard() {
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("applications")
    .select("id, applicant_name, course_name, university, requested_amount, status, submitted_at, created_at")
    .neq("status", "Draft")
    .order("created_at", { ascending: false });
  const list = apps ?? [];
  const awaiting = list.filter((a) => a.status === "Under Review").length;
  const approved = list.filter((a) => a.status === "Approved").length;
  const funded = list.filter((a) => a.status === "Approved")
    .reduce((s, a) => s + (Number(a.requested_amount) || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Funding queue</h1>
        <p className="mt-1 text-sm text-zinc-500">Vetted applications awaiting your approve / reject decision.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile label="Awaiting decision" value={awaiting} accent />
        <Tile label="Approved & funded" value={approved} />
        <Tile label="Capital deployed" value={funded.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })} />
      </div>
      <AdminQueue apps={list} basePath="/investor/applications" />
    </div>
  );
}
function Tile({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (<div className={`glass rounded-xl p-5 ${accent ? "ring-1 ring-accent/30" : ""}`}>
    <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
    <div className="mt-1 text-3xl font-bold">{value}</div></div>);
}
