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
              <OfferCard offer={offer} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </section>
  );
}
