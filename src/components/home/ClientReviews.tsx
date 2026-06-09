import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/language";

export function ClientReviews() {
  const { t } = useLanguage();

  const reviews = [
    { name: "review1_name" as const, role: "review1_role" as const, text: "review1_text" as const },
    { name: "review2_name" as const, role: "review2_role" as const, text: "review2_text" as const },
    { name: "review3_name" as const, role: "review3_role" as const, text: "review3_text" as const },
  ];

  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {t("reviews_eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("reviews_title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("reviews_subtitle")}</p>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-warning text-warning" />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">{t("reviews_rating")}</span>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <Card key={r.name} className="relative p-6">
              <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/10" />
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="mt-4 text-sm text-foreground">{t(r.text)}</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                  {t(r.name).charAt(0)}
                </span>
                <div>
                  <div className="text-sm font-semibold">{t(r.name)}</div>
                  <div className="text-xs text-muted-foreground">{t(r.role)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
