export default function LogoMark({ size = 36, darkBorder = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="VisCode logo">
      <rect width="40" height="40" rx="9" fill="#1c1c2e"
        stroke={darkBorder ? "white" : "none"} strokeWidth="2" />
      <line x1="20"    y1="7"    x2="20"    y2="33"   stroke="white" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="31.26" y1="13.5" x2="8.74"  y2="26.5" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="8.74"  y1="13.5" x2="31.26" y2="26.5" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
