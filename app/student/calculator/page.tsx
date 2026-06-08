import { EmiCalculator } from "@/components/emi-calculator";

export default function StudentCalculatorPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">EMI Calculator</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Plan your repayment. Adjust the amount, rate, and tenure, then expand the full schedule.
      </p>
      <div className="mt-6">
        <EmiCalculator />
      </div>
    </div>
  );
}
