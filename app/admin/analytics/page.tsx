import { createClient } from "@/lib/supabase/server";
import { BarChart } from "@/components/bar-chart";
import { formatINR } from "@/lib/utils";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("applications")
    .select("status, requested_amount")
    .neq("status", "Draft");
  const { data: disb } = await supabase
    .from("disbursements")
    .select("principal, total_payable");

  const list = apps ?? [];
  const count = (s: string) => list.filter((a) => a.status === s).length;
  const approved = count("Approved");
  const rejected = count("Rejected");
  const decided = approved + rejected;
  const approvalRate = decided ? Math.round((approved / decided) * 100) : 0;
  const totalRequested = list.reduce((s, a) => s + (Number(a.requested_amount) || 0), 0);
  const totalDisbursed = (disb ?? []).reduce((s, d) => s + (Number(d.principal) || 0), 0);
  const portfolioValue = (disb ?? []).reduce((s, d) => s + (Number(d.total_payable) || 0), 0);

  const statusData = [
    { label: "Submitted", value: count("Submitted"), color: "#3b82f6" },
    { label: "Under Review", value: count("Under Review"), color: "#f59e0b" },
    { label: "Approved", value: approved, color: "#10b981" },
    { label: "Rejected", value: rejected, color: "#f43f5e" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">Portfolio overview across all loan applications.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total applications" value={String(list.length)} />
        <Kpi label="Approval rate" value={`${approvalRate}%`} accent />
        <Kpi label="Total disbursed" value={formatINR(totalDisbursed)} />
        <Kpi label="Requested (pipeline)" value={formatINR(totalRequested)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-zinc-400">Applications by status</h3>
          <BarChart data={statusData} />
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-zinc-400">Portfolio</h3>
          <div className="space-y-4">
            <Metric label="Active loans" value={String((disb ?? []).length)} />
            <Metric label="Principal disbursed" value={formatINR(totalDisbursed)} />
            <Metric label="Total receivable (w/ interest)" value={formatINR(portfolioValue)} />
            <Metric label="Projected interest income" value={formatINR(Math.max(0, portfolioValue - totalDisbursed))} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`glass rounded-xl p-5 ${accent ? "ring-1 ring-accent/30" : ""}`}>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="font-semibold text-zinc-100">{value}</span>
    </div>
  );
}
