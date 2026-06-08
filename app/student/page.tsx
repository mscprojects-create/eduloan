import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { RepaymentPanel } from "@/components/repayment-panel";
import { formatINR, formatDate } from "@/lib/utils";

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: apps } = await supabase
    .from("applications")
    .select("*")
    .eq("student_id", user!.id)
    .order("created_at", { ascending: false });

  const applications = apps ?? [];
  const latest = applications[0];

  let disb: any = null;
  let reps: any[] = [];
  if (latest && latest.status === "Approved") {
    const { data: d } = await supabase
      .from("disbursements").select("*").eq("application_id", latest.id).single();
    disb = d;
    const { data: r } = await supabase
      .from("repayments").select("*").eq("application_id", latest.id).order("installment_no");
    reps = r ?? [];
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your applications</h1>
          <p className="mt-1 text-sm text-zinc-500">Track status and manage your loan.</p>
        </div>
        <Link href="/student/apply"><Button>+ New application</Button></Link>
      </div>

      {applications.length === 0 ? (
        <div className="glass grid place-items-center rounded-2xl p-16 text-center">
          <p className="text-zinc-400">You haven&apos;t applied yet.</p>
          <Link href="/student/apply" className="mt-4"><Button>Start your application</Button></Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {applications.map((a) => (
            <div key={a.id} className="glass flex items-center justify-between rounded-xl p-5">
              <div>
                <div className="font-medium">{a.course_name ?? "Untitled application"}</div>
                <div className="text-sm text-zinc-500">
                  {a.university ?? "—"} · {a.requested_amount ? formatINR(a.requested_amount) : "—"} · {formatDate(a.created_at)}
                </div>
                {a.admin_remark && (
                  <div className="mt-2 text-sm text-zinc-400">Remark: {a.admin_remark}</div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={a.status} />
                {a.status === "Draft" && (
                  <Link href="/student/apply" className="text-sm text-indigo-400 hover:underline">Continue</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {disb && (
        <RepaymentPanel
          disb={disb}
          initialRepayments={reps}
          applicant={latest.applicant_name ?? user!.email!}
          course={latest.course_name ?? ""}
        />
      )}
    </div>
  );
}
