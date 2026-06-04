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
    q: "Who can apply for a loan?",
    a: "Only verified members can apply. You must complete signup, pass KYC verification (NID front/back and a selfie), and maintain a member balance.",
  },
  {
    q: "How is my loan limit calculated?",
    a: "Your eligible loan amount is 10× your member balance. For example, a balance of ৳20,000 unlocks up to ৳200,000.",
  },
  {
    q: "What is the interest rate?",
    a: "A flat 8% annual interest rate calculated using the reducing-balance method, so you only pay interest on the outstanding principal.",
  },
  {
    q: "What is the maximum loan duration?",
    a: "You can choose a repayment term of up to 36 months with monthly EMIs.",
  },
  {
    q: "What happens if I miss an EMI payment?",
    a: "A 1% penalty is applied to the overdue amount if payment is not completed before the due date. Pay on time to avoid extra charges.",
  },
  {
    q: "Which payment methods are supported?",
    a: "You can deposit funds and pay EMIs via bKash, Nagad, or bank transfer. Bank transfers go through manual verification.",
  },
  {
    q: "How long does verification take?",
    a: "KYC and membership are manually reviewed by our team, typically within 24 hours.",
  },
];

function FAQ() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <HelpCircle className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("nav_faq")}</h1>
        <p className="mt-2 text-muted-foreground">Everything you need to know about Smart Loan.</p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
