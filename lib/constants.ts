export const STATUSES = ["Submitted", "Under Review", "Approved", "Rejected"] as const;
export type LoanStatus = (typeof STATUSES)[number] | "Draft";

export const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-zinc-800 text-zinc-300 border-zinc-700",
  Submitted: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  "Under Review": "bg-amber-500/10 text-amber-300 border-amber-500/30",
  Approved: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  Rejected: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

// Demo lending parameters
export const ANNUAL_INTEREST_RATE = 10.5; // %
export const DEMO_BANK = "EduLoan Demo Finance Pvt. Ltd.";
export const DEMO_WATERMARK = "SAMPLE / DEMO — NOT A FINANCIAL INSTRUMENT";
