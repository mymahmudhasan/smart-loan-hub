import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language";
import { getContactInfo } from "@/lib/contact-info.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Smart Loan" },
      { name: "description", content: "Get in touch with the Smart Loan team for support with membership, loans and payments." },
    ],
  }),
  component: Contact,
});

const fallback = {
  hotline: "+880 1700-000000",
  email: "support@smartloan.com.bd",
  office: "Gulshan-1, Dhaka, Bangladesh",
};

function Contact() {
  const { t, lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const fetchInfo = useServerFn(getContactInfo);
  const { data: contact } = useQuery({
    queryKey: ["contact-info"],
    queryFn: () => fetchInfo(),
  });

  const info = [
    { icon: Phone, label: L("Hotline", "হটলাইন"), value: contact?.hotline || fallback.hotline },
    { icon: Mail, label: L("Email", "ইমেইল"), value: contact?.email || fallback.email },
    { icon: MapPin, label: L("Office", "অফিস"), value: contact?.office || fallback.office },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast.error(L("Please fill in your name and message", "অনুগ্রহ করে আপনার নাম ও বার্তা পূরণ করুন"));
      return;
    }
    toast.success(L("Message sent", "বার্তা পাঠানো হয়েছে"), { description: L("Our team will get back to you within 24 hours.", "আমাদের টিম ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করবে।") });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{t("nav_contact")}</h1>
        <p className="mt-2 text-muted-foreground">{L("We're here to help, every step of the way.", "প্রতিটি ধাপে আমরা আপনাকে সাহায্য করতে এখানে আছি।")}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {info.map((i) => (
            <Card key={i.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <i.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{i.label}</p>
                  <p className="font-semibold">{i.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we help?"
                  maxLength={1000}
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full">
                <Send className="h-4 w-4" /> Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
