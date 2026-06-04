import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Smart Loan" },
      { name: "description", content: "How Smart Loan collects, uses, secures and protects your personal and financial data." },
    ],
  }),
  component: Privacy,
});

const sections = [
  { h: "1. Information We Collect", p: "We collect your name, mobile number, email, National ID, date of birth, address, profile photo and KYC documents (NID front/back and selfie) to verify your identity and provide lending services." },
  { h: "2. How We Use Your Data", p: "Your data is used for identity verification, membership management, loan eligibility assessment, fraud detection and regulatory compliance." },
  { h: "3. Data Security", p: "Documents are stored securely with encryption. We apply role-based access, audit logging, session expiration and secure APIs to protect your information." },
  { h: "4. Data Sharing", p: "We do not sell your data. Information may be shared only with regulators or as required by applicable Bangladeshi law." },
  { h: "5. KYC & Verification", p: "KYC documents are reviewed manually for approval and retained as required for compliance and audit purposes." },
  { h: "6. Your Rights", p: "You may request access to or correction of your personal data by contacting our support team." },
  { h: "7. Contact", p: "For privacy questions, email support@smartloan.com.bd." },
];

function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
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
