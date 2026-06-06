export function SaplingMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className={`sapling-sway ${className}`}
      style={{ color: "rgb(var(--accent-rgb))" }}
    >
      <g className="sapling-leaves">
        <path
          d="M31 29c-6-8-14-8-18-7 1 7 7 16 16 14 2-.4 3.5-2 2-7Z"
          fill="currentColor"
          opacity="0.12"
        />
        <path
          d="M33 29c6-8 14-8 18-7-1 7-7 16-16 14-2-.4-3.5-2-2-7Z"
          fill="currentColor"
          opacity="0.12"
        />
        <path
          d="M31 29c-6-8-14-8-18-7 1 7 7 16 16 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <path
          d="M33 29c6-8 14-8 18-7-1 7-7 16-16 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </g>

      {/* stem */}
      <path
        d="M32 55V30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* ground line */}
      <path
        d="M22 55h20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

