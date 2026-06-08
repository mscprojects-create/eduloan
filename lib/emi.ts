// Reducing-balance EMI math. Pure functions — used by UI and server alike.

export function calculateEMI(
  principal: number,
  annualRatePct: number,
  months: number
): number {
  if (months <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

export interface AmortRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export function buildSchedule(
  principal: number,
  annualRatePct: number,
  months: number
): AmortRow[] {
  const emi = calculateEMI(principal, annualRatePct, months);
  const r = annualRatePct / 12 / 100;
  let balance = principal;
  const rows: AmortRow[] = [];
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    let principalPaid = emi - interest;
    if (m === months) principalPaid = balance; // close out rounding
    balance = Math.max(0, balance - principalPaid);
    rows.push({
      month: m,
      emi: Math.round(emi * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }
  return rows;
}

export function totalPayable(
  principal: number,
  annualRatePct: number,
  months: number
): number {
  return Math.round(calculateEMI(principal, annualRatePct, months) * months * 100) / 100;
}
