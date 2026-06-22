import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/context/language";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ | Smart Loan" },
      { name: "description", content: "Answers about membership, loan eligibility, interest rates, EMIs and payments." },
    ],
  }),
  component: FAQ,
});

const faqs = [
  {
    q: { en: "Who can apply for a loan?", bn: "কে লোনের জন্য আবেদন করতে পারে?" },
    a: {
      en: "Only verified members can apply. You must complete signup, pass KYC verification (NID front/back and a selfie), and maintain a member balance.",
      bn: "শুধুমাত্র ভেরিফায়েড সদস্যরা আবেদন করতে পারেন। আপনাকে সাইন আপ সম্পন্ন করতে হবে, কেওয়াইসি যাচাই (এনআইডি সামনে/পেছনে ও একটি সেলফি) পাস করতে হবে এবং সদস্য ব্যালেন্স রাখতে হবে।",
    },
  },
  {
    q: { en: "How is my loan limit calculated?", bn: "আমার লোন লিমিট কীভাবে হিসাব করা হয়?" },
    a: {
      en: "Your eligible loan amount is 10× your member balance. For example, a balance of ৳20,000 unlocks up to ৳200,000.",
      bn: "আপনার যোগ্য লোনের পরিমাণ আপনার সদস্য ব্যালেন্সের ১০ গুণ। উদাহরণস্বরূপ, ৳২০,০০০ ব্যালেন্সে ৳২,০০,০০০ পর্যন্ত আনলক হয়।",
    },
  },
  {
    q: { en: "What is the interest rate?", bn: "সুদের হার কত?" },
    a: {
      en: "A flat 8% annual interest rate calculated using the reducing-balance method, so you only pay interest on the outstanding principal.",
      bn: "রিডিউসিং-ব্যালেন্স পদ্ধতিতে হিসাব করা বার্ষিক ৮% সুদের হার, ফলে আপনি শুধু বকেয়া মূলধনের উপর সুদ দেন।",
    },
  },
  {
    q: { en: "What is the maximum loan duration?", bn: "সর্বোচ্চ লোনের মেয়াদ কত?" },
    a: {
      en: "You can choose a repayment term of up to 36 months with monthly EMIs.",
      bn: "আপনি মাসিক ইএমআই সহ সর্বোচ্চ ৩৬ মাস পর্যন্ত পরিশোধের মেয়াদ বেছে নিতে পারেন।",
    },
  },
  {
    q: { en: "What happens if I miss an EMI payment?", bn: "ইএমআই পরিশোধে দেরি হলে কী হয়?" },
    a: {
      en: "A 1% penalty is applied to the overdue amount if payment is not completed before the due date. Pay on time to avoid extra charges.",
      bn: "নির্ধারিত তারিখের আগে পরিশোধ না হলে বকেয়া পরিমাণের উপর ১% জরিমানা প্রযোজ্য হয়। অতিরিক্ত চার্জ এড়াতে সময়মতো পরিশোধ করুন।",
    },
  },
  {
    q: { en: "Which payment methods are supported?", bn: "কোন পেমেন্ট মাধ্যম সমর্থিত?" },
    a: {
      en: "You can deposit funds and pay EMIs via bKash, Nagad, or bank transfer. Bank transfers go through manual verification.",
      bn: "আপনি বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে অর্থ জমা ও ইএমআই পরিশোধ করতে পারেন। ব্যাংক ট্রান্সফার ম্যানুয়াল যাচাইয়ের মধ্য দিয়ে যায়।",
    },
  },
  {
    q: { en: "How long does verification take?", bn: "যাচাইকরণে কত সময় লাগে?" },
    a: {
      en: "KYC and membership are manually reviewed by our team, typically within 24 hours.",
      bn: "কেওয়াইসি ও সদস্যপদ আমাদের টিম দ্বারা ম্যানুয়ালি পর্যালোচনা করা হয়, সাধারণত ২৪ ঘণ্টার মধ্যে।",
    },
  },
];

function FAQ() {
  const { t, lang } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <HelpCircle className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("nav_faq")}</h1>
        <p className="mt-2 text-muted-foreground">
          {lang === "bn" ? "স্মার্ট লোন সম্পর্কে আপনার যা জানা দরকার।" : "Everything you need to know about Smart Loan."}
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{f.q[lang]}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a[lang]}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
