import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getContactInfo, updateContactInfo } from "@/lib/contact-info.functions";

export const Route = createFileRoute("/admin/contact")({
  component: AdminContactInfo,
});

type FormState = {
  hotline: string;
  email: string;
  office: string;
  whatsappNumber: string;
  whatsappMessage: string;
};

const emptyForm: FormState = {
  hotline: "",
  email: "",
  office: "",
  whatsappNumber: "",
  whatsappMessage: "",
};

function AdminContactInfo() {
  const fetchInfo = useServerFn(getContactInfo);
  const saveInfo = useServerFn(updateContactInfo);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["contact-info"],
    queryFn: () => fetchInfo(),
  });

  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (data) {
      setForm({
        hotline: data.hotline,
        email: data.email,
        office: data.office,
        whatsappNumber: data.whatsappNumber,
        whatsappMessage: data.whatsappMessage,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: FormState) => saveInfo({ data: payload }),
    onSuccess: () => {
      toast.success("Contact details saved");
      qc.invalidateQueries({ queryKey: ["contact-info"] });
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
        <h2 className="text-xl font-semibold">Contact Details</h2>
        <p className="text-sm text-muted-foreground">
          Edit the hotline, email and office address shown on the public Contact page.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Hotline
            </Label>
            <Input
              value={form.hotline}
              onChange={(e) => set("hotline", e.target.value)}
              placeholder="+880 1700-000000"
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Email
            </Label>
            <Input
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="support@smartloan.com.bd"
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Office Address
            </Label>
            <Input
              value={form.office}
              onChange={(e) => set("office", e.target.value)}
              placeholder="Gulshan-1, Dhaka, Bangladesh"
              maxLength={240}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp Number
            </Label>
            <Input
              value={form.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value)}
              placeholder="8801712345678 (international format, no +)"
              maxLength={40}
            />
            <p className="text-xs text-muted-foreground">
              Used by the floating WhatsApp button. Enter the full number in international format, digits only.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp Default Message
            </Label>
            <Textarea
              value={form.whatsappMessage}
              onChange={(e) => set("whatsappMessage", e.target.value)}
              placeholder="Hello! I want to know more about your loans."
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This message is pre-filled in the chat when a visitor taps the WhatsApp button.
            </p>
          </div>


          <Button
            variant="hero"
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
