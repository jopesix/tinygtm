// Decorative SVG illustrations from the design handoff. Each tool card's art
// is a small abstract scene with a coral accent that hints at the tool.

export function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M2 4l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroArt() {
  return (
    <svg viewBox="0 0 440 440" xmlns="http://www.w3.org/2000/svg">
      <circle cx="240" cy="220" r="180" fill="#fde6dc" />
      <circle cx="290" cy="180" r="120" fill="#f26b3a" />
      <circle cx="160" cy="260" r="92" fill="none" stroke="#1f2d45" strokeWidth="3" />
      <circle cx="100" cy="120" r="22" fill="#1f2d45" />
      <rect x="60" y="340" width="220" height="48" rx="24" fill="#fbd2bc" />
      <g stroke="#1f2d45" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0 8">
        <line x1="80" y1="200" x2="200" y2="200" />
      </g>
      <circle cx="380" cy="340" r="14" fill="#f26b3a" />
      <rect x="340" y="60" width="44" height="44" rx="8" fill="#1f2d45" transform="rotate(12 362 82)" />
      <circle cx="290" cy="180" r="58" fill="#FFFFFF" />
      <circle cx="290" cy="180" r="28" fill="#f26b3a" />
      <circle cx="220" cy="380" r="6" fill="#00E5A0" />
    </svg>
  );
}

export function UtmArt() {
  return (
    <svg viewBox="0 0 440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <circle cx="380" cy="40" r="120" fill="#fde6dc" />
      <rect x="32" y="56" width="360" height="40" rx="10" fill="#FFFFFF" stroke="#EEEEEC" />
      <circle cx="48" cy="76" r="4" fill="#f26b3a" />
      <rect x="60" y="68" width="80" height="6" rx="3" fill="#1f2d45" />
      <rect x="60" y="80" width="56" height="5" rx="2.5" fill="#D4D4D1" />
      <g>
        <rect x="160" y="68" width="62" height="18" rx="9" fill="#fbd2bc" />
        <text
          x="191"
          y="80"
          fontFamily="JetBrains Mono"
          fontSize="9"
          fontWeight="600"
          fill="#9c3d12"
          textAnchor="middle"
        >
          utm_source
        </text>
      </g>
      <g>
        <rect x="230" y="68" width="66" height="18" rx="9" fill="#fbd2bc" />
        <text
          x="263"
          y="80"
          fontFamily="JetBrains Mono"
          fontSize="9"
          fontWeight="600"
          fill="#9c3d12"
          textAnchor="middle"
        >
          utm_medium
        </text>
      </g>
      <g>
        <rect x="304" y="68" width="72" height="18" rx="9" fill="#f26b3a" />
        <text
          x="340"
          y="80"
          fontFamily="JetBrains Mono"
          fontSize="9"
          fontWeight="600"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          utm_campaign
        </text>
      </g>
      <rect x="32" y="116" width="288" height="34" rx="8" fill="#FFFFFF" stroke="#EEEEEC" />
      <rect x="44" y="125" width="120" height="6" rx="3" fill="#1f2d45" />
      <rect x="44" y="137" width="200" height="5" rx="2.5" fill="#D4D4D1" />
      <rect x="328" y="116" width="64" height="34" rx="8" fill="#1f2d45" />
      <text
        x="360"
        y="138"
        fontFamily="Inter"
        fontSize="11"
        fontWeight="600"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        Copy
      </text>
      <circle cx="32" cy="36" r="6" fill="#f26b3a" />
    </svg>
  );
}

export function CampaignArt() {
  return (
    <svg viewBox="0 0 440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect x="-40" y="60" width="240" height="160" rx="20" fill="#fde6dc" />
      <rect x="80" y="22" width="200" height="158" rx="10" fill="#FFFFFF" stroke="#EEEEEC" />
      <rect x="96" y="40" width="80" height="9" rx="3" fill="#1f2d45" />
      <rect x="96" y="56" width="150" height="5" rx="2.5" fill="#D4D4D1" />
      <rect x="96" y="66" width="120" height="5" rx="2.5" fill="#D4D4D1" />
      <g>
        <rect x="96" y="86" width="14" height="14" rx="4" fill="#f26b3a" />
        <path d="M99.5 93.2 l3 3 l6 -6" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="118" y="90" width="130" height="6" rx="3" fill="#1f2d45" />
      </g>
      <g>
        <rect x="96" y="108" width="14" height="14" rx="4" fill="#f26b3a" />
        <path d="M99.5 115.2 l3 3 l6 -6" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="118" y="112" width="110" height="6" rx="3" fill="#1f2d45" />
      </g>
      <g>
        <rect x="96" y="130" width="14" height="14" rx="4" fill="#FFFFFF" stroke="#D4D4D1" />
        <rect x="118" y="134" width="140" height="6" rx="3" fill="#5C6B7E" />
      </g>
      <g>
        <rect x="96" y="152" width="14" height="14" rx="4" fill="#FFFFFF" stroke="#D4D4D1" />
        <rect x="118" y="156" width="90" height="6" rx="3" fill="#5C6B7E" />
      </g>
      <circle cx="360" cy="56" r="46" fill="#f26b3a" />
      <circle cx="360" cy="56" r="22" fill="#FFFFFF" />
      <rect x="300" y="130" width="100" height="22" rx="11" fill="#fbd2bc" />
      <text
        x="350"
        y="145"
        fontFamily="Inter"
        fontSize="10"
        fontWeight="600"
        fill="#9c3d12"
        textAnchor="middle"
      >
        Brief · v2
      </text>
      <circle cx="56" cy="36" r="6" fill="#1f2d45" />
    </svg>
  );
}

export function FaqArt() {
  return (
    <svg viewBox="0 0 440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <circle cx="60" cy="160" r="120" fill="#fde6dc" />
      <g>
        <rect x="40" y="34" width="220" height="58" rx="14" fill="#FFFFFF" stroke="#EEEEEC" />
        <path d="M68 92 l0 14 l14 -14" fill="#FFFFFF" stroke="#EEEEEC" />
        <circle cx="62" cy="52" r="10" fill="#1f2d45" />
        <text
          x="62"
          y="56"
          fontFamily="DM Sans"
          fontSize="12"
          fontWeight="700"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          Q
        </text>
        <rect x="84" y="46" width="140" height="7" rx="3.5" fill="#1f2d45" />
        <rect x="84" y="60" width="160" height="5" rx="2.5" fill="#D4D4D1" />
        <rect x="84" y="71" width="100" height="5" rx="2.5" fill="#D4D4D1" />
      </g>
      <g>
        <rect x="160" y="100" width="240" height="62" rx="14" fill="#f26b3a" />
        <path d="M380 162 l0 14 l-14 -14" fill="#f26b3a" />
        <circle cx="184" cy="120" r="10" fill="#FFFFFF" />
        <text
          x="184"
          y="124"
          fontFamily="DM Sans"
          fontSize="12"
          fontWeight="700"
          fill="#f26b3a"
          textAnchor="middle"
        >
          A
        </text>
        <rect x="206" y="114" width="150" height="7" rx="3.5" fill="#FFFFFF" />
        <rect x="206" y="128" width="180" height="5" rx="2.5" fill="rgba(255,255,255,0.7)" />
        <rect x="206" y="139" width="120" height="5" rx="2.5" fill="rgba(255,255,255,0.7)" />
      </g>
      <rect x="270" y="34" width="120" height="22" rx="11" fill="#fbd2bc" />
      <circle cx="282" cy="45" r="5" fill="#f26b3a" />
      <text x="292" y="49" fontFamily="Inter" fontSize="10" fontWeight="600" fill="#9c3d12">
        SMB buyer
      </text>
      <circle cx="408" cy="42" r="5" fill="#1f2d45" />
    </svg>
  );
}

export function ExperimentArt() {
  return (
    <svg viewBox="0 0 440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect x="240" y="-20" width="240" height="240" rx="20" fill="#fde6dc" />
      <rect x="36" y="26" width="220" height="132" rx="10" fill="#FFFFFF" stroke="#EEEEEC" />
      <rect x="36" y="26" width="220" height="6" rx="3" fill="#f26b3a" />
      <rect x="48" y="44" width="60" height="14" rx="7" fill="#fbd2bc" />
      <text
        x="78"
        y="54"
        fontFamily="JetBrains Mono"
        fontSize="9"
        fontWeight="600"
        fill="#9c3d12"
        textAnchor="middle"
      >
        EXP · 014
      </text>
      <rect x="48" y="68" width="170" height="7" rx="3.5" fill="#1f2d45" />
      <rect x="48" y="82" width="140" height="5" rx="2.5" fill="#D4D4D1" />
      <g>
        <circle cx="52" cy="112" r="5" fill="#f26b3a" />
        <circle cx="66" cy="112" r="5" fill="#f26b3a" />
        <circle cx="80" cy="112" r="5" fill="#f26b3a" />
        <circle cx="94" cy="112" r="5" fill="#fbd2bc" />
        <circle cx="108" cy="112" r="5" fill="#fbd2bc" />
        <text x="130" y="116" fontFamily="JetBrains Mono" fontSize="10" fontWeight="500" fill="#5C6B7E">
          priority 3/5
        </text>
      </g>
      <rect x="48" y="130" width="68" height="18" rx="9" fill="#1f2d45" />
      <text
        x="82"
        y="143"
        fontFamily="Inter"
        fontSize="10"
        fontWeight="600"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        Run
      </text>
      <rect x="122" y="130" width="68" height="18" rx="9" fill="#FFFFFF" stroke="#EEEEEC" />
      <text
        x="156"
        y="143"
        fontFamily="Inter"
        fontSize="10"
        fontWeight="600"
        fill="#1f2d45"
        textAnchor="middle"
      >
        Skip
      </text>
      <rect x="276" y="40" width="136" height="100" rx="10" fill="#FFFFFF" stroke="#EEEEEC" />
      <text x="288" y="58" fontFamily="Inter" fontSize="10" fontWeight="600" fill="#5C6B7E">
        Lift
      </text>
      <text x="288" y="80" fontFamily="DM Sans" fontSize="22" fontWeight="700" fill="#1f2d45">
        +18%
      </text>
      <rect x="288" y="92" width="14" height="34" rx="3" fill="#fbd2bc" />
      <rect x="308" y="100" width="14" height="26" rx="3" fill="#fbd2bc" />
      <rect x="328" y="86" width="14" height="40" rx="3" fill="#f26b3a" />
      <rect x="348" y="96" width="14" height="30" rx="3" fill="#fbd2bc" />
      <rect x="368" y="78" width="14" height="48" rx="3" fill="#f26b3a" />
      <rect x="388" y="104" width="14" height="22" rx="3" fill="#fbd2bc" />
      <circle cx="408" cy="160" r="6" fill="#1f2d45" />
    </svg>
  );
}
