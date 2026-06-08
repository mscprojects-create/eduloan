import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { calculateEMI, totalPayable } from "@/lib/emi";
import { ANNUAL_INTEREST_RATE } from "@/lib/constants";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { applicationId, decision, remark } = await request.json();
  if (!["Approved", "Rejected", "Under Review"].includes(decision)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: app } = await admin.from("applications").select("*").eq("id", applicationId).single();
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch: any = { status: decision, admin_remark: remark || null, updated_at: new Date().toISOString() };
  if (decision === "Approved" || decision === "Rejected") patch.decided_at = new Date().toISOString();
  await admin.from("applications").update(patch).eq("id", applicationId);

  if (decision === "Approved") {
    const principal = Number(app.requested_amount) || 0;
    const tenure = Number(app.tenure_months) || 60;
    const emi = Math.round(calculateEMI(principal, ANNUAL_INTEREST_RATE, tenure) * 100) / 100;
    const total = totalPayable(principal, ANNUAL_INTEREST_RATE, tenure);
    const ref = "SANC-" + new Date().getFullYear() + "-" + Math.floor(100000 + Math.random() * 900000);

    const { data: existing } = await admin.from("disbursements").select("id").eq("application_id", applicationId).maybeSingle();
    if (!existing) {
      await admin.from("disbursements").insert({
        application_id: applicationId, principal, annual_rate: ANNUAL_INTEREST_RATE,
        tenure_months: tenure, emi, total_payable: total, sanction_ref: ref,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
