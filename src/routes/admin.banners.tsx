import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Monitor, Smartphone, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listAllBanners, upsertBanner, deleteBanner, type BannerOffer } from "@/lib/banner.functions";
import { cn } from "@/lib/utils";
import {
  OfferCard,
  bannerThemes,
  ctaStyles,
  textStyles,
  ctaStyleLabel,
  textStyleLabel,
  type CtaStyle,
  type TextStyle,
} from "@/components/home/OfferCard";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

const themes = bannerThemes;
const themeSwatch: Record<string, string> = {
  primary: "gradient-primary",
  gold: "gradient-gold",
  emerald: "gradient-emerald",
  midnight: "gradient-midnight",
};


type FormState = {
  id?: string;
  title: string;
  subtitle: string;
  badge: string;
  cta_label: string;
  cta_href: string;
  theme: (typeof themes)[number];
  cta_style: CtaStyle;
  text_style: TextStyle;
  sort_order: number;
  active: boolean;
};

const emptyForm: FormState = {
  title: "",
  subtitle: "",
  badge: "",
  cta_label: "Apply Now",
  cta_href: "/signup",
  theme: "primary",
  cta_style: "glass",
  text_style: "classic",
  sort_order: 0,
  active: true,
};

function BannerPreviewCard({ offer }: { offer: BannerOffer }) {
  return <OfferCard offer={offer} preview />;
}


function AdminBanners() {
  const fetchAll = useServerFn(listAllBanners);
  const save = useServerFn(upsertBanner);
  const remove = useServerFn(deleteBanner);
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [previewOffer, setPreviewOffer] = useState<BannerOffer | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: () => fetchAll() as Promise<BannerOffer[]>,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "banners"] });

  const saveMut = useMutation({
    mutationFn: (payload: FormState) =>
      save({
        data: {
          id: payload.id,
          title: payload.title.trim(),
          subtitle: payload.subtitle.trim() || null,
          badge: payload.badge.trim() || null,
          cta_label: payload.cta_label.trim(),
          cta_href: payload.cta_href.trim(),
          theme: payload.theme,
          cta_style: payload.cta_style,
          text_style: payload.text_style,
          sort_order: Number(payload.sort_order) || 0,
          active: payload.active,
        },
      }),
    onSuccess: () => {
      toast.success("Offer saved");
      setOpen(false);
      invalidate();
    },
    onError: (e) => toast.error("Could not save offer", { description: (e as Error).message }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Offer deleted");
      invalidate();
    },
    onError: (e) => toast.error("Could not delete", { description: (e as Error).message }),
  });

  const toggleMut = useMutation({
    mutationFn: (b: BannerOffer) =>
      save({
        data: {
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          badge: b.badge,
          cta_label: b.cta_label,
          cta_href: b.cta_href,
          theme: b.theme as FormState["theme"],
          sort_order: b.sort_order,
          active: !b.active,
        },
      }),
    onSuccess: () => invalidate(),
    onError: (e) => toast.error("Could not update", { description: (e as Error).message }),
  });

  const openNew = () => {
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (b: BannerOffer) => {
    setForm({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle ?? "",
      badge: b.badge ?? "",
      cta_label: b.cta_label,
      cta_href: b.cta_href,
      theme: (b.theme as FormState["theme"]) ?? "primary",
      sort_order: b.sort_order,
      active: b.active,
    });
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 2) e.title = "Title is required (min 2 chars)";
    if (!form.cta_label.trim()) e.cta_label = "Button label is required";
    if (!form.cta_href.trim()) e.cta_href = "Button link is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    saveMut.mutate(form);
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Hero Banner Offers</h2>
          <p className="text-sm text-muted-foreground">
            Bank-style promotions shown on the homepage. Add as many offers as you like.
          </p>
        </div>
        <Button variant="hero" onClick={openNew}>
          <Plus className="h-4 w-4" /> New Offer
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !data?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No offers yet. Create your first bank-style offer.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data.map((b) => (
            <Card key={b.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div
                  className={`flex h-16 w-24 shrink-0 items-center justify-center rounded-xl ${themeSwatch[b.theme] ?? themeSwatch.primary}`}
                >
                  <span className="text-xs font-semibold text-on-hero">#{b.sort_order}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{b.title}</p>
                    {b.badge && <Badge variant="secondary">{b.badge}</Badge>}
                    {b.active ? (
                      <Badge className="bg-accent/15 text-accent hover:bg-accent/15">Active</Badge>
                    ) : (
                      <Badge variant="outline">Hidden</Badge>
                    )}
                  </div>
                  {b.subtitle && (
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{b.subtitle}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {b.cta_label} → {b.cta_href}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewOffer(b)}
                    title="Preview on homepage"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMut.mutate(b)}
                    title={b.active ? "Hide" : "Show"}
                  >
                    {b.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this offer?")) delMut.mutate(b.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Offer" : "New Offer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={120}
                placeholder="Loans up to 10× your balance at 8%"
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Textarea
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                maxLength={240}
                rows={2}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  maxLength={40}
                  placeholder="Flagship Offer"
                />
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={form.theme}
                  onValueChange={(v) => setForm({ ...form, theme: v as FormState["theme"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((th) => (
                      <SelectItem key={th} value={th}>
                        {th.charAt(0).toUpperCase() + th.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Button Label *</Label>
                <Input
                  value={form.cta_label}
                  onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                  maxLength={40}
                />
                {errors.cta_label && <p className="text-xs text-destructive">{errors.cta_label}</p>}
              </div>
              <div className="space-y-2">
                <Label>Button Link *</Label>
                <Input
                  value={form.cta_href}
                  onChange={(e) => setForm({ ...form, cta_href: e.target.value })}
                  maxLength={200}
                  placeholder="/signup"
                />
                {errors.cta_href && <p className="text-xs text-destructive">{errors.cta_href}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 items-end gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  min={0}
                  max={999}
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" variant="hero" disabled={saveMut.isPending}>
                {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Offer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewOffer} onOpenChange={(v) => !v && setPreviewOffer(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Homepage Preview</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2 pb-2">
            <ToggleGroup
              type="single"
              value={previewDevice}
              onValueChange={(v) => v && setPreviewDevice(v as "desktop" | "mobile")}
              className="bg-muted/50 rounded-lg p-1"
            >
              <ToggleGroupItem value="desktop" aria-label="Desktop">
                <Monitor className="h-4 w-4 mr-1.5" /> Desktop
              </ToggleGroupItem>
              <ToggleGroupItem value="mobile" aria-label="Mobile">
                <Smartphone className="h-4 w-4 mr-1.5" /> Mobile
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className={cn(
            "mx-auto w-full transition-all duration-300",
            previewDevice === "mobile" ? "max-w-[390px]" : "max-w-full"
          )}>
            {/* Mock homepage container */}
            <div className="rounded-xl border bg-background p-4 shadow-sm">
              {/* Fake navbar strip */}
              <div className="mb-4 flex items-center justify-between">
                <div className="h-6 w-24 rounded bg-muted" />
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted" />
                  <div className="h-6 w-6 rounded-full bg-muted" />
                </div>
              </div>

              {/* Offers section header */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
                  <Landmark className="h-3.5 w-3.5" /> Exclusive Offers
                </span>
                <h2 className="mt-1 text-lg font-bold sm:text-xl">Offers & Promotions</h2>
                <p className="text-xs text-muted-foreground">Limited time benefits for our members.</p>
              </div>

              {/* The actual banner card */}
              {previewOffer && <BannerPreviewCard offer={previewOffer} />}

              {/* Mock content below */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="h-20 rounded-lg bg-muted" />
                <div className="h-20 rounded-lg bg-muted" />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setPreviewOffer(null)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
