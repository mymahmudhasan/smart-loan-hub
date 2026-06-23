import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/context/language";

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
  {
    h: { en: "1. Membership", bn: "১. সদস্যপদ" },
    p: {
      en: "Loan services are available only to verified members. Membership requires successful KYC verification and is subject to admin approval.",
      bn: "লোন সেবা শুধুমাত্র ভেরিফায়েড সদস্যদের জন্য উপলব্ধ। সদস্যপদের জন্য সফল কেওয়াইসি যাচাই প্রয়োজন এবং তা অ্যাডমিন অনুমোদন সাপেক্ষে।",
    },
  },
  {
    h: { en: "2. Loan Eligibility", bn: "২. লোন যোগ্যতা" },
    p: {
      en: "Your eligible loan amount equals 10× your member balance. Balance must be maintained to retain eligibility.",
      bn: "আপনার যোগ্য লোনের পরিমাণ আপনার সদস্য ব্যালেন্সের ১০ গুণ। যোগ্যতা বজায় রাখতে ব্যালেন্স ধরে রাখতে হবে।",
    },
  },
  {
    h: { en: "3. Interest Rate", bn: "৩. সুদের হার" },
    p: {
      en: "All loans carry an 8% annual interest rate calculated using the reducing-balance method.",
      bn: "সব লোনে রিডিউসিং-ব্যালেন্স পদ্ধতিতে হিসাব করা বার্ষিক ৮% সুদের হার প্রযোজ্য।",
    },
  },
  {
    h: { en: "4. Repayment & Duration", bn: "৪. পরিশোধ ও মেয়াদ" },
    p: {
      en: "Loans are repaid via monthly EMIs over a maximum term of 36 months.",
      bn: "লোন সর্বোচ্চ ৩৬ মাস মেয়াদে মাসিক কিস্তির মাধ্যমে পরিশোধ করা হয়।",
    },
  },
  {
    h: { en: "5. Late Payment", bn: "৫. বিলম্বিত পরিশোধ" },
    p: {
      en: "A 1% penalty is applied to any overdue amount if an EMI is not paid before its due date.",
      bn: "নির্ধারিত তারিখের আগে কিস্তি পরিশোধ না হলে বকেয়া পরিমাণের উপর ১% জরিমানা প্রযোজ্য হয়।",
    },
  },
  {
    h: { en: "6. Disbursement", bn: "৬. বিতরণ" },
    p: {
      en: "Approved loans are disbursed after admin review. Smart Loan reserves the right to approve or reject any application.",
      bn: "অনুমোদিত লোন অ্যাডমিন পর্যালোচনার পর বিতরণ করা হয়। স্মার্ট লোন যেকোনো আবেদন অনুমোদন বা প্রত্যাখ্যানের অধিকার সংরক্ষণ করে।",
    },
  },
  {
    h: { en: "7. Regulatory Disclaimer", bn: "৭. নিয়ন্ত্রক দাবিত্যাগ" },
    p: {
      en: "Smart Loan operates in accordance with applicable financial regulations in Bangladesh. Lending terms are subject to change with notice.",
      bn: "স্মার্ট লোন বাংলাদেশের প্রযোজ্য আর্থিক বিধিবিধান অনুসারে পরিচালিত হয়। লোনের শর্তাবলী নোটিশসহ পরিবর্তন সাপেক্ষে।",
    },
  },
];

function Terms() {
  const { lang } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">{lang === "bn" ? "শর্তাবলী" : "Terms & Conditions"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{lang === "bn" ? "সর্বশেষ হালনাগাদ: জুন ২০২৬" : "Last updated: June 2026"}</p>
      <div className="mt-8 space-y-6">
        {sections.map((s) => (
          <section key={s.h.en}>
            <h2 className="text-lg font-semibold">{s.h[lang]}</h2>
            <p className="mt-2 text-muted-foreground">{s.p[lang]}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
