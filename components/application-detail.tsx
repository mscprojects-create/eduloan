import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { DecisionPanel } from "@/components/decision-panel";
import { formatINR, formatDate } from "@/lib/utils";
import { calculateEMI, totalPayable } from "@/lib/emi";
import { ANNUAL_INTEREST_RATE } from "@/lib/constants";

export async function ApplicationDetail({ id, mode, backHref }: { id: string; mode: "officer" | "investor"; backHref: string }) {
  const supabase = await createClient();
  const { data: app } = await supabase.from("applications").select("*").eq("id", id).single();
  if (!app) notFound();

  const { data: details } = await supabase.from("application_details").select("*").eq("application_id", app.id).maybeSingle();
  const { data: documents } = await supabase.from("documents").select("*").eq("application_id", app.id);

  const admin = createAdminClient();
  const docs = await Promise.all((documents ?? []).map(async (d: any) => {
    const { data } = await admin.storage.from("loan-documents").createSignedUrl(d.file_path, 600);
    return { ...d, url: data?.signedUrl ?? null };
  }));

  const emi = app.requested_amount ? calculateEMI(app.requested_amount, ANNUAL_INTEREST_RATE, app.tenure_months) : 0;
  const total = app.requested_amount ? totalPayable(app.requested_amount, ANNUAL_INTEREST_RATE, app.tenure_months) : 0;

  return (
    <div className="space-y-6">
      <Link href={backHref} className="text-sm text-zinc-400 hover:text-zinc-200">← Back to queue</Link>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{app.applicant_name}</h1>
          <p className="text-sm text-zinc-500">{app.applicant_email} · applied {formatDate(app.created_at)}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Academic & loan details">
            <Row k="Course" v={app.course_name} />
            <Row k="University" v={app.university} />
            <Row k="Course duration" v={app.course_duration_months ? `${app.course_duration_months} months` : "—"} />
            <Row k="Requested amount" v={app.requested_amount ? formatINR(app.requested_amount) : "—"} />
            <Row k="Tenure" v={`${app.tenure_months} months`} />
            <Row k={`Est. EMI @ ${ANNUAL_INTEREST_RATE}%`} v={formatINR(emi)} />
            <Row k="Total payable" v={formatINR(total)} />
          </Section>
          <Section title="Personal & guarantor">
            <Row k="Phone" v={details?.phone ?? "—"} />
            <Row k="Address" v={details?.address ?? "—"} />
            <Row k="Prev. qualification" v={details?.prev_qualification ?? "—"} />
            <Row k="Score" v={details?.prev_score ?? "—"} />
            <Row k="Guarantor" v={details?.guarantor_name ? `${details.guarantor_name} (${details.guarantor_relation ?? "—"})` : "—"} />
            <Row k="Guarantor income" v={details?.guarantor_income ? formatINR(details.guarantor_income) : "—"} />
          </Section>
          <Section title={`Documents (${docs.length})`}>
            {docs.length === 0 ? <p className="text-sm text-zinc-500">No documents uploaded.</p> : (
              <div className="grid gap-2">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm">
                    <span>{d.doc_type}</span>
                    {d.url ? <a href={d.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">View / download</a> : <span className="text-zinc-600">unavailable</span>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
        <div className="lg:col-span-1">
          <DecisionPanel mode={mode} applicationId={app.id} status={app.status}
            principal={app.requested_amount ?? 0} tenure={app.tenure_months} existingRemark={app.admin_remark ?? ""} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string | null }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-2 text-sm">
      <span className="text-zinc-500">{k}</span><span className="font-medium text-zinc-100">{v ?? "—"}</span>
    </div>
  );
}
