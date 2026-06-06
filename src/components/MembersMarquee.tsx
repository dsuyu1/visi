import type { CSSProperties } from "react";
import type { Member } from "@/lib/content";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0] ?? "")
    .join("")
    .toUpperCase();
}

function rotate<T>(arr: T[], by: number) {
  if (arr.length === 0) return arr;
  const n = ((by % arr.length) + arr.length) % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

function repeatToMin<T>(arr: T[], min: number) {
  if (arr.length === 0) return arr;
  if (arr.length >= min) return arr;
  const out: T[] = [];
  while (out.length < min) out.push(arr[out.length % arr.length]!);
  return out;
}

function splitIntoRows(members: Member[], rowCount: number) {
  const rows: Member[][] = Array.from({ length: rowCount }, () => []);
  members.forEach((m, i) => rows[i % rowCount]!.push(m));
  return rows;
}

function MemberChip({ member }: { member: Member }) {
  return (
    <div className="member-chip flex items-center gap-3 border border-border bg-panel px-4 py-3">
      <div className="grid size-10 shrink-0 place-items-center border border-border bg-surface-strong text-[11px] font-semibold tracking-widest text-surface-strong-foreground font-sans">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        ) : (
          initials(member.name)
        )}
      </div>

      <div className="min-w-0 whitespace-nowrap">
        <p className="truncate text-sm font-semibold tracking-tight font-sans">
          {member.name}
        </p>
        <p className="truncate text-xs text-muted-light font-sans">{member.role}</p>
      </div>
    </div>
  );
}

export function MembersMarquee({ members }: { members: Member[] }) {
  const baseRows = splitIntoRows(members, 3);

  const rows = baseRows.map((row, rowIndex) => {
    const fallback = row.length ? row : members;
    const rotated = rotate(fallback, rowIndex * 2);
    return repeatToMin(rotated, 10);
  });

  const durations = ["48s", "64s", "52s"] as const;
  const directions = ["left", "right", "left"] as const;

  return (
    <div className="space-y-6">
      {rows.map((row, rowIndex) => {
        const duration = durations[rowIndex] ?? "56s";
        const direction = directions[rowIndex] ?? "left";
        const trackStyle: CSSProperties = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ["--marquee-duration" as any]: duration,
        };

        return (
          <div key={rowIndex} className="members-marquee-row">
            <div
              className="members-marquee-track"
              data-direction={direction}
              style={trackStyle}
            >
              <div className="members-marquee-group" role="list">
                {row.map((m, i) => (
                  <div key={`${m.name}-${i}`} role="listitem">
                    <MemberChip member={m} />
                  </div>
                ))}
              </div>

              <div className="members-marquee-group" aria-hidden="true">
                {row.map((m, i) => (
                  <div key={`${m.name}-${i}-dup`}>
                    <MemberChip member={m} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
