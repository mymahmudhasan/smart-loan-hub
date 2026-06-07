import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getFooterBanner,
  updateFooterBanner,
  FOOTER_BANNER_ICONS,
  type FooterBannerIcon,
  type FooterBannerBadge,
  type FooterBannerLink,
} from "@/lib/footer-banner.functions";
import { footerBannerIconMap } from "@/components/layout/footerBannerIcons";

export const Route = createFileRoute("/admin/footer")({
  component: AdminFooterBanner,
});

type FormState = {
  title: string;
  subtitle: string;
  badges: FooterBannerBadge[];
  links: FooterBannerLink[];
  active: boolean;
};

const emptyForm: FormState = {
  title: "",
  subtitle: "",
  badges: [],
  links: [],
  active: true,
};

function AdminFooterBanner() {
  const fetchBanner = useServerFn(getFooterBanner);
  const saveBanner = useServerFn(updateFooterBanner);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["footer-banner"],
    queryFn: () => fetchBanner(),
  });

  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        subtitle: data.subtitle,
        badges: data.badges,
        links: data.links,
        active: data.active,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: FormState) => saveBanner({ data: payload }),
    onSuccess: () => {
      toast.success("Footer banner saved");
      qc.invalidateQueries({ queryKey: ["footer-banner"] });
    },
    onError: (e) => toast.error("Could not save", { description: (e as Error).message }),
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Footer Trust Banner</h2>
          <p className="text-sm text-muted-foreground">
            Configure the text, badges, and links shown in the website footer banner.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="active" className="text-sm">
            Visible
          </Label>
          <Switch id="active" checked={form.active} onCheckedChange={(v) => set("active", v)} />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              maxLength={120}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Your trust, our commitment"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={form.subtitle}
              maxLength={240}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="Regulated, secure, and always here to help."
            />
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Trust badges</h3>
              <p className="text-sm text-muted-foreground">Up to 6 icon + label badges.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={form.badges.length >= 6}
              onClick={() =>
                set("badges", [...form.badges, { icon: "ShieldCheck", label: "" }])
              }
            >
              <Plus className="h-4 w-4" /> Add badge
            </Button>
          </div>
          {form.badges.length === 0 && (
            <p className="text-sm text-muted-foreground">No badges yet.</p>
          )}
          <div className="space-y-2">
            {form.badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select
                  value={badge.icon}
                  onValueChange={(v) => {
                    const next = [...form.badges];
                    next[i] = { ...next[i], icon: v as FooterBannerIcon };
                    set("badges", next);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOTER_BANNER_ICONS.map((name) => {
                      const Icon = footerBannerIconMap[name];
                      return (
                        <SelectItem key={name} value={name}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4" /> {name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Input
                  value={badge.label}
                  maxLength={60}
                  placeholder="Label"
                  onChange={(e) => {
                    const next = [...form.badges];
                    next[i] = { ...next[i], label: e.target.value };
                    set("badges", next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => set("badges", form.badges.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Links</h3>
              <p className="text-sm text-muted-foreground">Up to 6 label + URL links.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={form.links.length >= 6}
              onClick={() => set("links", [...form.links, { label: "", href: "" }])}
            >
              <Plus className="h-4 w-4" /> Add link
            </Button>
          </div>
          {form.links.length === 0 && (
            <p className="text-sm text-muted-foreground">No links yet.</p>
          )}
          <div className="space-y-2">
            {form.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={link.label}
                  maxLength={60}
                  placeholder="Label"
                  onChange={(e) => {
                    const next = [...form.links];
                    next[i] = { ...next[i], label: e.target.value };
                    set("links", next);
                  }}
                />
                <Input
                  value={link.href}
                  maxLength={200}
                  placeholder="/privacy or https://..."
                  onChange={(e) => {
                    const next = [...form.links];
                    next[i] = { ...next[i], href: e.target.value };
                    set("links", next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => set("links", form.links.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live preview */}
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Preview</p>
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <div className="flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-foreground">
                {form.title || "Title"}
              </h3>
              <p className="text-sm text-muted-foreground">{form.subtitle || "Subtitle"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {form.badges.map((b, i) => {
                const Icon = footerBannerIconMap[b.icon];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{b.label || "Badge"}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {form.links.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4 border-t px-4 py-3 sm:justify-start">
              {form.links.map((l, i) => (
                <span key={i} className="text-sm text-primary underline">
                  {l.label || "Link"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="hero" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  );
}
