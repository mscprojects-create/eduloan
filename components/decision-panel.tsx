"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { calculateEMI, totalPayable } from "@/lib/emi";
import { formatINR } from "@/lib/utils";
import { ANNUAL_INTEREST_RATE } from "@/lib/constants";

export function DecisionPanel({
  applicationId, status, principal, tenure, existingRemark,
}: {
  applicationId: string; status: string; principal: number; tenure: number; existingRemark: string;
}) {
  const router = useRouter();
  const [remark, setRemark] = useState(existingRemark);
  const [busy, setBusy] = useState(false);
  const decided = status === "Approved" || status === "Rejected";

  const emi = calculateEMI(principal, ANNUAL_INTEREST_RATE, tenure);

  async function decide(decision: "Approved" | "Rejected" | "Under Review") {
    setBusy(true);
    const res = await fetch("/api/admin/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, decision, remark }),
    });
    setBusy(false);
    if (!res.ok) { const j = await res.json().catch(() => ({})); return alert(j.error ?? "Failed"); }
    router.refresh();
  }

  return (
    <div className="glass sticky top-20 rounded-2xl p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Decision</h3>

      <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm">
        <div className="text-zinc-400">On approval, this disburses:</div>
        <div className="mt-1 font-semibold text-indigo-200">{formatINR(principal)} @ {ANNUAL_INTEREST_RATE}%</div>
        <div className="text-zinc-300">EMI {formatINR(emi)} × {tenure} mo · total {formatINR(totalPayable(principal, ANNUAL_INTEREST_RATE, tenure))}</div>
      </div>

      <label className="mt-4 mb-1.5 block text-xs font-medium text-zinc-400">Remark</label>
      <textarea
        value={remark} onChange={(e) => setRemark(e.target.value)}
        rows={3} placeholder="Reason for decision…"
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
      />

      {decided ? (
        <p className="mt-4 text-sm text-zinc-400">Decision recorded: <b>{status}</b>. You can still update it below.</p>
      ) : null}

      <div className="mt-4 space-y-2">
        {status === "Submitted" && (
          <Button variant="outline" className="w-full" disabled={busy} onClick={() => decide("Under Review")}>
            Move to Under Review
          </Button>
        )}
        <Button className="w-full" disabled={busy} onClick={() => decide("Approved")}>
          {busy ? "Working…" : "Approve & disburse"}
        </Button>
        <Button variant="danger" className="w-full" disabled={busy} onClick={() => decide("Rejected")}>
          Reject
        </Button>
      </div>
    </div>
  );
}
