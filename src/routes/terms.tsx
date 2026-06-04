import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Smart Loan" },
      { name: "description", content: "Terms governing membership, loan eligibility, interest, EMIs and repayment on Smart Loan." },
    ],
  }),
  component: Terms,
});

const sections = [
  { h: "1. Membership", p: "Loan services are available only to verified members. Membership requires successful KYC verification and is subject to admin approval." },
  { h: "2. Loan Eligibility", p: "Your eligible loan amount equals 10× your member balance. Balance must be maintained to retain eligibility." },
  { h: "3. Interest Rate", p: "All loans carry an 8% annual interest rate calculated using the reducing-balance method." },
  { h: "4. Repayment & Duration", p: "Loans are repaid via monthly EMIs over a maximum term of 36 months." },
  { h: "5. Late Payment", p: "A 1% penalty is applied to any overdue amount if an EMI is not paid before its due date." },
  { h: "6. Disbursement", p: "Approved loans are disbursed after admin review. Smart Loan reserves the right to approve or reject any application." },
  { h: "7. Regulatory Disclaimer", p: "Smart Loan operates in accordance with applicable financial regulations in Bangladesh. Lending terms are subject to change with notice." },
];

function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>
      <div className="mt-8 space-y-6">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold">{s.h}</h2>
            <p className="mt-2 text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
