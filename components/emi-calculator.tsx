"use client";

import { useState, useMemo } from "react";
import { calculateEMI, totalPayable } from "@/lib/emi";
import { formatINR } from "@/lib/utils";
import { ANNUAL_INTEREST_RATE } from "@/lib/constants";

export function EmiCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(ANNUAL_INTEREST_RATE);
  const [months, setMonths] = useState(60);

  const { emi, total, interest } = useMemo(() => {
    const e = calculateEMI(principal, rate, months);
    const t = totalPayable(principal, rate, months);
    return { emi: e, total: t, interest: t - principal };
  }, [principal, rate, months]);

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-zinc-100">EMI Calculator</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Estimate your monthly repayment instantly.
      </p>

      <div className="mt-6 space-y-6">
        <Slider
          label="Loan amount"
          value={principal}
          min={10000}
          max={150000}
          step={1000}
          display={formatINR(principal)}
          onChange={setPrincipal}
        />
        <Slider
          label="Interest rate (p.a.)"
          value={rate}
          min={6}
          max={16}
          step={0.25}
          display={`${rate.toFixed(2)}%`}
          onChange={setRate}
        />
        <Slider
          label="Tenure"
          value={months}
          min={12}
          max={120}
          step={6}
          display={`${months} months`}
          onChange={setMonths}
        />
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3 text-center">
        <Stat label="Monthly EMI" value={formatINR(emi)} highlight />
        <Stat label="Total interest" value={formatINR(interest)} />
        <Stat label="Total payable" value={formatINR(total)} />
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, display, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  display: string; onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-sm font-medium text-zinc-100">{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
      />
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-accent/40 bg-accent/10" : "border-white/10 bg-white/[0.02]"}`}>
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${highlight ? "text-indigo-200" : "text-zinc-100"}`}>{value}</div>
    </div>
  );
}
