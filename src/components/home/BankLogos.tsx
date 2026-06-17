export function BracBankLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="16" fill="#00A651"/>
      <path d="M32 12C22 12 14 20 14 30c0 8 5 14 12 16v6h12v-6c7-2 12-8 12-16 0-10-8-18-18-18z" fill="#fff" opacity="0.9"/>
      <path d="M32 18c-6.6 0-12 5.4-12 12 0 5.2 3.3 9.6 8 11.3V44h8v-2.7c4.7-1.7 8-6.1 8-11.3 0-6.6-5.4-12-12-12z" fill="#00A651"/>
      <circle cx="32" cy="30" r="5" fill="#fff"/>
    </svg>
  );
}

export function DbblLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="16" fill="#ED1C24"/>
      <path d="M14 32c0-12 8-18 18-18s18 6 18 18-8 18-18 18S14 44 14 32z" fill="#fff" opacity="0.95"/>
      <path d="M20 32c0-8 5-13 12-13s12 5 12 13-5 13-12 13S20 40 20 32z" fill="#ED1C24"/>
      <path d="M28 26c3 0 5 2 5 6s-2 6-5 6V26z" fill="#fff"/>
    </svg>
  );
}

export function IslamiBankLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="16" fill="#1B4D3E"/>
      <circle cx="32" cy="32" r="18" stroke="#fff" strokeWidth="3" fill="none" opacity="0.9"/>
      <path d="M32 14a18 18 0 0 1 0 36 14 14 0 0 0 0-28 14 14 0 0 0 0 28" stroke="#fff" strokeWidth="3" fill="none" opacity="0.9"/>
      <circle cx="38" cy="24" r="2.5" fill="#fff"/>
    </svg>
  );
}

export function SonaliBankLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="16" fill="#0055A5"/>
      <circle cx="32" cy="32" r="14" fill="#fff" opacity="0.95"/>
      <path d="M32 14c-2 8-10 14-10 22 0 6 4.5 10 10 10s10-4 10-10c0-8-8-14-10-22z" fill="#0055A5"/>
      <circle cx="32" cy="36" r="4" fill="#fff"/>
    </svg>
  );
}

export function CityBankLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="16" fill="#F57C00"/>
      <path d="M20 32c0-8 5-14 12-14s12 6 12 14-5 14-12 14" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.95"/>
      <circle cx="32" cy="32" r="5" fill="#fff"/>
    </svg>
  );
}

export const bankLogos: Record<string, React.FC<{ className?: string }>> = {
  BRAC: BracBankLogo,
  DBBL: DbblLogo,
  IBBL: IslamiBankLogo,
  SONALI: SonaliBankLogo,
  CITY: CityBankLogo,
};
