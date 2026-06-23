import bkashLogo from "@/assets/bkash-logo.png";
import nagadLogo from "@/assets/nagad-logo.png";
import bracLogo from "@/assets/brac-bank-logo.png";
import cityLogo from "@/assets/city-bank-logo.png";
import dutchBanglaLogo from "@/assets/dutch-bangla-bank-logo.png";

export const bankLogos: Record<string, { url: string; alt: string }> = {
  BKASH: { url: bkashLogo, alt: "bKash" },
  NAGAD: { url: nagadLogo, alt: "Nagad" },
  BRAC: { url: bracLogo, alt: "BRAC Bank" },
  CITY: { url: cityLogo, alt: "City Bank" },
  DUTCH_BANGLA: { url: dutchBanglaLogo, alt: "Dutch-Bangla Bank" },
};

