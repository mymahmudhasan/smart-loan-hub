import { useState, useRef, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, X, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language";
import { SITE_CONFIG } from "@/config/site";
import { getContactInfo } from "@/lib/contact-info.functions";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.125.298-.327.446-.49.149-.165.198-.297.298-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.284A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.134 1.585 5.929L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export function GlobalActions() {
  const { t, lang } = useLanguage();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fetchInfo = useServerFn(getContactInfo);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  useClickOutside(widgetRef, () => setOpen(false));

  const { data: contact } = useQuery({
    queryKey: ["contact-info"],
    queryFn: () => fetchInfo(),
    staleTime: 5 * 60 * 1000,
  });

  // Keep admin workspaces clean; the buttons remain global on all public/member pages.
  if (pathname.startsWith("/admin")) return null;

  const configured = (contact?.whatsappNumber || "").replace(/\D/g, "");
  const fallback = SITE_CONFIG.whatsappNumber.replace(/\D/g, "");
  const waNumber = configured || (fallback.includes("X") ? "" : fallback);
  const waMessage = contact?.whatsappMessage?.trim() || "";
  const questions = contact?.whatsappQuestions ?? [];

  const makeLink = (text: string) => {
    if (!waNumber) return "#";
    const encoded = encodeURIComponent(text || waMessage);
    return `https://wa.me/${waNumber}${encoded ? `?text=${encoded}` : ""}`;
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (!text || !waNumber) return;
    window.open(makeLink(text), "_blank", "noopener,noreferrer");
    setDraft("");
    setOpen(false);
  };

  const sendQuestion = (message: string) => {
    if (!waNumber) return;
    window.open(makeLink(message), "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const whatsappConfigured = Boolean(waNumber);

  return (
    <>
      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 p-3 shadow-elegant backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2">
          <Button variant="hero" size="lg" className="w-full gap-2" asChild>
            <Link to="/apply">
              {t("global_cta_loan")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="whatsapp"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-full"
            aria-label={open ? t("wa_close") : t("whatsapp_label")}
            onClick={() => whatsappConfigured && setOpen((v) => !v)}
            disabled={!whatsappConfigured}
          >
            {open ? <X className="h-5 w-5" /> : <WhatsAppIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Desktop loan CTA */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:flex p-2">
        <Button variant="hero" size="lg" className="gap-2" asChild>
          <Link to="/apply">
            {t("global_cta_loan")} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Desktop WhatsApp */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex p-2">
        <Button
          variant="whatsapp"
          size="icon"
          className="h-11 w-11 rounded-full"
          aria-label={open ? t("wa_close") : t("whatsapp_label")}
          onClick={() => whatsappConfigured && setOpen((v) => !v)}
          disabled={!whatsappConfigured}
        >
          {open ? <X className="h-5 w-5" /> : <WhatsAppIcon className="h-5 w-5" />}
        </Button>
      </div>

      {/* WhatsApp quick-questions widget */}
      {open && whatsappConfigured && (
        <div
          ref={widgetRef}
          className="fixed bottom-[7rem] right-2 z-50 w-[calc(100%-1rem)] max-w-sm sm:bottom-24 sm:right-8"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
            {/* Header */}
            <div className="flex items-center gap-3 bg-whatsapp px-4 py-3 text-whatsapp-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <WhatsAppIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold leading-tight">{t("wa_widget_title")}</p>
                <p className="text-xs opacity-90">{t("wa_widget_status")}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-whatsapp-foreground hover:bg-white/20"
                onClick={() => setOpen(false)}
                aria-label={t("wa_close")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="space-y-3 p-4">
              <div className="rounded-2xl rounded-tl-sm bg-muted p-3 text-sm text-foreground">
                {t("wa_widget_greeting")}
              </div>

              {questions.length > 0 && (
                <div className="flex flex-col gap-2">
                  {questions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="h-auto justify-start rounded-full border-border bg-background px-4 py-2.5 text-left text-sm font-normal leading-snug hover:bg-muted whitespace-normal"
                      onClick={() => sendQuestion(q.message || q.label[lang] || q.label.en)}
                    >
                      {q.label[lang] || q.label.en}
                    </Button>
                  ))}
                </div>
              )}

              {/* Custom input */}
              <div className="flex items-center gap-2 rounded-full border border-input bg-background px-3 py-1.5">
                <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendDraft()}
                  placeholder={t("wa_input_placeholder")}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button
                  variant="whatsapp"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  onClick={sendDraft}
                  disabled={!draft.trim()}
                  aria-label={t("wa_send")}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
