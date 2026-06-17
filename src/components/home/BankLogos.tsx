// Brand-style logo marks for popular Bangladeshi banks.
// Recreated as inline SVG approximations of the real brand identities,
// designed to render on a white/light card like the reference sheet.

type LogoProps = { className?: string };

// Standard Chartered — green + blue interlocking "S" marks + wordmark
export function StandardCharteredLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M18 12c-7 0-12 4-12 10 0 5 4 7 9 8 3 1 5 1 5 3s-2 3-5 3-6-1-8-3" stroke="#0473EA" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M30 16c-7 0-12 4-12 10 0 5 4 7 9 8 3 1 5 1 5 3s-2 3-5 3" stroke="#38B449" strokeWidth="4" strokeLinecap="round" fill="none" />
      <text x="50" y="26" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="400" fill="#333">standard</text>
      <text x="50" y="42" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="400" fill="#333">chartered</text>
    </svg>
  );
}

// BRAC Bank — blue square block + bold wordmark
export function BracBankLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="14" width="22" height="22" rx="2" fill="#0067B1" />
      <path d="M9 19h10v4H9zM9 25h12v4H9zM9 31h8v3H9z" fill="#fff" />
      <text x="32" y="28" fontFamily="Arial, sans-serif" fontSize="17" fontWeight="800" fill="#0067B1">BRAC BANK</text>
      <text x="32" y="42" fontFamily="Arial, sans-serif" fontSize="10" fill="#E6007E">আস্থা অর্জন</text>
    </svg>
  );
}

// City Bank — red folded ribbon mark + wordmark
export function CityBankLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 14l20 6-20 6z" fill="#ED1C24" />
      <path d="M8 26l20 6-20 6z" fill="#9E1B20" />
      <text x="6" y="50" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800" fill="#333">city bank</text>
    </svg>
  );
}

// Dutch-Bangla Bank — multicolor oval globe + wordmark
export function DbblLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(6 16)">
        <ellipse cx="18" cy="12" rx="18" ry="11" fill="#1a1a1a" />
        <path d="M2 9c6-3 12-3 18-1s12 3 14 1" stroke="#ED1C24" strokeWidth="2.5" fill="none" />
        <path d="M1 13c7-2 13-1 19 1s11 2 14 0" stroke="#00A651" strokeWidth="2.5" fill="none" />
        <path d="M3 17c6-1 12 0 17 2s10 1 13-1" stroke="#0061A8" strokeWidth="2.5" fill="none" />
      </g>
      <text x="48" y="26" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="#333">Dutch-Bangla</text>
      <text x="48" y="42" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="#333">Bank</text>
    </svg>
  );
}

// Bank Asia — blue square emblem + wordmark
export function BankAsiaLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="14" width="22" height="22" rx="2" fill="#1B75BC" />
      <path d="M9 20h5v10H9zM16 20h5v10h-5z" fill="#fff" />
      <path d="M9 18h12v2H9z" fill="#fff" />
      <text x="32" y="30" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="800" fill="#1B75BC">Bank Asia</text>
      <text x="32" y="43" fontFamily="Arial, sans-serif" fontSize="8" fill="#666">FOR A BETTER TOMORROW</text>
    </svg>
  );
}

// Prime Bank — tricolor triangle + wordmark
export function PrimeBankLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M18 14l8 14H10z" fill="#E31E24" />
      <path d="M14 22l6 10H8z" fill="#00A651" />
      <path d="M22 22l6 10H16z" fill="#0067B1" />
      <text x="36" y="38" fontFamily="Georgia, serif" fontSize="18" fontWeight="700" fill="#333">Prime Bank</text>
    </svg>
  );
}

// AB Bank — red pinwheel mark + wordmark
export function AbBankLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(18 28)" fill="#ED1C24">
        <path d="M0 0l4-12 4 6zM0 0l12-4-6 4zM0 0l-4 12-4-6zM0 0l-12 4 6-4zM0 0l9-9 1 7zM0 0l9 9-7-1zM0 0l-9 9-1-7zM0 0l-9-9 7 1z" />
      </g>
      <text x="40" y="38" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" fill="#333">AB Bank</text>
    </svg>
  );
}

// Islami Bank Bangladesh — green circle emblem + wordmark
export function IslamiBankLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="28" r="14" fill="#0a7d3e" />
      <path d="M24 22a9 9 0 1 0 0 12 7 7 0 1 1 0-12z" fill="#fff" />
      <circle cx="22" cy="23" r="1.8" fill="#fff" />
      <text x="38" y="26" fontFamily="Georgia, serif" fontSize="14" fontWeight="700" fill="#0a7d3e">Islami Bank</text>
      <text x="38" y="40" fontFamily="Arial, sans-serif" fontSize="11" fill="#333">Bangladesh Limited</text>
    </svg>
  );
}

export const bankLogos: Record<string, React.FC<LogoProps>> = {
  SCB: StandardCharteredLogo,
  BRAC: BracBankLogo,
  CITY: CityBankLogo,
  DBBL: DbblLogo,
  BANKASIA: BankAsiaLogo,
  PRIME: PrimeBankLogo,
  AB: AbBankLogo,
  IBBL: IslamiBankLogo,
};
