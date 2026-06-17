import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BannerOffer } from "@/lib/banner.functions";

export const bannerThemes = ["primary", "gold", "emerald", "midnight"] as const;
export const ctaStyles = ["glass", "solid", "outline", "gold", "ghost"] as const;
export const textStyles = ["classic", "centered", "spotlight", "minimal"] as const;

export type CtaStyle = (typeof ctaStyles)[number];
export type TextStyle = (typeof textStyles)[number];

export const themeClass: Record<string, string> = {
  primary: "gradient-primary",
  gold: "gradient-gold",
  emerald: "gradient-emerald",
  midnight: "gradient-midnight",
};

export const ctaStyleLabel: Record<CtaStyle, string> = {
  glass: "Glass",
  solid: "Solid",
  outline: "Outline",
  gold: "Gold accent",
  ghost: "Ghost link",
};

export const textStyleLabel: Record<TextStyle, string> = {
  classic: "Classic (left)",
  centered: "Centered",
  spotlight: "Spotlight",
  minimal: "Minimal",
};

const ctaClass: Record<CtaStyle, string> = {
  glass:
    "border border-white/30 bg-white/15 text-on-hero backdrop-blur-md hover:bg-white/25",
  solid: "bg-white text-slate-900 shadow-elegant hover:bg-white/90",
  outline:
    "border-2 border-white/70 bg-transparent text-on-hero hover:bg-white/10",
  gold: "bg-accent text-accent-foreground shadow-elegant hover:bg-accent/90",
  ghost:
    "bg-transparent px-0 text-on-hero underline decoration-white/50 decoration-2 underline-offset-4 hover:decoration-white",
};

function ctaBaseClass(style: CtaStyle) {
  return cn(
    "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors",
    ctaClass[style],
  );
}

function textLayout(style: TextStyle) {
  switch (style) {
    case "centered":
      return {
        wrap: "items-center text-center",
        title: "text-3xl font-extrabold leading-tight sm:text-4xl",
        actions: "justify-center",
      };
    case "spotlight":
      return {
        wrap: "items-start",
        title:
          "text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl",
        actions: "justify-between",
      };
    case "minimal":
      return {
        wrap: "items-start",
        title: "text-xl font-semibold leading-snug sm:text-2xl",
        actions: "justify-start",
      };
    case "classic":
    default:
      return {
        wrap: "items-start",
        title: "text-3xl font-extrabold leading-tight sm:text-4xl",
        actions: "justify-between",
      };
  }
}

export function OfferCard({
  offer,
  preview = false,
}: {
  offer: BannerOffer;
  preview?: boolean;
}) {
  const cta = (offer.cta_style as CtaStyle) ?? "glass";
  const layout = textLayout((offer.text_style as TextStyle) ?? "classic");

  const ctaInner = (
    <>
      {offer.cta_label} <ArrowRight className="h-4 w-4" />
    </>
  );

  return (
    <div
      className={cn(
        "relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[2rem] p-7 shadow-elegant sm:min-h-[320px] sm:p-9",
        themeClass[offer.theme] ?? themeClass.primary,
      )}
    >
      {/* decorative card chip */}
      <div className="pointer-events-none absolute right-7 top-7 h-10 w-14 rounded-lg bg-white/20 backdrop-blur-sm sm:right-9 sm:top-9" />

      {/* decorative glow spots */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

      <div className={cn("relative z-10 flex flex-col", layout.wrap)}>
        {offer.badge && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-on-hero backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> {offer.badge}
          </span>
        )}
        <h3 className={cn("mt-5 max-w-xl text-on-hero", layout.title)}>
          {offer.title}
        </h3>
        {offer.subtitle && (
          <p className="mt-3 max-w-lg text-sm text-on-hero/85 sm:text-base">
            {offer.subtitle}
          </p>
        )}
      </div>

      <div className={cn("relative z-10 mt-8 flex items-center gap-4", layout.actions)}>
        {preview ? (
          <span className={ctaBaseClass(cta)}>{ctaInner}</span>
        ) : (
          <a href={offer.cta_href} className={ctaBaseClass(cta)}>
            {ctaInner}
          </a>
        )}
        {offer.text_style !== "minimal" && (
          <span className="hidden font-mono text-sm tracking-[0.35em] text-on-hero/60 sm:block">
            •••• •••• •••• 5000
          </span>
        )}
      </div>
    </div>
  );
}

