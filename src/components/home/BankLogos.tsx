// Bangladeshi MFS brand logos as Lovable Asset imports.
// Based on official brand identities: bKash, Nagad, Rocket, Upay.

import bkashAsset from "@/assets/bkash-logo.png.asset.json";
import nagadAsset from "@/assets/nagad-logo.png.asset.json";
import rocketAsset from "@/assets/rocket-logo.png.asset.json";
import upayAsset from "@/assets/upay-logo.png.asset.json";

export const bankLogos: Record<string, { url: string; alt: string }> = {
  BKASH: { url: bkashAsset.url, alt: "bKash" },
  NAGAD: { url: nagadAsset.url, alt: "Nagad" },
  ROCKET: { url: rocketAsset.url, alt: "Rocket" },
  UPAY: { url: upayAsset.url, alt: "Upay" },
};
