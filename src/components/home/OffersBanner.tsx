import { Landmark } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/context/language";
import type { BannerOffer } from "@/lib/banner.functions";
import { OfferCard } from "./OfferCard";

export function OffersBanner({ offers }: { offers: BannerOffer[] }) {
  const { t } = useLanguage();
  if (!offers.length) return null;

  return (
    <section className="relative overflow-hidden bg-slate-950 py-12 lg:py-16">
      {/* subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              <Landmark className="h-3.5 w-3.5" /> {t("offers_eyebrow")}
            </span>
            <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              {t("offers_title")}
            </h2>
            <p className="text-sm text-slate-400">{t("offers_subtitle")}</p>
          </div>
        </div>

        <Carousel opts={{ loop: true, align: "start" }} className="w-full">
          <CarouselContent className="-ml-4">
            {offers.map((offer) => (
              <CarouselItem key={offer.id} className="pl-4 md:basis-4/5 lg:basis-3/4">
                <OfferCard offer={offer} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1 h-10 w-10 border-white/20 bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white sm:-left-5" />
          <CarouselNext className="right-1 h-10 w-10 border-white/20 bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white sm:-right-5" />
        </Carousel>
      </div>
    </section>
  );
}

