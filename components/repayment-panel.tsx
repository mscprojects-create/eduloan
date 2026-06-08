"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/utils";
import { PDFDownloadLink } from "@/components/pdf/download-link";
import { ReceiptPDF, SanctionLetterPDF } from "@/components/pdf/documents";

type Disb = {
  application_id: string; principal: number; annual_rate: number;
  tenure_months: number; emi: number; total_payable: number; sanction_ref: string;
};
type Rep = { id: string; txn_ref: string; amount: number; installment_no: number | null; paid_at: string };

export function RepaymentPanel({
  disb, initialRepayments, applicant, course,
}: {
  disb: Disb; initialRepayments: Rep[]; applicant: string; course: string;
}) {
  const supabase = createClient();
  const [reps, setReps] = useState<Rep[]>(initialRepayments);
  const [paying, setPaying] = useState(false);

  const paid = reps.length;
  const nextInstallment = paid + 1;
  const remaining = Math.max(0, disb.tenure_months - paid);

  async function payEMI() {
    setPaying(true);
    const txn = "TXN-" + Math.random().toString(36).slice(2, 9).toUpperCase();
    const { data, error } = await supabase
      .from("repayments")
      .insert({
        application_id: disb.application_id,
        txn_ref: txn,
        amount: disb.emi,
        installment_no: nextInstallment,
      })
      .select()
      .single();
    setPaying(false);
    if (!error && data) setReps((r) => [...r, data as Rep]);
    else alert(error?.message ?? "Payment failed");
  }

  const sanctionData = {
    ref: disb.sanction_ref, applicant, course,
    principal: formatINR(disb.principal), rate: `${disb.annual_rate}%`,
    tenure: `${disb.tenure_months} months`, emi: formatINR(disb.emi),
    total: formatINR(disb.total_payable), date: formatDate(new Date()),
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Repayment</h3>
        <PDFDownloadLink
          document={<SanctionLetterPDF d={sanctionData} />}
          fileName={`sanction-${disb.sanction_ref}.pdf`}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
        >
          Download sanction letter
        </PDFDownloadLink>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Box label="Monthly EMI" value={formatINR(disb.emi)} />
        <Box label="Paid" value={`${paid} / ${disb.tenure_months}`} />
        <Box label="Installments left" value={String(remaining)} />
      </div>

      <Button onClick={payEMI} disabled={paying || remaining === 0} className="mt-5 w-full">
        {remaining === 0 ? "Loan fully repaid 🎉" : paying ? "Processing…" : `Pay EMI #${nextInstallment} · ${formatINR(disb.emi)}`}
      </Button>

      {reps.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Payment history</div>
          <div className="divide-y divide-white/5 rounded-lg border border-white/10">
            {reps.slice().reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div>
                  <div className="font-medium">EMI #{r.installment_no} · {r.txn_ref}</div>
                  <div className="text-xs text-zinc-500">{formatDate(r.paid_at)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-200">{formatINR(r.amount)}</span>
                  <PDFDownloadLink
                    document={
                      <ReceiptPDF d={{
                        txn: r.txn_ref, applicant, ref: disb.sanction_ref,
                        installment: String(r.installment_no ?? ""), amount: formatINR(r.amount),
                        date: formatDate(r.paid_at),
                      }} />
                    }
                    fileName={`receipt-${r.txn_ref}.pdf`}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Receipt
                  </PDFDownloadLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
