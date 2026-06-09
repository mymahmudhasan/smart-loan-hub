import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  getDepositConfigAdmin,
  updateDepositConfig,
  type DepositConfig,
} from "@/lib/deposit-config.functions";

export const Route = createFileRoute("/admin/deposit-config")({
  component: AdminDepositConfig,
});

type FormState = {
  bkash_number: string;
  nagad_number: string;
  bkash_active: boolean;
  nagad_active: boolean;
};

const emptyForm: FormState = {
  bkash_number: "",
  nagad_number: "",
  bkash_active: true,
  nagad_active: true,
};

function AdminDepositConfig() {
  const fetchConfig = useServerFn(getDepositConfigAdmin);
  const saveConfig = useServerFn(updateDepositConfig);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["deposit-config-admin"],
    queryFn: () => fetchConfig(),
  });

  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (data) {
      setForm({
        bkash_number: data.bkash_number ?? "",
        nagad_number: data.nagad_number ?? "",
        bkash_active: data.bkash_active,
        nagad_active: data.nagad_active,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: FormState) =>
      saveConfig({
        data: {
          bkash_number: payload.bkash_number || null,
          nagad_number: payload.nagad_number || null,
          bkash_active: payload.bkash_active,
          nagad_active: payload.nagad_active,
        },
      }),
    onSuccess: () => {
      toast.success("Payment config saved");
      qc.invalidateQueries({ queryKey: ["deposit-config-admin"] });
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
        <h2 className="text-xl font-semibold">Payment Method Numbers</h2>
        <p className="text-sm text-muted-foreground">
          Set the active bKash and Nagad numbers members see when making deposits. Change these when a number hits its transaction limit.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* bKash */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                <span className="font-medium">bKash Number</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="bkash_active" className="text-sm">
                  Active
                </Label>
                <Switch
                  id="bkash_active"
                  checked={form.bkash_active}
                  onCheckedChange={(v) => set("bkash_active", v)}
                />
              </div>
            </div>
            <Input
              value={form.bkash_number}
              maxLength={20}
              placeholder="01XXXXXXXXX"
              onChange={(e) => set("bkash_number", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Members will see this number on the deposit page when they choose bKash.
            </p>
          </div>

          <div className="border-t" />

          {/* Nagad */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-accent" />
                <span className="font-medium">Nagad Number</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="nagad_active" className="text-sm">
                  Active
                </Label>
                <Switch
                  id="nagad_active"
                  checked={form.nagad_active}
                  onCheckedChange={(v) => set("nagad_active", v)}
                />
              </div>
            </div>
            <Input
              value={form.nagad_number}
              maxLength={20}
              placeholder="01XXXXXXXXX"
              onChange={(e) => set("nagad_number", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Members will see this number on the deposit page when they choose Nagad.
            </p>
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
