type ThreatTrendPoint = {
  label: string;
  value: number;
};

const IC3_REPORTED_LOSSES_BILLIONS: ThreatTrendPoint[] = [
  // Reported losses for complaints filed with IC3.gov.
  // Source: FBI IC3 2025 Internet Crime Report (chart "Losses by Year").
  { label: "2020", value: 4.2 },
  { label: "2021", value: 6.9 },
  { label: "2022", value: 10.3 },
  { label: "2023", value: 12.5 },
  { label: "2024", value: 16.6 },
  { label: "2025", value: 20.877 },
];

const IC3_REPORT_URL = "https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf";
const IC3_SOURCE_LABEL = "FBI IC3 2025 Internet Crime Report";
const IC3_SOURCE_LOGO = "/sources/fbi-seal-color.png";

function niceCeil(value: number) {
  const v = Math.max(0, value);
  if (v <= 10) return Math.ceil(v);
  if (v <= 25) return Math.ceil(v / 5) * 5;
  if (v <= 50) return Math.ceil(v / 10) * 10;
  if (v <= 100) return Math.ceil(v / 20) * 20;
  return Math.ceil(v / 50) * 50;
}

function buildTrendPaths(points: ThreatTrendPoint[]) {
  const width = 640;
  const height = 280;
  const paddingLeft = 64;
  const paddingRight = 28;
  const paddingY = 32;

  const safePoints = points.length >= 2 ? points : IC3_REPORTED_LOSSES_BILLIONS;
  const values = safePoints.map((p) => p.value);
  const maxData = Math.max(...values);
  const domainMin = 0;
  const domainMax = niceCeil(maxData * 1.02);
  const range = Math.max(1, domainMax - domainMin);

  const usableW = width - paddingLeft - paddingRight;
  const usableH = height - paddingY * 2;
  const baselineY = height - paddingY;
  const stepX = usableW / (safePoints.length - 1);
  const axisX = paddingLeft;

  const coords = safePoints.map((p, i) => {
    const x = paddingLeft + stepX * i;
    const t = (p.value - domainMin) / range;
    const y = paddingY + (1 - t) * usableH;
    return { x, y, label: p.label, value: p.value };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");

  const area = [
    `M ${coords[0]!.x.toFixed(2)} ${baselineY.toFixed(2)}`,
    `L ${coords[0]!.x.toFixed(2)} ${coords[0]!.y.toFixed(2)}`,
    ...coords.slice(1).map((c) => `L ${c.x.toFixed(2)} ${c.y.toFixed(2)}`),
    `L ${coords[coords.length - 1]!.x.toFixed(2)} ${baselineY.toFixed(2)}`,
    "Z",
  ].join(" ");

  const tickCount = 5;
  const stepValue = domainMax / tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const value = i * stepValue;
    const t = value / range;
    const y = paddingY + (1 - t) * usableH;
    return { value, y };
  });

  return {
    width,
    height,
    paddingLeft,
    paddingRight,
    paddingY,
    baselineY,
    axisX,
    coords,
    line,
    area,
    ticks,
    domainMax,
  };
}

export function ThreatTrendGraph({
  points = IC3_REPORTED_LOSSES_BILLIONS,
  label = "Reported cybercrime losses (USD, billions)",
}: {
  points?: ThreatTrendPoint[];
  label?: string;
}) {
  const { width, height, paddingRight, baselineY, axisX, coords, line, area, ticks, domainMax } =
    buildTrendPaths(points);

  const firstLabel = coords[0]?.label ?? "—";
  const midLabel = coords[Math.floor(coords.length / 2)]?.label ?? "—";
  const lastLabel = coords[coords.length - 1]?.label ?? "—";

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">{label}</p>
          <p className="mt-1 text-sm text-muted" style={{ fontWeight: 300 }}>
            IC3-reported losses by year.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">2020 - 2025</p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">~5x increase</p>
        </div>
      </div>

      <svg
        className="mt-4 block w-full"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label}, trending upward from ${firstLabel} to ${lastLabel}.`}
      >
        <defs>
          <linearGradient id="threatTrendStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--accent)" }} />
            <stop offset="100%" style={{ stopColor: "var(--accent-2)" }} />
          </linearGradient>
          <linearGradient id="threatTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.22 }} />
            <stop offset="100%" style={{ stopColor: "var(--accent-2)", stopOpacity: 0.02 }} />
          </linearGradient>
        </defs>

        {/* y-axis grid/ticks */}
        {ticks.slice(1).map(({ y, value }) => (
          <line
            key={value}
            x1={axisX}
            x2={width - paddingRight}
            y1={y}
            y2={y}
            stroke="var(--border)"
            strokeOpacity={0.65}
            strokeWidth={1}
          />
        ))}
        {/* axes */}
        <line x1={axisX} x2={axisX} y1={baselineY} y2={ticks[ticks.length - 1]!.y} stroke="var(--border)" strokeOpacity={0.9} />
        <line x1={axisX} x2={width - paddingRight} y1={baselineY} y2={baselineY} stroke="var(--border)" strokeOpacity={0.9} />

        {/* y tick labels */}
        {ticks.map(({ y, value }) => (
          <g key={`tick-${value}`}>
            <line x1={axisX - 5} x2={axisX} y1={y} y2={y} stroke="var(--border)" strokeOpacity={0.9} />
            <text
              x={axisX - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--muted-light)"
              fontFamily="var(--font-inter)"
            >
              {value === 0 ? "0" : value.toFixed(0)}
            </text>
          </g>
        ))}
        <text
          x={14}
          y={18}
          fontSize="11"
          fill="var(--muted-light)"
          fontFamily="var(--font-inter)"
        >
          USD (B)
        </text>
        <text
          x={width - paddingRight}
          y={18}
          textAnchor="end"
          fontSize="11"
          fill="var(--muted-light)"
          fontFamily="var(--font-inter)"
        >
          max {domainMax.toFixed(0)}
        </text>

        {/* fill + line */}
        <path d={area} fill="url(#threatTrendFill)" />
        <path
          d={line}
          fill="none"
          stroke="url(#threatTrendStroke)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* points */}
        {coords.map((c, i) => (
          <circle
            key={`${c.label}-${c.value}`}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 6 : 4.5}
            fill="var(--panel)"
            stroke="var(--foreground)"
            strokeOpacity={0.7}
            strokeWidth={1.5}
          />
        ))}
      </svg>

      <div className="mt-4 flex items-center justify-between text-[11px] text-muted-light font-sans">
        <span>{firstLabel}</span>
        <span>{midLabel}</span>
        <span>{lastLabel}</span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <a
          href={IC3_REPORT_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs text-muted-light transition-colors hover:text-foreground"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IC3_SOURCE_LOGO}
            alt="Federal Bureau of Investigation seal"
            className="h-7 w-7 object-contain opacity-85"
            loading="lazy"
          />
          <span>Source: {IC3_SOURCE_LABEL}</span>
        </a>
        <span className="text-xs text-muted-light">Data: IC3 annual reporting</span>
      </div>
    </div>
  );
}
