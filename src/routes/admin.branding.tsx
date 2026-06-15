import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, Save, Trash2, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getBranding, updateBranding } from "@/lib/branding.functions";

export const Route = createFileRoute("/admin/branding")({
  component: AdminBranding,
});

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_FAVICON_BYTES = 1 * 1024 * 1024; // 1MB

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function AdminBranding() {
  const fetchBranding = useServerFn(getBranding);
  const saveBranding = useServerFn(updateBranding);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["site-branding"],
    queryFn: () => fetchBranding(),
  });

  const [brandName, setBrandName] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const faviconInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) {
      setBrandName(data.brandName ?? "");
      setLogo(data.logoUrl ?? null);
      setFavicon(data.faviconUrl ?? null);
    }
  }, [data]);

  const handleFile = async (
    file: File | undefined,
    maxBytes: number,
    setter: (v: string) => void,
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > maxBytes) {
      toast.error(`Image too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)`);
      return;
    }
    try {
      const url = await fileToDataUrl(file);
      setter(url);
    } catch {
      toast.error("Could not read the image");
    }
  };

  const mutation = useMutation({
    mutationFn: () =>
      saveBranding({
        data: {
          logoUrl: logo,
          faviconUrl: favicon,
          brandName: brandName.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success("Branding saved", {
        description: "Your logo and favicon are now live across the site.",
      });
      qc.invalidateQueries({ queryKey: ["site-branding"] });
    },
    onError: (e) => toast.error("Could not save", { description: (e as Error).message }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Branding</h2>
        <p className="text-sm text-muted-foreground">
          Upload your site logo and favicon. Changes apply everywhere immediately after saving.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          {/* Brand name */}
          <div className="space-y-2">
            <Label htmlFor="brand-name">Brand name (optional)</Label>
            <Input
              id="brand-name"
              value={brandName}
              maxLength={60}
              placeholder="Smart Loan"
              onChange={(e) => setBrandName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shown next to the logo in the navigation bar.
            </p>
          </div>

          {/* Logo */}
          <div className="space-y-3">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                {logo ? (
                  <img src={logo} alt="Logo preview" className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={logoInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0], MAX_LOGO_BYTES, setLogo)}
                />
                <Button type="button" variant="outline" onClick={() => logoInput.current?.click()}>
                  <Upload className="h-4 w-4" /> Choose logo
                </Button>
                {logo && (
                  <Button type="button" variant="ghost" onClick={() => setLogo(null)}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP or SVG. Max 2MB.</p>
          </div>

          {/* Favicon */}
          <div className="space-y-3">
            <Label>Favicon</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                {favicon ? (
                  <img src={favicon} alt="Favicon preview" className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={faviconInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0], MAX_FAVICON_BYTES, setFavicon)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => faviconInput.current?.click()}
                >
                  <Upload className="h-4 w-4" /> Choose favicon
                </Button>
                {favicon && (
                  <Button type="button" variant="ghost" onClick={() => setFavicon(null)}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Square image works best (e.g. 64×64). PNG or ICO. Max 1MB.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              variant="hero"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save branding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
