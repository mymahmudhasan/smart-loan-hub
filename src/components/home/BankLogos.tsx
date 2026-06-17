// Brand-style logo marks for popular Bangladeshi banks & MFS providers.
// Recreated as inline SVG approximations of the real brand identities.

type LogoProps = { className?: string };

// bKash — pink rounded square with stylized "b" + wordmark
export function BkashLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 120 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="8" width="48" height="48" rx="12" fill="#E2136E" />
      <path
        d="M20 18v28M20 32c0-5 3-9 9-9 5 0 9 4 9 9s-4 9-9 9c-3 0-5-1-7-3"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <text x="56" y="40" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700" fill="#E2136E">
        bKash
      </text>
    </svg>
  );
}

// Nagad — orange flame swoosh + wordmark
export function NagadLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 120 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 10c-7 7-12 13-12 22 0 9 6 16 14 16s14-7 14-16c0-5-2-9-5-13 1 5-1 9-4 9-4 0-5-4-3-8 1-3 1-6-4-10z"
        fill="#F7941D"
      />
      <path d="M26 30c-3 3-5 6-5 10 0 4 2 7 5 7s5-3 5-7c0-3-1-5-3-8 0 2-1 3-2 3s-2-2 0-5z" fill="#ED1C24" />
      <text x="46" y="40" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700" fill="#F7941D">
        Nagad
      </text>
    </svg>
  );
}

// Rocket (DBBL Mobile Banking) — purple rocket diamond + wordmark
export function RocketLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 120 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M24 8l14 24-14 24-14-24z" fill="#8C228F" />
      <path d="M24 8l14 24h-28z" fill="#B14FB3" />
      <circle cx="24" cy="28" r="5" fill="#fff" />
      <text x="46" y="40" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" fill="#8C228F">
        Rocket
      </text>
    </svg>
  );
}

// City Bank — red square emblem + wordmark
export function CityBankLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 120 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="12" width="40" height="40" rx="6" fill="#ED1C24" />
      <path d="M12 42V22h6v20zM22 42V22h6v20zM32 42V22h6v20z" fill="#fff" />
      <path d="M8 20l14-8 14 8z" fill="#fff" />
      <text x="48" y="30" fontFamily="Georgia, serif" fontSize="14" fontWeight="700" fill="#ED1C24">
        City Bank
      </text>
      <text x="48" y="46" fontFamily="Arial, sans-serif" fontSize="9" fill="#555">
        Make Life Simple
      </text>
    </svg>
  );
}

// BRAC Bank — navy + magenta squares + wordmark
export function BracBankLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 120 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="14" width="16" height="16" rx="2" fill="#00529B" />
      <rect x="22" y="14" width="16" height="16" rx="2" fill="#E6007E" />
      <rect x="4" y="32" width="16" height="16" rx="2" fill="#E6007E" />
      <rect x="22" y="32" width="16" height="16" rx="2" fill="#00529B" />
      <text x="44" y="32" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="800" fill="#00529B">
        BRAC
      </text>
      <text x="44" y="47" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#E6007E">
        Bank
      </text>
    </svg>
  );
}

// Dutch-Bangla Bank — blue/red tulip emblem + wordmark
export function DbblLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 120 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12c-6 6-10 12-10 20 0 8 5 14 12 14s12-6 12-14c0-8-4-14-10-20-1 6-3 9-2 14-3-3-3-8-2-14z" fill="#0061A8" />
      <path d="M24 22c4 4 6 8 6 12 0 4-2 6-6 6s-6-2-6-6c0-4 2-8 6-12z" fill="#ED1C24" />
      <text x="40" y="32" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fill="#0061A8">
        Dutch-Bangla
      </text>
      <text x="40" y="46" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fill="#ED1C24">
        Bank
      </text>
    </svg>
  );
}

export const bankLogos: Record<string, React.FC<LogoProps>> = {
  BKASH: BkashLogo,
  NAGAD: NagadLogo,
  ROCKET: RocketLogo,
  CITY: CityBankLogo,
  BRAC: BracBankLogo,
  DBBL: DbblLogo,
};
