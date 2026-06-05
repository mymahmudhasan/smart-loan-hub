import { ArrowRight, Landmark, Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language";
import { cn } from "@/lib/utils";
import type { BannerOffer } from "@/lib/banner.functions";

const themeClass: Record<string, string> = {
  primary: "gradient-primary",
  gold: "gradient-gold",
  emerald: "gradient-emerald",
  midnight: "gradient-midnight",
};

export function OffersBanner({ offers }: { offers: BannerOffer[] }) {
  const { t } = useLanguage();
  if (!offers.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 pb-2 lg:pb-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
            <Landmark className="h-3.5 w-3.5" /> {t("offers_eyebrow")}
          </span>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{t("offers_title")}</h2>
          <p className="text-sm text-muted-foreground">{t("offers_subtitle")}</p>
        </div>
      </div>

      <Carousel opts={{ loop: true, align: "start" }} className="w-full">
        <CarouselContent>
          {offers.map((offer) => (
            <CarouselItem key={offer.id} className="md:basis-4/5 lg:basis-3/4">
              <div
                className={cn(
                  "relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-elegant sm:p-8",
                  themeClass[offer.theme] ?? themeClass.primary,
                )}
              >
                {/* decorative bank-card flourishes */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute right-6 top-6 h-9 w-12 rounded-md bg-white/25" />
                <div className="pointer-events-none absolute -bottom-12 -left-6 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

                <div className="relative">
                  {offer.badge && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-on-hero backdrop-blur">
                      <Sparkles className="h-3.5 w-3.5" /> {offer.badge}
                    </span>
                  )}
                  <h3 className="mt-4 max-w-xl text-2xl font-extrabold leading-tight text-on-hero sm:text-3xl">
                    {offer.title}
                  </h3>
                  {offer.subtitle && (
                    <p className="mt-2 max-w-lg text-sm text-on-hero/80 sm:text-base">
                      {offer.subtitle}
                    </p>
                  )}
                </div>

                <div className="relative mt-6 flex items-center justify-between gap-4">
                  <Button asChild variant="glass" size="lg">
                    <a href={offer.cta_href}>
                      {offer.cta_label} <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <span className="hidden font-mono text-sm tracking-[0.3em] text-on-hero/70 sm:block">
                    •••• •••• •••• 5000
                  </span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </section>
  );
}
