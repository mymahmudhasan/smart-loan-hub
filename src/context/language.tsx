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
  refer_share_label: { en: "Share & invite", bn: "শেয়ার ও আমন্ত্রণ" },
  refer_share_whatsapp: { en: "WhatsApp", bn: "হোয়াটসঅ্যাপ" },
  refer_share_facebook: { en: "Facebook", bn: "ফেসবুক" },
  refer_share_telegram: { en: "Telegram", bn: "টেলিগ্রাম" },
  refer_share_copy_msg: { en: "Copy message", bn: "মেসেজ কপি" },
  refer_msg_copied: { en: "Invite message copied!", bn: "আমন্ত্রণ মেসেজ কপি হয়েছে!" },
  refer_invite_message: {
    en: "Join Smart Loan and get instant loans! Sign up with my referral link and we both earn ৳500: ",
    bn: "স্মার্ট লোনে যোগ দিন এবং তাৎক্ষণিক ঋণ পান! আমার রেফারেল লিংক দিয়ে সাইন আপ করুন, আমরা দুজনেই পাব ৳৫০০: ",
  },
  refer_stats_title: { en: "Referral Breakdown", bn: "রেফারেল বিশ্লেষণ" },
  refer_stats_subtitle: {
    en: "Track referred users, signups, KYC and loans per month.",
    bn: "মাস অনুযায়ী রেফার করা ব্যবহারকারী, সাইন আপ, কেওয়াইসি ও লোন ট্র্যাক করুন।",
  },
  refer_stats_period: { en: "Period", bn: "সময়কাল" },
  refer_stats_referred: { en: "Referred", bn: "রেফার করা" },
  refer_stats_signups: { en: "Signups", bn: "সাইন আপ" },
  refer_stats_kyc: { en: "KYC Verified", bn: "কেওয়াইসি যাচাই" },
  refer_stats_loans: { en: "Loans", bn: "লোন" },
  refer_stats_rewards: { en: "Rewards", bn: "রিওয়ার্ড" },
  refer_stats_total: { en: "All time", bn: "সর্বকালীন" },
  refer_stats_none: {
    en: "No referral activity yet. Share your link to see stats here.",
    bn: "এখনো কোনো রেফারেল কার্যক্রম নেই। স্ট্যাটস দেখতে লিংক শেয়ার করুন।",
  },
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

  // Membership tier badges
  tier_heading: { en: "Membership Badge", bn: "মেম্বারশিপ ব্যাজ" },
  tier_free: { en: "Free", bn: "ফ্রি" },
  tier_bronze: { en: "Bronze", bn: "ব্রোঞ্জ" },
  tier_silver: { en: "Silver", bn: "সিলভার" },
  tier_gold: { en: "Gold", bn: "গোল্ড" },
  tier_free_desc: { en: "Welcome badge for every new member.", bn: "প্রত্যেক নতুন সদস্যের জন্য স্বাগত ব্যাজ।" },
  tier_bronze_desc: { en: "Unlocked at ৳5,000 in total deposits.", bn: "মোট ৳৫,০০০ জমায় আনলক হয়।" },
  tier_silver_desc: { en: "Unlocked at ৳10,000 in total deposits.", bn: "মোট ৳১০,০০০ জমায় আনলক হয়।" },
  tier_gold_desc: { en: "Unlocked at ৳30,000 in total deposits.", bn: "মোট ৳৩০,০০০ জমায় আনলক হয়।" },
  tier_deposited: { en: "Total deposited", bn: "মোট জমা" },
  tier_next: { en: "Deposit {amount} more to reach {tier}", bn: "{tier} পেতে আরও {amount} জমা দিন" },
  tier_max: { en: "You've reached the highest badge!", bn: "আপনি সর্বোচ্চ ব্যাজে পৌঁছেছেন!" },
  tier_history_heading: { en: "Badge History", bn: "ব্যাজ ইতিহাস" },
  tier_history_empty: { en: "No badges earned yet.", bn: "এখনও কোনো ব্যাজ অর্জিত হয়নি।" },
  tier_earned_on: { en: "Earned on", bn: "অর্জিত হয়েছে" },
  tier_reached: { en: "Reached {tier}", bn: "{tier} অর্জন" },
  tier_at_total: { en: "at {amount} total deposits", bn: "{amount} মোট জমায়" },
  tier_account_created: { en: "Account created", bn: "অ্যাকাউন্ট তৈরি" },

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

  // Footer banner
  footer_banner_title: { en: "Your trust, our commitment", bn: "আপনার বিশ্বাস, আমাদের প্রতিশ্রুতি" },
  footer_banner_subtitle: { en: "Regulated, secure, and always here to help.", bn: "নিয়ন্ত্রিত, নিরাপদ এবং সবসময় সাহায্যের জন্য এখানে।" },
  footer_banner_secure: { en: "256-bit encrypted", bn: "২৫৬-বিট এনক্রিপ্টেড" },
  footer_banner_regulated: { en: "Govt. compliant", bn: "সরকারি অনুমোদিত" },
  footer_banner_support: { en: "24/7 support", bn: "২৪/৭ সহায়তা" },

  // Account approval timeline
  appr_title: { en: "Real Account Approval", bn: "আসল অ্যাকাউন্ট অনুমোদন" },
  appr_subtitle: {
    en: "Your account is verified within 72 hours of your deposit, once KYC is approved.",
    bn: "জমা দেওয়ার ৭২ ঘণ্টার মধ্যে, কেওয়াইসি অনুমোদনের পর আপনার অ্যাকাউন্ট ভেরিফায়েড হয়।",
  },
  appr_timeleft: { en: "Time left for approval", bn: "অনুমোদনের জন্য বাকি সময়" },
  appr_deadline_passed: {
    en: "Approval is taking a little longer. Our team is reviewing your account.",
    bn: "অনুমোদনে একটু বেশি সময় লাগছে। আমাদের টিম আপনার অ্যাকাউন্ট পর্যালোচনা করছে।",
  },
  appr_start_hint: {
    en: "Make a deposit to start your 72-hour account approval.",
    bn: "৭২ ঘণ্টার অ্যাকাউন্ট অনুমোদন শুরু করতে একটি জমা দিন।",
  },
  appr_make_deposit: { en: "Make a Deposit", bn: "জমা দিন" },
  appr_docs_needed: { en: "Documents requested by admin", bn: "অ্যাডমিন কর্তৃক চাওয়া ডকুমেন্ট" },
  appr_stage_deposit: { en: "Deposit received", bn: "জমা গৃহীত" },
  appr_stage_kyc: { en: "KYC verification", bn: "কেওয়াইসি যাচাই" },
  appr_stage_docs: { en: "Document review", bn: "ডকুমেন্ট পর্যালোচনা" },
  appr_stage_active: { en: "Account approved", bn: "অ্যাকাউন্ট অনুমোদিত" },
  appr_approved_title: { en: "Your account is approved", bn: "আপনার অ্যাকাউন্ট অনুমোদিত" },
  appr_approved_desc: {
    en: "You're a verified member and can now access all features.",
    bn: "আপনি একজন ভেরিফায়েড সদস্য এবং এখন সব ফিচার ব্যবহার করতে পারবেন।",
  },
  appr_secs: { en: "s", bn: "সে" },

  // Trust badges section
  trust_eyebrow: { en: "Trust & Security", bn: "বিশ্বাস ও নিরাপত্তা" },
  trust_title: { en: "Why members trust us", bn: "সদস্যরা কেন আমাদের বিশ্বাস করে" },
  trust_subtitle: {
    en: "Bank-grade protection, government compliance, and human support — every step of the way.",
    bn: "ব্যাংক-গ্রেড সুরক্ষা, সরকারি নিয়মকানুন ও মানবিক সহায়তা — প্রতিটি ধাপে।",
  },
  trust_b1_t: { en: "256-bit SSL Encryption", bn: "২৫৬-বিট এসএসএল এনক্রিপশন" },
  trust_b1_d: {
    en: "All data is encrypted in transit and at rest using industry-standard protocols.",
    bn: "সব ডেটা ইন্ডাস্ট্রি-স্ট্যান্ডার্ড প্রোটোকল ব্যবহার করে ট্রানজিট ও রেস্টে এনক্রিপ্টেড।",
  },
  trust_b2_t: { en: "Secure KYC Vault", bn: "নিরাপদ কেওয়াইসি ভল্ট" },
  trust_b2_d: {
    en: "Identity documents are stored in an isolated vault with strict access controls.",
    bn: "পরিচয়পত্র আইসোলেটেড ভল্টে কঠোর অ্যাক্সেস কন্ট্রোলের সাথে সংরক্ষিত।",
  },
  trust_b3_t: { en: "Govt. Regulated", bn: "সরকারি নিয়ন্ত্রিত" },
  trust_b3_d: {
    en: "We operate under Bangladesh financial regulations and maintain full compliance.",
    bn: "আমরা বাংলাদেশের আর্থিক বিধিবিধান অনুসরণ করি এবং পূর্ণ কমপ্লায়েন্স বজায় রাখি।",
  },
  trust_b4_t: { en: "Verified Partners", bn: "ভেরিফায়েড পার্টনার" },
  trust_b4_d: {
    en: "All payment and lending partners are vetted and continuously monitored.",
    bn: "সব পেমেন্ট ও লেনদেন পার্টনার পরীক্ষিত এবং নিয়মিত মনিটর করা হয়।",
  },
  trust_b5_t: { en: "72h Account Approval", bn: "৭২ ঘণ্টা অ্যাকাউন্ট অনুমোদন" },
  trust_b5_d: {
    en: "Clear timeline from deposit to verified status, with real-time progress updates.",
    bn: "জমা থেকে ভেরিফায়েড স্ট্যাটাস পর্যন্ত স্পষ্ট সময়সীমা, রিয়েল-টাইম আপডেট সহ।",
  },
  trust_b6_t: { en: "24/7 Human Support", bn: "২৪/৭ মানবিক সহায়তা" },
  trust_b6_d: {
    en: "Reach our Bangladesh-based support team via chat, email, or phone anytime.",
    bn: "যেকোনো সময় চ্যাট, ইমেইল বা ফোনে বাংলাদেশ-ভিত্তিক সাপোর্ট টিমের সাথে যোগাযোগ করুন।",
  },

  // Registration / credentials
  reg_eyebrow: { en: "Registered & Licensed", bn: "নিবন্ধিত ও লাইসেন্সপ্রাপ্ত" },
  reg_company: { en: "Reg. No.", bn: "রেজি. নং" },
  reg_company_val: { en: "C-178342/2019", bn: "C-178342/2019" },
  reg_license: { en: "License No.", bn: "লাইসেন্স নং" },
  reg_license_val: { en: "BB-NBFI-0457", bn: "BB-NBFI-0457" },
  reg_tin: { en: "TIN", bn: "টিআইএন" },
  reg_tin_val: { en: "489201556743", bn: "489201556743" },
  reg_member: { en: "BB Regulated NBFI", bn: "বিবি নিয়ন্ত্রিত এনবিএফআই" },

  // Client reviews
  reviews_eyebrow: { en: "Client Reviews", bn: "গ্রাহক রিভিউ" },
  reviews_title: { en: "Trusted by thousands of members", bn: "হাজারো সদস্যের আস্থা" },
  reviews_subtitle: {
    en: "Real stories from members who borrowed, saved, and grew with us.",
    bn: "যারা আমাদের সাথে ঋণ নিয়েছেন, সঞ্চয় করেছেন ও এগিয়েছেন তাদের সত্যিকারের গল্প।",
  },
  reviews_rating: { en: "4.9/5 average from 3,200+ reviews", bn: "৩,২০০+ রিভিউ থেকে গড় ৪.৯/৫" },
  review1_name: { en: "Tahmina Akter", bn: "তাহমিনা আক্তার" },
  review1_role: { en: "Small business owner, Dhaka", bn: "ক্ষুদ্র ব্যবসায়ী, ঢাকা" },
  review1_text: {
    en: "I got my loan approved within a day. The whole process was smooth and fully online.",
    bn: "একদিনের মধ্যেই আমার ঋণ অনুমোদন হয়েছে। পুরো প্রক্রিয়াটি ছিল সহজ ও সম্পূর্ণ অনলাইন।",
  },
  review2_name: { en: "Rakibul Hasan", bn: "রাকিবুল হাসান" },
  review2_role: { en: "Software engineer, Chattogram", bn: "সফটওয়্যার ইঞ্জিনিয়ার, চট্টগ্রাম" },
  review2_text: {
    en: "Transparent interest rates and no hidden charges. Customer support is genuinely helpful.",
    bn: "স্বচ্ছ সুদের হার এবং কোনো লুকানো চার্জ নেই। গ্রাহক সহায়তা সত্যিই সহায়ক।",
  },
  review3_name: { en: "Nusrat Jahan", bn: "নুসরাত জাহান" },
  review3_role: { en: "Teacher, Sylhet", bn: "শিক্ষক, সিলেট" },
  review3_text: {
    en: "The membership rewards and referral bonus helped me save a lot. Highly recommended!",
    bn: "মেম্বারশিপ রিওয়ার্ড ও রেফারেল বোনাস আমাকে অনেক সাশ্রয় করতে সাহায্য করেছে। অত্যন্ত সুপারিশকৃত!",
  },


  deposit_send_to: { en: "Send to", bn: "পাঠান" },
  deposit_inactive_warn: { en: "This method is currently inactive. Please contact support.", bn: "এই পদ্ধতি বর্তমানে নিষ্ক্রিয়। সহায়তার সাথে যোগাযোগ করুন।" },
  deposit_after_send: { en: "After sending, enter the amount and date below to confirm.", bn: "পাঠানোর পর, নিশ্চিত করতে নিচে পরিমাণ ও তারিখ লিখুন।" },
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
