import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBranding } from "@/lib/branding.functions";

type Branding = {
  logoUrl: string | null;
  faviconUrl: string | null;
  brandName: string | null;
};

const BrandingContext = createContext<Branding>({
  logoUrl: null,
  faviconUrl: null,
  brandName: null,
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const fetchBranding = useServerFn(getBranding);
  const { data } = useQuery({
    queryKey: ["site-branding"],
    queryFn: () => fetchBranding(),
    staleTime: 5 * 60 * 1000,
  });

  const branding: Branding = {
    logoUrl: data?.logoUrl ?? null,
    faviconUrl: data?.faviconUrl ?? null,
    brandName: data?.brandName ?? null,
  };

  // Swap the favicon dynamically when a custom one is set.
  useEffect(() => {
    if (!branding.faviconUrl || typeof document === "undefined") return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = branding.faviconUrl;
  }, [branding.faviconUrl]);

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
