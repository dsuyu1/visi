"use client";

import { useEffect, useRef } from "react";

// --- 3-D math -----------------------------------------------------------------

type V3 = [number, number, number];

const rotX = ([x, y, z]: V3, a: number): V3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
};
const rotY = ([x, y, z]: V3, a: number): V3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
};
const project = (
  [x, y, z]: V3,
  fov: number, cx: number, cy: number, scale: number,
): [number, number, number] => {
  const d = fov / (fov + z);
  return [cx + x * d * scale, cy - y * d * scale, z];
};

// --- padlock geometry ---------------------------------------------------------

function buildLock(): { verts: V3[]; edges: [number, number][]; bodyVertCount: number } {
  const verts: V3[] = [];
  const edges: [number, number][] = [];
  let bodyVertCount = 0;

  function add(vs: V3[], es: [number, number][]) {
    const off = verts.length;
    verts.push(...vs);
    edges.push(...es.map(([a, b]) => [a + off, b + off] as [number, number]));
  }

  // ?? body ------------------------------------------------------------------
  const LOCK_SCALE = 1.2;
  const BODY_SCALE = 1.3;

  const BW_LOCK = 0.30 * LOCK_SCALE;
  const BH_LOCK = 0.60 * LOCK_SCALE;
  const BD_LOCK = 0.13 * LOCK_SCALE;

  const BW = BW_LOCK * BODY_SCALE;
  const BH = BH_LOCK * BODY_SCALE;
  const BD = BD_LOCK * BODY_SCALE;

  // Rounded box silhouette: add segments near corners to simulate filleted edges.
  const R = Math.min(BW, BH / 2) * 0.30;
  const CORNER_STEPS = 7;

  const outline: Array<[number, number]> = [];
  const push = (x: number, y: number) => { outline.push([x, y]); };
  const arc = (cx: number, cy: number, a0: number, a1: number, skipFirst: boolean) => {
    const start = skipFirst ? 1 : 0;
    for (let i = start; i <= CORNER_STEPS; i++) {
      const t = i / CORNER_STEPS;
      const a = a0 + (a1 - a0) * t;
      push(cx + R * Math.cos(a), cy + R * Math.sin(a));
    }
  };

  const x0 = -BW, x1 = BW;
  const y0 = -BH, y1 = 0;

  // Top edge → clockwise around.
  push(x0 + R, y1);
  push(x1 - R, y1);
  arc(x1 - R, y1 - R, Math.PI / 2, 0, true);          // top-right
  push(x1, y0 + R);
  arc(x1 - R, y0 + R, 0, -Math.PI / 2, true);         // bottom-right
  push(x0 + R, y0);
  arc(x0 + R, y0 + R, -Math.PI / 2, -Math.PI, true);  // bottom-left
  push(x0, y1 - R);
  arc(x0 + R, y1 - R, Math.PI, Math.PI / 2, true);    // top-left

  // Remove duplicate closure point if present (prevents a zero-length segment).
  if (outline.length > 1) {
    const [sx, sy] = outline[0]!;
    const [lx, ly] = outline[outline.length - 1]!;
    if (Math.abs(sx - lx) < 1e-6 && Math.abs(sy - ly) < 1e-6) outline.pop();
  }

  const N = outline.length;
  const bodyVerts: V3[] = [];
  for (const [x, y] of outline) bodyVerts.push([x, y, -BD]);
  for (const [x, y] of outline) bodyVerts.push([x, y,  BD]);

  const bodyEdges: [number, number][] = [];
  for (let i = 0; i < N; i++) bodyEdges.push([i, (i + 1) % N]);
  for (let i = 0; i < N; i++) bodyEdges.push([i + N, ((i + 1) % N) + N]);
  for (let i = 0; i < N; i++) bodyEdges.push([i, i + N]);

  add(bodyVerts, bodyEdges);
  bodyVertCount = verts.length;

  // ?? horizontal crease at y = −0.28 ----------------------------------------

  // ?? keyhole (front face) -------------------------------------------------
  {
    const KEY_Z = -BD;
    const kx = 0;
    const ky = y0 + (y1 - y0) * 0.55;

    const r = BW * 0.18;
    const theta = 0.55; // controls where the circle blends into the slot
    const joinX = r * Math.sin(theta);
    const joinY = ky - r * Math.cos(theta);
    const slotH = r * 1.45;
    const slotBotY = joinY - slotH;

    const kv: V3[] = [];
    const ke: [number, number][] = [];

    // Circle arc (major arc only) so the slot blends in without a harsh top edge.
    const ARC_STEPS = 22;
    const a0 = -Math.PI / 2 + theta;        // right join
    const a1 = -Math.PI / 2 - theta + 2 * Math.PI; // left join via the long way around (top)
    for (let i = 0; i <= ARC_STEPS; i++) {
      const t = i / ARC_STEPS;
      const a = a0 + (a1 - a0) * t;
      kv.push([kx + r * Math.cos(a), ky + r * Math.sin(a), KEY_Z]);
    }
    for (let i = 0; i < ARC_STEPS; i++) ke.push([i, i + 1]);

    // Slot: left join → down → across → up → right join (index 0)
    const leftJoinIdx = kv.length - 1;
    const botLeftIdx = kv.length;
    kv.push([kx - joinX, slotBotY, KEY_Z]);
    const botRightIdx = kv.length;
    kv.push([kx + joinX, slotBotY, KEY_Z]);

    ke.push([leftJoinIdx, botLeftIdx]);
    ke.push([botLeftIdx, botRightIdx]);
    ke.push([botRightIdx, 0]);

    add(kv, ke);
  }

  // ?? shackle entry collars -------------------------------------------------
  const COLLAR_R = 0.11 * LOCK_SCALE;
  const SHACKLE_INSET = 0.03 * LOCK_SCALE;
  const R_SHACKLE = Math.max(0, BW_LOCK - COLLAR_R - SHACKLE_INSET);
  for (const lcx of [-R_SHACKLE, R_SHACKLE]) {
    const cv: V3[] = [], ce: [number, number][] = [];
    const CR = COLLAR_R, NC = 12;
    for (let i = 0; i < NC; i++) {
      const a = (i / NC) * Math.PI * 2;
      cv.push([lcx + CR * Math.cos(a), 0, CR * Math.sin(a)]);
    }
    for (let i = 0; i < NC; i++) ce.push([i, (i + 1) % NC]);
    add(cv, ce);
  }

  // ?? shackle tube ----------------------------------------------------------
  const TUBE_R = 0.092 * LOCK_SCALE, N_RAD = 8, N_TUB = 48;
  const LEG_BOT = 0;
  const LEG_TOP = 0.47 * LOCK_SCALE;

  const LEG_STEPS = Math.round(N_TUB * 0.27);
  const T_LEG = LEG_STEPS / N_TUB;
  const T_ARC = 1 - 2 * T_LEG;

  function uCenter(t: number): [number, number] {
    if (t <= T_LEG) {
      const s = t / T_LEG;
      return [-R_SHACKLE, LEG_BOT + s * (LEG_TOP - LEG_BOT)];
    } else if (t <= 1 - T_LEG) {
      const s = (t - T_LEG) / T_ARC;
      const ang = Math.PI * (1 - s);
      return [R_SHACKLE * Math.cos(ang), LEG_TOP + R_SHACKLE * Math.sin(ang)];
    } else {
      const s = (t - (1 - T_LEG)) / T_LEG;
      return [R_SHACKLE, LEG_TOP - s * (LEG_TOP - LEG_BOT)];
    }
  }

  function uTangent(t: number): [number, number] {
    const dt = 0.0006;
    const [x1, y1] = uCenter(Math.max(0, t - dt));
    const [x2, y2] = uCenter(Math.min(1, t + dt));
    const l = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return l > 1e-9 ? [(x2 - x1) / l, (y2 - y1) / l] : [0, 1];
  }

  const tubeOff = verts.length;
  for (let i = 0; i <= N_TUB; i++) {
    const t = i / N_TUB;
    const [cx, cy] = uCenter(t);
    const [tx, ty] = uTangent(t);
    for (let j = 0; j < N_RAD; j++) {
      const phi = (j / N_RAD) * Math.PI * 2;
      const sp = Math.sin(phi), cp = Math.cos(phi);
      verts.push([cx + TUBE_R * sp * ty, cy - TUBE_R * sp * tx, TUBE_R * cp]);
    }
  }
  for (let i = 0; i < N_TUB; i++) {
    for (let j = 0; j < N_RAD; j++) {
      edges.push([tubeOff + i * N_RAD + j, tubeOff + (i + 1) * N_RAD + j]);
    }
  }
  for (let i = 0; i <= N_TUB; i += 6) {
    for (let j = 0; j < N_RAD; j++) {
      edges.push([tubeOff + i * N_RAD + j, tubeOff + i * N_RAD + (j + 1) % N_RAD]);
    }
  }

  return { verts, edges, bodyVertCount };
}

const { verts: VERTS, edges: EDGES, bodyVertCount: BODY_VERT_COUNT } = buildLock();
const BODY_HALF = BODY_VERT_COUNT / 2;

// --- component ----------------------------------------------------------------

export function HeroBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, raf = 0;
    let rx = 0.3, ry = 0.5;
    let vx = 0, vy = reduced ? 0 : 0.006;
    const AUTO_VY = reduced ? 0 : 0.006;

    let dragging = false;
    let lastPx = 0, lastPy = 0;
    let lastDx = 0, lastDy = 0;

    function resize() {
      const dpr  = Math.min(window.devicePixelRatio, 2);
      const rect = canvas!.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      canvas!.width = Math.max(1, Math.round(rect.width * dpr));
      canvas!.height = Math.max(1, Math.round(rect.height * dpr));

      // Match CSS pixels to backing-store pixels without accumulating transforms.
      // Keep scaling isotropic so the cube never "stretches" on one axis.
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      W = rect.width;
      H = rect.height;
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      const scale = Math.min(W, H) * 0.30;
      const fov   = 5;
      const cx    = W * 0.72;
      const cy    = H * 0.46; // updated

      const rVerts = VERTS.map(v => rotY(rotX(v, rx), ry));
      const pts = rVerts.map(v => project(v, fov, cx, cy, scale));

      ctx!.lineWidth = 1.5;
      ctx!.lineCap = "butt";
      ctx!.lineJoin = "round";

      const N = BODY_HALF;

      // Identify which body face is farther from the camera this frame.
      // We keep the entire lock as a see-through wireframe, but fade the far face loop
      // so it doesn't read like a harsh "midline" through the body.
      let zFace0 = 0;
      let zFace1 = 0;
      for (let i = 0; i < N; i++) {
        zFace0 += pts[i]![2];
        zFace1 += pts[i + N]![2];
      }
      zFace0 /= N;
      zFace1 /= N;
      const farStart = zFace0 > zFace1 ? 0 : N;
      const farEnd = farStart + N;

      const edges = EDGES.map(([a, b]) => {
        const za = pts[a]![2];
        const zb = pts[b]![2];
        return { a, b, z: (za + zb) / 2 };
      });

      // Normalized depth so "far" edges render darker.
      let zMin = Infinity;
      let zMax = -Infinity;
      for (const e of edges) {
        zMin = Math.min(zMin, e.z);
        zMax = Math.max(zMax, e.z);
      }
      const zRange = Math.max(1e-6, zMax - zMin);

      // Draw far edges first so near edges sit on top.
      edges.sort((e1, e2) => e2.z - e1.z);

      const MIN_ALPHA = 0.10;
      const MAX_ALPHA = 0.66;

      for (const { a, b, z } of edges) {
        const t = (z - zMin) / zRange; // 0 = near, 1 = far
        let alpha = MIN_ALPHA + (MAX_ALPHA - MIN_ALPHA) * t;

        // Slightly round the body edges so the "cube" reads less sharp.
        const isBodyEdge = a < BODY_VERT_COUNT && b < BODY_VERT_COUNT;
        ctx!.lineCap = isBodyEdge ? "round" : "butt";

        // Fade the far body face loop (the one that tends to project as an interior line).
        if (isBodyEdge) {
          const aInFar = a >= farStart && a < farEnd;
          const bInFar = b >= farStart && b < farEnd;
          if (aInFar && bInFar) {
            const deltaNorm = Math.min(1, Math.abs(zFace0 - zFace1) / zRange);
            const fade = 0.14 + 0.20 * (1 - deltaNorm);
            alpha *= fade;
          }
        }

        ctx!.strokeStyle = `rgba(10,10,10,${alpha.toFixed(3)})`;

        const [ax2, ay2] = pts[a]!;
        const [bx2, by2] = pts[b]!;
        ctx!.beginPath();
        ctx!.moveTo(ax2, ay2);
        ctx!.lineTo(bx2, by2);
        ctx!.stroke();
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastPx = e.clientX; lastPy = e.clientY;
      lastDx = 0; lastDy = 0;
      vx = 0; vy = 0;
      canvas!.setPointerCapture(e.pointerId);
      canvas!.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      lastDx = e.clientX - lastPx;
      lastDy = e.clientY - lastPy;
      ry += lastDx * 0.012;
      rx += lastDy * 0.008;
      rx = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rx));
      lastPx = e.clientX; lastPy = e.clientY;
    };

    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      vy = lastDx * 0.012;
      vx = lastDy * 0.008;
      canvas!.style.cursor = "grab";
    };

    canvas.addEventListener("pointerdown",   onPointerDown);
    canvas.addEventListener("pointermove",   onPointerMove);
    canvas.addEventListener("pointerup",     onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    const ro = new ResizeObserver(() => { resize(); if (reduced) draw(); });
    ro.observe(canvas!);
    resize();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!dragging) {
        ry += vy;
        rx += vx;
        rx = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rx));
        vy += (AUTO_VY - vy) * 0.025;
        vx += (0 - vx) * 0.025;
      }
      draw();
    };

    // Fade the canvas in after the first frame paints
    let fadeTimer: ReturnType<typeof setTimeout>;
    if (reduced) {
      draw();
      fadeTimer = setTimeout(() => { canvas.style.opacity = "1"; }, 50);
    } else {
      raf = requestAnimationFrame(loop);
      fadeTimer = setTimeout(() => { canvas.style.opacity = "1"; }, 120);
    }

    return () => {
      clearTimeout(fadeTimer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown",   onPointerDown);
      canvas.removeEventListener("pointermove",   onPointerMove);
      canvas.removeEventListener("pointerup",     onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 h-full w-full cursor-grab ${className}`}
      style={{ touchAction: "none", opacity: 0, transition: "opacity 1s ease-out" }}
    />
  );
}
