"use client";

import { useEffect } from "react";

/**
 * Moves the specular highlight on .liquid-glass elements to follow the pointer.
 * One delegated listener for the whole page, so the buttons themselves stay in
 * server components. Pointer-less devices keep the default highlight position.
 */
export default function GlassPointer() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;

    const onPointerMove = (event) => {
      const target = event.target.closest?.(".liquid-glass");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--glass-x", `${event.clientX - rect.left}px`);
      target.style.setProperty("--glass-y", `${event.clientY - rect.top}px`);
    };

    const onPointerOut = (event) => {
      const target = event.target.closest?.(".liquid-glass");
      if (!target || target.contains(event.relatedTarget)) return;
      target.style.removeProperty("--glass-x");
      target.style.removeProperty("--glass-y");
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
    };
  }, []);

  return null;
}
