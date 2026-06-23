// Bangladeshi MFS brand logos as Lovable Asset imports.
// We currently accept bKash only.

import bkashAsset from "@/assets/bkash-logo.png.asset.json";

export const bankLogos: Record<string, { url: string; alt: string }> = {
  BKASH: { url: bkashAsset.url, alt: "bKash" },
};

