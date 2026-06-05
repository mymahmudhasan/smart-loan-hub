import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

type Dict = Record<string, { en: string; bn: string }>;

export const translations: Dict = {
  // Brand
  brand: { en: "Smart Loan", bn: "স্মার্ট লোন" },
  brandFull: { en: "Smart Loan Membership", bn: "স্মার্ট লোন মেম্বারশিপ" },

  // Nav
  nav_home: { en: "Home", bn: "হোম" },
  nav_membership: { en: "Membership", bn: "মেম্বারশিপ" },
  nav_calculator: { en: "Loan Calculator", bn: "লোন ক্যালকুলেটর" },
  nav_dashboard: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  nav_payments: { en: "Payments", bn: "পেমেন্ট" },
  nav_faq: { en: "FAQ", bn: "জিজ্ঞাসা" },
  nav_contact: { en: "Contact", bn: "যোগাযোগ" },
  nav_login: { en: "Log In", bn: "লগ ইন" },
  nav_signup: { en: "Get Started", bn: "শুরু করুন" },

  // Hero
  hero_badge: { en: "Verified Members Only · Secure Lending", bn: "শুধু ভেরিফায়েড সদস্য · নিরাপদ লোন" },
  hero_title: { en: "Membership-based loans, built for Bangladesh", bn: "বাংলাদেশের জন্য তৈরি মেম্বারশিপ ভিত্তিক লোন" },
  hero_subtitle: {
    en: "Become a verified member, grow your balance, and unlock loans up to 10× your deposit at just 8% annual interest.",
    bn: "ভেরিফায়েড সদস্য হন, আপনার ব্যালেন্স বাড়ান এবং মাত্র ৮% বার্ষিক সুদে আপনার জমার ১০ গুণ পর্যন্ত লোন নিন।",
  },
  hero_cta_primary: { en: "Become a Member", bn: "সদস্য হন" },
  hero_cta_secondary: { en: "Calculate EMI", bn: "ইএমআই হিসাব" },

  // Stats
  stat_members: { en: "Verified Members", bn: "ভেরিফায়েড সদস্য" },
  stat_disbursed: { en: "Loans Disbursed", bn: "বিতরণকৃত লোন" },
  stat_rate: { en: "Annual Interest", bn: "বার্ষিক সুদ" },
  stat_approval: { en: "Avg. Approval", bn: "গড় অনুমোদন" },

  // Sections
  how_title: { en: "How it works", bn: "কীভাবে কাজ করে" },
  how_subtitle: { en: "Four simple steps from sign up to disbursement.", bn: "সাইন আপ থেকে বিতরণ পর্যন্ত চারটি সহজ ধাপ।" },
  step1_t: { en: "Sign up & verify", bn: "সাইন আপ ও যাচাই" },
  step1_d: { en: "Register and complete KYC with your NID and a selfie.", bn: "এনআইডি ও সেলফি দিয়ে কেওয়াইসি সম্পন্ন করুন।" },
  step2_t: { en: "Become a member", bn: "সদস্য হন" },
  step2_d: { en: "Deposit funds to build your member balance.", bn: "ব্যালেন্স গড়তে অর্থ জমা দিন।" },
  step3_t: { en: "Apply for a loan", bn: "লোনের আবেদন" },
  step3_d: { en: "Borrow up to 10× your balance after approval.", bn: "অনুমোদনের পর ব্যালেন্সের ১০ গুণ পর্যন্ত লোন।" },
  step4_t: { en: "Repay monthly", bn: "মাসিক পরিশোধ" },
  step4_d: { en: "Track EMIs and clear your loan with ease.", bn: "ইএমআই ট্র্যাক করে সহজে লোন পরিশোধ করুন।" },

  features_title: { en: "Why choose Smart Loan", bn: "কেন স্মার্ট লোন" },
  f1_t: { en: "Bank-grade security", bn: "ব্যাংক-গ্রেড নিরাপত্তা" },
  f1_d: { en: "Encrypted documents, secure sessions, and full audit logs.", bn: "এনক্রিপ্টেড ডকুমেন্ট, নিরাপদ সেশন ও অডিট লগ।" },
  f2_t: { en: "Fair 8% interest", bn: "ন্যায্য ৮% সুদ" },
  f2_d: { en: "Transparent reducing-balance EMIs, no hidden fees.", bn: "স্বচ্ছ রিডিউসিং-ব্যালেন্স ইএমআই, কোনো গোপন ফি নেই।" },
  f3_t: { en: "Local payments", bn: "লোকাল পেমেন্ট" },
  f3_d: { en: "Deposit and repay via bKash, Nagad, or bank transfer.", bn: "বিকাশ, নগদ বা ব্যাংক ট্রান্সফারে জমা ও পরিশোধ।" },
  f4_t: { en: "Instant eligibility", bn: "তাৎক্ষণিক যোগ্যতা" },
  f4_d: { en: "See your loan limit update live with your balance.", bn: "ব্যালেন্সের সাথে লোন লিমিট লাইভ দেখুন।" },

  cta_title: { en: "Ready to unlock your loan limit?", bn: "আপনার লোন লিমিট আনলক করতে প্রস্তুত?" },
  cta_subtitle: { en: "Join thousands of verified members across Bangladesh.", bn: "বাংলাদেশজুড়ে হাজারো ভেরিফায়েড সদস্যের সাথে যোগ দিন।" },

  // Offers banner
  offers_eyebrow: { en: "Smart Loan Bank", bn: "স্মার্ট লোন ব্যাংক" },
  offers_title: { en: "Exclusive member offers", bn: "এক্সক্লুসিভ মেম্বার অফার" },
  offers_subtitle: { en: "Limited-time deals on loans, deposits and rewards.", bn: "লোন, জমা ও রিওয়ার্ডে সীমিত সময়ের অফার।" },

  // Referral
  refer_badge: { en: "Referral Rewards", bn: "রেফারেল রিওয়ার্ড" },
  refer_title: { en: "Refer a friend, earn ৳500 each", bn: "বন্ধুকে রেফার করুন, প্রতি একাউন্টে ৳৫০০" },
  refer_subtitle: {
    en: "Share your code. When a friend opens a verified account, you both move closer to free money — ৳500 per successful referral.",
    bn: "আপনার কোড শেয়ার করুন। বন্ধু ভেরিফায়েড একাউন্ট খুললে আপনি পাবেন প্রতি সফল রেফারেলে ৳৫০০।",
  },
  refer_reward: { en: "৳500 free per account", bn: "প্রতি একাউন্টে ৳৫০০ ফ্রি" },
  refer_s1_t: { en: "Share your code", bn: "কোড শেয়ার করুন" },
  refer_s1_d: { en: "Send your unique referral link to friends and family.", bn: "আপনার রেফারেল লিংক বন্ধু ও পরিবারকে পাঠান।" },
  refer_s2_t: { en: "They join & verify", bn: "তারা যোগ দেয় ও যাচাই করে" },
  refer_s2_d: { en: "Your friend signs up and completes KYC verification.", bn: "আপনার বন্ধু সাইন আপ করে কেওয়াইসি সম্পন্ন করে।" },
  refer_s3_t: { en: "You earn ৳500", bn: "আপনি পান ৳৫০০" },
  refer_s3_d: { en: "৳500 is added to your referral rewards balance.", bn: "৳৫০০ আপনার রেফারেল রিওয়ার্ড ব্যালেন্সে যোগ হয়।" },
  refer_cta: { en: "Start referring", bn: "রেফার শুরু করুন" },
  refer_code_label: { en: "Your referral code", bn: "আপনার রেফারেল কোড" },
  refer_copy: { en: "Copy link", bn: "লিংক কপি" },
  refer_copied: { en: "Referral link copied!", bn: "রেফারেল লিংক কপি হয়েছে!" },
  refer_total: { en: "Total Referrals", bn: "মোট রেফারেল" },
  refer_earned: { en: "Credited Rewards", bn: "ক্রেডিটেড রিওয়ার্ড" },
  refer_pending: { en: "Pending Rewards", bn: "অপেক্ষমাণ রিওয়ার্ড" },
  refer_widget_title: { en: "Refer & Earn", bn: "রেফার ও আয়" },
  refer_none: { en: "No referrals yet. Share your link to start earning!", bn: "এখনো কোনো রেফারেল নেই। লিংক শেয়ার করে আয় শুরু করুন!" },
  signup_referral: { en: "Referral Code (optional)", bn: "রেফারেল কোড (ঐচ্ছিক)" },

  // Calculator
  calc_title: { en: "Loan Calculator", bn: "লোন ক্যালকুলেটর" },
  calc_subtitle: { en: "Estimate your monthly EMI and total cost.", bn: "আপনার মাসিক ইএমআই ও মোট খরচ হিসাব করুন।" },
  calc_amount: { en: "Loan Amount", bn: "লোনের পরিমাণ" },
  calc_duration: { en: "Duration (months)", bn: "মেয়াদ (মাস)" },
  calc_emi: { en: "Monthly EMI", bn: "মাসিক ইএমআই" },
  calc_interest: { en: "Total Interest", bn: "মোট সুদ" },
  calc_total: { en: "Total Payable", bn: "মোট পরিশোধযোগ্য" },
  calc_schedule: { en: "Repayment Schedule", bn: "পরিশোধ সূচি" },
  calc_month: { en: "Month", bn: "মাস" },
  calc_principal: { en: "Principal", bn: "মূল" },
  calc_balance: { en: "Balance", bn: "অবশিষ্ট" },

  // Membership
  mem_title: { en: "Membership", bn: "মেম্বারশিপ" },
  mem_subtitle: { en: "Your balance unlocks your borrowing power.", bn: "আপনার ব্যালেন্স আপনার ঋণ ক্ষমতা আনলক করে।" },
  mem_balance: { en: "Member Balance", bn: "সদস্য ব্যালেন্স" },
  mem_eligible: { en: "Eligible Loan", bn: "যোগ্য লোন" },
  mem_status: { en: "Membership Status", bn: "সদস্যপদ অবস্থা" },

  // Dashboard
  dash_welcome: { en: "Welcome back", bn: "স্বাগতম" },
  dash_wallet: { en: "Wallet Balance", bn: "ওয়ালেট ব্যালেন্স" },
  dash_limit: { en: "Available Limit", bn: "উপলব্ধ লিমিট" },
  dash_active: { en: "Active Loan", bn: "চলমান লোন" },
  dash_due: { en: "Next EMI Due", bn: "পরবর্তী ইএমআই" },
  dash_eligibility: { en: "Loan Eligibility", bn: "লোন যোগ্যতা" },
  dash_emi_progress: { en: "EMI Progress", bn: "ইএমআই অগ্রগতি" },
  dash_transactions: { en: "Recent Transactions", bn: "সাম্প্রতিক লেনদেন" },
  dash_download: { en: "Download Statement", bn: "স্টেটমেন্ট ডাউনলোড" },

  // Common
  status_verified: { en: "Verified", bn: "ভেরিফায়েড" },
  status_pending: { en: "Pending", bn: "অপেক্ষমাণ" },
  status_rejected: { en: "Rejected", bn: "প্রত্যাখ্যাত" },
  apply_now: { en: "Apply Now", bn: "এখনই আবেদন" },
  deposit: { en: "Deposit", bn: "জমা" },
  withdraw: { en: "Withdraw", bn: "উত্তোলন" },
  pay_emi: { en: "Pay EMI", bn: "ইএমআই দিন" },
  learn_more: { en: "Learn more", bn: "বিস্তারিত" },

  footer_tagline: { en: "Secure, membership-based lending for Bangladesh.", bn: "বাংলাদেশের জন্য নিরাপদ মেম্বারশিপ লোন।" },
  footer_rights: { en: "All rights reserved.", bn: "সর্বস্বত্ব সংরক্ষিত।" },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const toggleLang = () => setLang(lang === "en" ? "bn" : "en");
  const t = (key: keyof typeof translations) => translations[key]?.[lang] ?? String(key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
