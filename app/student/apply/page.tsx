import { ApplyWizard } from "@/components/apply-wizard";

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Loan application</h1>
      <p className="mt-1 text-sm text-zinc-500">Complete the steps below. Your progress is saved as a draft.</p>
      <div className="mt-6"><ApplyWizard /></div>
    </div>
  );
}
