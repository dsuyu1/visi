"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import type { Member } from "@/lib/content";

// --- helpers ------------------------------------------------------------------

function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0] ?? "")
    .join("")
    .toUpperCase();
}

/** A set of dark gradient pairs keyed by index mod length */
const AVATAR_GRADIENTS = [
  ["#0d1117", "#1a2744"],
  ["#0f1a0f", "#1a3a2a"],
  ["#1a0a2e", "#2d1657"],
  ["#0f172a", "#1e3a5f"],
  ["#2d1657", "#0f1a0f"],
] as const;

function createAvatarTexture(member: Member) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const h = hashString(member.name);
  const hueA = h % 360;
  const hueB = (hueA + 55 + (h % 45)) % 360;

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, `hsl(${hueA} 80% 55%)`);
  grad.addColorStop(1, `hsl(${hueB} 85% 55%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, size - 16, size - 16);

  ctx.font = "700 92px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(initials(member.name), size / 2, size / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 2;
  tex.needsUpdate = true;
  return tex;
}

// --- CSS fallback (shown when WebGL is unavailable) ---------------------------

function FallbackGrid({ members }: { members: Member[] }) {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-6 p-8">
      {members.map((m, i) => {
        const [from, to] = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]!;
        return (
          <div key={m.name} className="flex flex-col items-center gap-3 text-center">
            {/* Avatar circle */}
            <div
              className="grid size-16 shrink-0 place-items-center font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
                fontSize: "1.1rem",
                letterSpacing: "0.04em",
              }}
            >
              {initials(m.name)}
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{m.name}</p>
              <p className="text-xs text-muted-light">{m.role}</p>
              {m.focus && (
                <p className="mt-0.5 text-[11px] text-muted-light opacity-75">{m.focus}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- WebGL availability check ------------------------------------------------
//
// Three.js does NOT throw when WebGL context creation fails — it only calls
// console.error internally and returns a mostly-broken renderer object.
// We must probe WebGL support on a throwaway canvas BEFORE touching Three.js.

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// --- Main component -----------------------------------------------------------

export function MembersCarousel3D({ members }: { members: Member[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const membersMemo = useMemo(() => members, [members]);

  // WebGL is detected once on first client render.
  const [webGLOk, setWebGLOk] = useState<boolean>(() => isWebGLAvailable());

  useEffect(() => {
    if (!webGLOk) return;
    const el = mountRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ?? Pre-flight WebGL check ----------------------------------------------
    // Three.js does NOT throw on failure — it only console.errors.
    // We must test WebGL availability ourselves before creating the renderer.
    // ?? Create renderer (WebGL confirmed available) -------------------------
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => setWebGLOk(false));
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0.4, 7.4);

    const root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0x60a5fa, 0.65);
    key.position.set(4, 4, 6);
    scene.add(key);

    const ring = new THREE.Group();
    root.add(ring);

    const textures: THREE.Texture[] = [];
    const disposables: THREE.Object3D[] = [];

    const cardW   = 1.35;
    const cardH   = 1.75;
    const radius  = 2.55;
    const count   = Math.max(1, membersMemo.length);
    const step    = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const member = membersMemo[i]!;
      const theta  = i * step;

      const texture = member.avatarUrl
        ? new THREE.TextureLoader().load(member.avatarUrl)
        : createAvatarTexture(member);
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.push(texture);

      const frame = new THREE.Mesh(
        new THREE.PlaneGeometry(cardW * 1.06, cardH * 1.06),
        new THREE.MeshBasicMaterial({ color: 0x0b0d14, transparent: true, opacity: 0.65, depthWrite: false }),
      );
      frame.position.set(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
      frame.lookAt(0, 0, 0);
      ring.add(frame);
      disposables.push(frame);

      const card = new THREE.Mesh(
        new THREE.PlaneGeometry(cardW, cardH),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.98, depthWrite: false }),
      );
      card.position.copy(frame.position);
      card.position.add(card.getWorldDirection(new THREE.Vector3()).multiplyScalar(0.01));
      card.lookAt(0, 0, 0);
      ring.add(card);
      disposables.push(card);
    }

    const baseTilt = -0.14;
    root.rotation.x = baseTilt;

    let isPointerDown = false;
    let lastX = 0;
    let velocity = 0;

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      lastX = e.clientX;
      (e.target as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      ring.rotation.y += dx * 0.006;
      velocity = dx * 0.0009;
    };
    const onPointerUp = () => { isPointerDown = false; };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const ro = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (!isPointerDown && !prefersReducedMotion) ring.rotation.y += 0.0012;
      if (!isPointerDown) { ring.rotation.y += velocity; velocity *= 0.93; }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      for (const t of textures) t.dispose();
      for (const obj of disposables) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh.material ?? null) as THREE.Material | THREE.Material[] | null;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      }
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [membersMemo, webGLOk]);

  // ?? Render -----------------------------------------------------------------

  // WebGL unavailable → show static CSS fallback
  if (!webGLOk) {
    return <FallbackGrid members={members} />;
  }

  // WebGL ok (or not yet determined) → show the canvas mount point
    return (
      <div className="relative h-full w-full">
        <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
        <div className="pointer-events-none absolute bottom-4 left-4 border border-border bg-panel/80 px-3 py-1 text-xs text-muted-light backdrop-blur-sm">
          Drag to rotate
        </div>
      </div>
    );
  }
