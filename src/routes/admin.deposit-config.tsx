import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, KeyRound, Link2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  getGatewayConfigAdmin,
  updateGatewayConfig,
} from "@/lib/payment-gateway.functions";

export const Route = createFileRoute("/admin/deposit-config")({
  component: AdminGatewayConfig,
});

type FormState = {
  api_key: string;
  base_url: string;
  is_active: boolean;
};

function AdminGatewayConfig() {
  const fetchConfig = useServerFn(getGatewayConfigAdmin);
  const saveConfig = useServerFn(updateGatewayConfig);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["payment-gateway-admin"],
    queryFn: () => fetchConfig(),
  });

  const [form, setForm] = useState<FormState>({
    api_key: "",
    base_url: "https://pay.auratradeai.tech",
    is_active: true,
  });
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        api_key: "",
        base_url: data.base_url,
        is_active: data.is_active,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: FormState) =>
      saveConfig({
        data: {
          api_key: payload.api_key, // empty string keeps existing key
          base_url: payload.base_url.trim(),
          is_active: payload.is_active,
        },
      }),
    onSuccess: () => {
      toast.success("Payment gateway updated", {
        description: "New settings are live immediately.",
      });
      setForm((f) => ({ ...f, api_key: "" }));
      qc.invalidateQueries({ queryKey: ["payment-gateway-admin"] });
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
      <div>
        <h2 className="text-xl font-semibold">Payment Gateway</h2>
        <p className="text-sm text-muted-foreground">
          Set the gateway API key and base URL. Changes apply immediately — when you rotate the key,
          update it here to reconnect the gateway right away.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            {data?.configured ? (
              <Badge variant="secondary" className="gap-1 text-accent">
                <CheckCircle2 className="h-3.5 w-3.5" /> API key configured
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 text-warning">
                <AlertCircle className="h-3.5 w-3.5" /> No API key set
              </Badge>
            )}
            {data?.masked_key && (
              <span className="text-xs text-muted-foreground">Current: {data.masked_key}</span>
            )}
          </div>

          {/* API key */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <span className="font-medium">Gateway API Key</span>
            </div>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                className="pr-10"
                maxLength={300}
                placeholder={data?.configured ? "Enter a new key to replace it" : "Paste your gateway API key"}
                value={form.api_key}
                onChange={(e) => set("api_key", e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave blank to keep the current key. The full key is never displayed for security.
            </p>
          </div>

          <div className="border-t" />

          {/* Base URL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-accent" />
              <span className="font-medium">Gateway Base URL</span>
            </div>
            <Input
              type="url"
              maxLength={300}
              placeholder="https://pay.auratradeai.tech"
              value={form.base_url}
              onChange={(e) => set("base_url", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The base URL of your payment gateway (without a trailing slash).
            </p>
          </div>

          <div className="border-t" />

          {/* Active */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gateway_active" className="font-medium">
                Gateway Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Turn off to temporarily disable online payments.
              </p>
            </div>
            <Switch
              id="gateway_active"
              checked={form.is_active}
              onCheckedChange={(v) => set("is_active", v)}
            />
          </div>
        </CardContent>
      </Card>

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
