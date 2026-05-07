export default function Logo({ size = 26 }: { size?: number }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-serif)",
      fontWeight: 600,
      color: "var(--ink-1)",
      fontSize: 18,
      letterSpacing: "-0.01em",
      textDecoration: "none",
    }}>
      <svg width={size} height={size} viewBox="0 0 26 26" style={{ flexShrink: 0 }}>
        <defs>
          <radialGradient id="ms-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="var(--glow-soft)" stopOpacity="1" />
            <stop offset="60%" stopColor="var(--glow)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--glow-deep)" stopOpacity="1" />
          </radialGradient>
        </defs>
        <circle cx="13" cy="13" r="11.5" fill="none" stroke="var(--ink-2)" strokeWidth="0.8" />
        <path
          d="M 13 1.5 L 13 6 M 24.5 13 L 20 13 M 13 24.5 L 13 20 M 1.5 13 L 6 13 M 21 5 L 18 8 M 21 21 L 18 18 M 5 21 L 8 18 M 5 5 L 8 8"
          stroke="var(--ink-3)" strokeWidth="0.7" strokeLinecap="round"
        />
        <circle cx="13" cy="1.5" r="1.2" fill="var(--sepia)" />
        <circle cx="24.5" cy="13" r="1.2" fill="var(--sepia)" />
        <circle cx="13" cy="24.5" r="1.2" fill="var(--sepia)" />
        <circle cx="1.5" cy="13" r="1.2" fill="var(--sepia)" />
        <circle cx="13" cy="13" r="5" fill="url(#ms-glow)" />
        <circle cx="13" cy="13" r="2" fill="var(--paper-0)" opacity="0.6" />
      </svg>
      <span>Memory Store</span>
    </span>
  );
}
