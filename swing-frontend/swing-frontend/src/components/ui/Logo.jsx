export default function Logo({ dark = false, className = "" }) {
  const stroke = dark ? "#F2A93B" : "#1B2140";
  const text = dark ? "text-paper-50" : "text-navy-900";
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path
          d="M4 22 C 9 8, 21 8, 26 22"
          stroke={stroke}
          strokeWidth="2.75"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="26" cy="22" r="3" fill="#1E9E8B" />
        <circle cx="4" cy="22" r="2.5" fill={stroke} />
      </svg>
      <span className={`font-display text-lg font-bold tracking-tight ${text}`}>swing</span>
    </div>
  );
}
