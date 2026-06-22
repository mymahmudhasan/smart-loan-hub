import { useMemo, useState } from "react";
import { Star, Quote, PenLine, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/language";
import { useAuth } from "@/context/auth";
import { listApprovedReviews, submitReview, type ClientReview } from "@/lib/reviews.functions";
import { cn } from "@/lib/utils";

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-4 w-4", i < count ? "fill-warning text-warning" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

function StaticReviews() {
  const reviews = [
    {
      name: "তাহমিনা আক্তার",
      role: "ক্ষুদ্র ব্যবসায়ী, ঢাকা",
      text: "একদিনের মধ্যেই আমার ঋণ অনুমোদন হয়েছে। পুরো প্রক্রিয়াটি ছিল সহজ ও সম্পূর্ণ অনলাইন।",
      rating: 5,
    },
    {
      name: "রাকিবুল হাসান",
      role: "সফটওয়্যার ইঞ্জিনিয়ার, চট্টগ্রাম",
      text: "স্বচ্ছ সুদের হার এবং কোনো লুকানো চার্জ নেই। গ্রাহক সহায়তা সত্যিই সহায়ক।",
      rating: 5,
    },
    {
      name: "নুসরাত জাহান",
      role: "শিক্ষক, সিলেট",
      text: "মেম্বারশিপ রিওয়ার্ড ও রেফারেল বোনাস আমাকে অনেক সাশ্রয় করতে সাহায্য করেছে। অত্যন্ত সুপারিশকৃত!",
      rating: 5,
    },
  ];
  return (
    <>
      {reviews.map((r) => (
        <ReviewCard key={r.name} name={r.name} role={r.role} text={r.text} rating={r.rating} />
      ))}
    </>
  );
}

function ReviewCard({
  name,
  role,
  title,
  avatarUrl,
  text,
  rating,
}: {
  name: string;
  role: string | null;
  title?: string | null;
  avatarUrl?: string | null;
  text: string;
  rating: number;
}) {
  return (
    <Card className="relative flex flex-col p-6">
      <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/10" />
      <StarRow count={rating} />
      {title && <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>}
      <p className={cn("text-sm text-foreground", title ? "mt-1.5" : "mt-4")}>{text}</p>
      <div className="mt-5 flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
            {name.charAt(0)}
          </span>
        )}
        <div>
          <div className="text-sm font-semibold">{name}</div>
          {role && <div className="text-xs text-muted-foreground">{role}</div>}
        </div>
      </div>
    </Card>
  );
}

function ReviewForm({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const submit = useServerFn(submitReview);

  const defaultName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split("@")[0] ?? "";
  const [name, setName] = useState(defaultName);
  const [role, setRole] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mut = useMutation({
    mutationFn: () =>
      submit({
        data: {
          reviewer_name: name.trim(),
          reviewer_role: role.trim() || null,
          review_title: null,
          avatar_url: null,
          rating,
          content: content.trim(),
        },
      }),
    onSuccess: () => {
      toast.success(t("review_submitted"));
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
      onDone();
    },
    onError: (e) => toast.error(t("review_submit_error"), { description: (e as Error).message }),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Min 2 characters";
    if (content.trim().length < 10) e.content = "Min 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    mut.mutate();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label>{t("review_name_label")}</Label>
        <Input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label>{t("review_role_label")}</Label>
        <Input
          value={role}
          maxLength={120}
          placeholder="Small business owner, Dhaka"
          onChange={(e) => setRole(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("review_title_label")}</Label>
        <Input
          value={title}
          maxLength={120}
          placeholder={t("review_title_ph")}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("review_avatar_label")}</Label>
        <Input
          value={avatarUrl}
          maxLength={500}
          type="url"
          inputMode="url"
          placeholder={t("review_avatar_ph")}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
        {errors.avatar && <p className="text-xs text-destructive">{errors.avatar}</p>}
      </div>
      <div className="space-y-2">
        <Label>{t("review_rating_label")}</Label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className="rounded p-0.5 transition-transform hover:scale-110"
              aria-label={`${i + 1} star`}
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  i < rating ? "fill-warning text-warning" : "text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("review_text_label")}</Label>
        <Textarea
          value={content}
          maxLength={1000}
          rows={4}
          placeholder={t("review_text_ph")}
          onChange={(e) => setContent(e.target.value)}
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
      </div>
      <Button type="submit" variant="hero" className="w-full" disabled={mut.isPending}>
        {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("review_submit")}
      </Button>
    </form>
  );
}

export function ClientReviews() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const fetchApproved = useServerFn(listApprovedReviews);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { data } = useQuery({
    queryKey: ["approved-reviews"],
    queryFn: () => fetchApproved() as Promise<ClientReview[]>,
  });

  const approved = useMemo(() => data ?? [], [data]);
  const initialLimit = 6;
  const hasMore = approved.length > initialLimit;
  const visible = expanded ? approved : approved.slice(0, initialLimit);

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
            <StarRow count={5} />
            <span className="text-sm font-medium text-muted-foreground">{t("reviews_rating")}</span>
          </div>

          <div className="mt-6">
            {user ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <PenLine className="h-4 w-4" />
                    {t("review_write")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t("review_share_title")}</DialogTitle>
                    <DialogDescription>{t("review_share_subtitle")}</DialogDescription>
                  </DialogHeader>
                  <ReviewForm onDone={() => setOpen(false)} />
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/login">
                  <PenLine className="h-4 w-4" />
                  {t("review_signin_cta")}
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.length > 0 ? (
            visible.map((r) => (
              <ReviewCard
                key={r.id}
                name={r.reviewer_name}
                role={r.reviewer_role}
                title={r.review_title}
                avatarUrl={r.avatar_url}
                text={r.content}
                rating={r.rating}
              />
            ))
          ) : (
            <StaticReviews />
          )}
        </div>

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <Button variant="outline" size="lg" onClick={() => setExpanded((v) => !v)}>
              {expanded ? t("reviews_show_less") : t("reviews_see_more")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
