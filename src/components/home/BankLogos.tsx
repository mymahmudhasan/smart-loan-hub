// Accurate Bangladeshi MFS brand logos recreated as inline SVG.
// Based on official brand identities: bKash, Nagad, Rocket, Upay.

type LogoProps = { className?: string };

// bKash — pink geometric origami bird
export function BkashLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 200 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Origami bird body - multiple triangular facets */}
      <polygon points="100,8 130,35 100,45" fill="#D91E6A" />
      <polygon points="100,8 100,45 70,35" fill="#E1306C" />
      <polygon points="70,35 100,45 75,55" fill="#C2185B" />
      <polygon points="100,45 130,35 125,55" fill="#AD1457" />
      <polygon points="75,55 100,45 100,70" fill="#880E4F" />
      <polygon points="100,45 125,55 100,70" fill="#D91E6A" />
      {/* Head / beak area */}
      <polygon points="70,35 55,30 75,25" fill="#F06292" />
      <polygon points="55,30 70,35 60,42" fill="#EC407A" />
      {/* Wing detail */}
      <polygon points="85,20 100,8 95,28" fill="#F48FB1" />
    </svg>
  );
}

// Nagad — orange flame swirl + Bengali wordmark
export function NagadLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 200 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Circular swirl emblem */}
      <circle cx="100" cy="38" r="26" fill="#FF6B00" />
      <circle cx="100" cy="38" r="20" fill="#FF8C00" />
      {/* Swirl arcs */}
      <path d="M82 38a18 18 0 0 1 36 0" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M88 38a12 12 0 0 1 24 0" stroke="#FF4500" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Center flame */}
      <path d="M100 24c-4 6-4 14 0 20 4-6 4-14 0-20z" fill="#FFF" />
      {/* Bengali text: নগদ */}
      <text x="100" y="78" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" fill="#FF6B00">নগদ</text>
      {/* Subtext */}
      <text x="100" y="92" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fill="#999">ডাক বিভাগের ডিজিটাল লেনদেন</text>
    </svg>
  );
}

// Rocket — purple rocket icon + Bengali wordmark
export function RocketLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 200 90" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Rocket body */}
      <path d="M100 12c-3 0-6 2-8 6-2 5-2 12 0 18 2 4 5 6 8 6s6-2 8-6c2-6 2-13 0-18-2-4-5-6-8-6z" fill="#7B1FA2" />
      {/* Rocket nose */}
      <path d="M100 12l-3 8h6z" fill="#9C27B0" />
      {/* Rocket fins */}
      <path d="M92 30l-8 8 8 2z" fill="#6A1B9A" />
      <path d="M108 30l8 8-8 2z" fill="#6A1B9A" />
      {/* Flame */}
      <path d="M96 40l4 10 4-10z" fill="#FF9800" />
      <path d="M97 40l3 6 3-6z" fill="#FF5722" />
      {/* Orbit ring */}
      <ellipse cx="100" cy="34" rx="22" ry="8" stroke="#AB47BC" strokeWidth="1.5" fill="none" />
      {/* Bengali text: রকেট */}
      <text x="100" y="72" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#7B1FA2">রকেট</text>
    </svg>
  );
}

// Upay — yellow & blue dots + Bengali wordmark
export function UpayLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 200 90" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Yellow upper dot */}
      <circle cx="88" cy="28" r="10" fill="#FFC107" />
      {/* Blue lower dot */}
      <circle cx="112" cy="44" r="10" fill="#1976D2" />
      {/* Small connector dot suggestion */}
      <circle cx="100" cy="50" r="3" fill="#FFC107" />
      {/* Bengali text: উপায় */}
      <text x="100" y="74" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" fill="#333">উপায়</text>
    </svg>
  );
}

export const bankLogos: Record<string, React.FC<LogoProps>> = {
  BKASH: BkashLogo,
  NAGAD: NagadLogo,
  ROCKET: RocketLogo,
  UPAY: UpayLogo,
};
