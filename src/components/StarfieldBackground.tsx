"use client";

import { useEffect, useRef } from "react";

export function StarfieldBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (reduced) return;

    let raf = 0;
    let running = false;
    let isDarkActive = false;

    let width = 1;
    let height = 1;

    let pointerX = 0;
    let pointerY = 0;
    let scrollY = 0;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
    };

    const updateTargetsFromPointer = (clientX: number, clientY: number) => {
      const nx = clientX / width - 0.5;
      const ny = clientY / height - 0.5;
      pointerX = clamp(nx * 28, -18, 18);
      pointerY = clamp(ny * 28, -18, 18);
    };

    const onPointerMove = (e: PointerEvent) => {
      updateTargetsFromPointer(e.clientX, e.clientY);
      schedule();
    };

    const onScroll = () => {
      scrollY = window.scrollY || 0;
      schedule();
    };

    const setVars = (x: number, y: number) => {
      el.style.setProperty("--sf-x1", `${(x * 0.25).toFixed(2)}px`);
      el.style.setProperty("--sf-y1", `${(y * 0.25).toFixed(2)}px`);
      el.style.setProperty("--sf-x2", `${(x * 0.5).toFixed(2)}px`);
      el.style.setProperty("--sf-y2", `${(y * 0.5).toFixed(2)}px`);
      el.style.setProperty("--sf-x3", `${(x * 0.85).toFixed(2)}px`);
      el.style.setProperty("--sf-y3", `${(y * 0.85).toFixed(2)}px`);
    };

    const updateTarget = () => {
      targetX = pointerX;
      targetY = pointerY - clamp(scrollY * 0.03, -120, 120);
    };

    const tick = () => {
      raf = 0;
      if (!isDarkActive) return;

      updateTarget();

      currentX += (targetX - currentX) * 0.10;
      currentY += (targetY - currentY) * 0.10;
      setVars(currentX, currentY);

      const done =
        Math.abs(targetX - currentX) < 0.12 &&
        Math.abs(targetY - currentY) < 0.12;

      if (!done) schedule();
    };

    const schedule = () => {
      if (!isDarkActive) return;
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      isDarkActive = true;

      resize();
      onScroll();
      updateTargetsFromPointer(width / 2, height / 2);
      setVars(0, 0);

      window.addEventListener("resize", resize, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      schedule();
    };

    const stop = () => {
      if (!running) return;
      running = false;
      isDarkActive = false;

      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      setVars(0, 0);
      currentX = 0;
      currentY = 0;
      targetX = 0;
      targetY = 0;
    };

    const sync = () => {
      const nextDark = document.documentElement.classList.contains("dark");
      if (nextDark) start();
      else stop();
    };

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    sync();

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="starfield">
      <div className="starfield-layer starfield-layer-1">
        <div className="starfield-surface starfield-surface-1" />
      </div>
      <div className="starfield-layer starfield-layer-2">
        <div className="starfield-surface starfield-surface-2" />
      </div>
      <div className="starfield-layer starfield-layer-3">
        <div className="starfield-surface starfield-surface-3" />
      </div>
      <div className="starfield-vignette" />
    </div>
  );
}
