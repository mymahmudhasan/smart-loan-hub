const bdt = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const bdtDecimal = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBDT(value: number, decimals = false): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `৳${(decimals ? bdtDecimal : bdt).format(safe)}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-BD").format(value);
}
