export const ANNUAL_RATE = 0.08; // 8% annual
export const MAX_MONTHS = 36;
export const ELIGIBILITY_MULTIPLIER = 10;
export const LATE_PENALTY_RATE = 0.01; // 1% on overdue

export interface AmortizationRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  emi: number;
  totalInterest: number;
  totalPayable: number;
  schedule: AmortizationRow[];
}

/** Reducing-balance EMI. */
export function calculateLoan(
  principal: number,
  months: number,
  annualRate = ANNUAL_RATE,
): LoanResult {
  const safeMonths = Math.max(1, Math.min(months, MAX_MONTHS));
  const r = annualRate / 12;
  let emi: number;
  if (r === 0) {
    emi = principal / safeMonths;
  } else {
    const factor = Math.pow(1 + r, safeMonths);
    emi = (principal * r * factor) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let m = 1; m <= safeMonths; m++) {
    const interest = balance * r;
    let principalPart = emi - interest;
    if (m === safeMonths) principalPart = balance; // clear rounding remainder
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;
    schedule.push({
      month: m,
      emi: principalPart + interest,
      principal: principalPart,
      interest,
      balance,
    });
  }

  return {
    emi,
    totalInterest,
    totalPayable: principal + totalInterest,
    schedule,
  };
}

export function eligibleLoanAmount(memberBalance: number): number {
  return memberBalance * ELIGIBILITY_MULTIPLIER;
}

export function latePenalty(overdueAmount: number): number {
  return overdueAmount * LATE_PENALTY_RATE;
}
