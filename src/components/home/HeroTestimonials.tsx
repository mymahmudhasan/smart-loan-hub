import { Quote } from "lucide-react";
import { useLanguage } from "@/context/language";

type Testimonial = {
  quote: { en: string; bn: string };
  name: { en: string; bn: string };
  location: { en: string; bn: string };
};

const testimonials: Testimonial[] = [
  {
    quote: {
      en: "I used the loan amount as capital for my business",
      bn: "আমি লোনের টাকা আমার ব্যবসার মূলধন হিসেবে ব্যবহার করেছি",
    },
    name: { en: "Chandan Kumar Sarker", bn: "চন্দন কুমার সরকার" },
    location: { en: "Aditmari, Lalmonirhaat", bn: "আদিতমারি, লালমনিরহাট" },
  },
  {
    quote: {
      en: "I bought a bicycle with the loan, and now I earn through part-time delivery",
      bn: "লোন দিয়ে একটি সাইকেল কিনেছি, এখন পার্ট-টাইম ডেলিভারিতে আয় করি",
    },
    name: { en: "MD. Al-Amin", bn: "মো. আল-আমিন" },
    location: { en: "Mirpur, Dhaka", bn: "মিরপুর, ঢাকা" },
  },
  {
    quote: {
      en: "I used the loan for my daughter's admission in school",
      bn: "মেয়ের স্কুলে ভর্তির জন্য আমি লোন ব্যবহার করেছি",
    },
    name: { en: "Kulsoma Akter", bn: "কুলসুমা আক্তার" },
    location: { en: "Rangunia, Chattogram", bn: "রাঙ্গুনিয়া, চট্টগ্রাম" },
  },
];

export function HeroTestimonials() {
  const { lang } = useLanguage();

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] gradient-primary opacity-20 blur-3xl" />
      <div className="flex flex-col gap-4">
        {testimonials.map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-3xl gradient-hero p-5 shadow-elegant sm:p-6"
            style={{ marginLeft: i % 2 === 1 ? "auto" : undefined, maxWidth: "95%" }}
          >
            {/* faint repeated-text texture */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 select-none text-[10px] leading-4 text-on-hero/10 break-words"
            >
              {Array.from({ length: 12 }).map((_, r) => (
                <span key={r}>
                  স্মার্ট লোন · নিরাপদ · ভেরিফায়েড সদস্য · কম সুদে লোন ·{" "}
                </span>
              ))}
            </div>

            <div className="relative">
              <Quote className="h-7 w-7 text-on-hero/90" fill="currentColor" />
              <p className="mt-2 text-lg font-extrabold leading-snug text-on-hero sm:text-xl">
                {item.quote[lang]}
              </p>
              <p className="mt-3 font-semibold text-on-hero">{item.name[lang]}</p>
              <p className="text-sm text-on-hero/80">{item.location[lang]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
