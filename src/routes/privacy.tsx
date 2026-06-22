import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/context/language";

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
  {
    h: { en: "1. Information We Collect", bn: "১. আমরা যে তথ্য সংগ্রহ করি" },
    p: {
      en: "We collect your name, mobile number, email, National ID, date of birth, address, profile photo and KYC documents (NID front/back and selfie) to verify your identity and provide lending services.",
      bn: "আপনার পরিচয় যাচাই ও লোন সেবা প্রদানের জন্য আমরা আপনার নাম, মোবাইল নম্বর, ইমেইল, জাতীয় পরিচয়পত্র, জন্মতারিখ, ঠিকানা, প্রোফাইল ছবি ও কেওয়াইসি ডকুমেন্ট (এনআইডি সামনে/পেছনে ও সেলফি) সংগ্রহ করি।",
    },
  },
  {
    h: { en: "2. How We Use Your Data", bn: "২. আমরা কীভাবে আপনার তথ্য ব্যবহার করি" },
    p: {
      en: "Your data is used for identity verification, membership management, loan eligibility assessment, fraud detection and regulatory compliance.",
      bn: "আপনার তথ্য পরিচয় যাচাই, সদস্যপদ ব্যবস্থাপনা, লোন যোগ্যতা মূল্যায়ন, প্রতারণা শনাক্তকরণ ও নিয়ন্ত্রক সম্মতির জন্য ব্যবহৃত হয়।",
    },
  },
  {
    h: { en: "3. Data Security", bn: "৩. তথ্য নিরাপত্তা" },
    p: {
      en: "Documents are stored securely with encryption. We apply role-based access, audit logging, session expiration and secure APIs to protect your information.",
      bn: "ডকুমেন্ট এনক্রিপশনসহ নিরাপদে সংরক্ষণ করা হয়। আপনার তথ্য রক্ষায় আমরা ভূমিকা-ভিত্তিক অ্যাক্সেস, অডিট লগিং, সেশন মেয়াদ ও নিরাপদ এপিআই প্রয়োগ করি।",
    },
  },
  {
    h: { en: "4. Data Sharing", bn: "৪. তথ্য শেয়ারিং" },
    p: {
      en: "We do not sell your data. Information may be shared only with regulators or as required by applicable Bangladeshi law.",
      bn: "আমরা আপনার তথ্য বিক্রি করি না। তথ্য শুধুমাত্র নিয়ন্ত্রকদের সাথে বা প্রযোজ্য বাংলাদেশি আইন অনুযায়ী প্রয়োজন হলে শেয়ার করা হতে পারে।",
    },
  },
  {
    h: { en: "5. KYC & Verification", bn: "৫. কেওয়াইসি ও যাচাইকরণ" },
    p: {
      en: "KYC documents are reviewed manually for approval and retained as required for compliance and audit purposes.",
      bn: "কেওয়াইসি ডকুমেন্ট অনুমোদনের জন্য ম্যানুয়ালি পর্যালোচনা করা হয় এবং সম্মতি ও অডিটের প্রয়োজনে সংরক্ষণ করা হয়।",
    },
  },
  {
    h: { en: "6. Your Rights", bn: "৬. আপনার অধিকার" },
    p: {
      en: "You may request access to or correction of your personal data by contacting our support team.",
      bn: "আমাদের সহায়তা দলের সাথে যোগাযোগ করে আপনি আপনার ব্যক্তিগত তথ্যে অ্যাক্সেস বা সংশোধনের অনুরোধ করতে পারেন।",
    },
  },
  {
    h: { en: "7. Contact", bn: "৭. যোগাযোগ" },
    p: {
      en: "For privacy questions, email support@smartloan.com.bd.",
      bn: "গোপনীয়তা সংক্রান্ত প্রশ্নের জন্য ইমেইল করুন support@smartloan.com.bd।",
    },
  },
];

function Privacy() {
  const { lang } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">{lang === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy"}</h1>
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
