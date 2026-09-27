"use client";
import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], label, select, summary, [data-cursor]";

/**
 * Small dot + trailing circle that follow the mouse. The circle grows over links and buttons.
 * Only on devices with a real mouse, and never when the visitor prefers reduced motion.
 * The normal mouse pointer stays visible, so nothing is lost for accessibility.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let shown = false;
    let raf = 0;

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        shown = true;
        rx = mx;
        ry = my;
        root.classList.add("cursor-on");
      }
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      const target = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
      root.classList.toggle("cursor-hover", Boolean(target));
    };
    const onLeave = () => {
      shown = false;
      root.classList.remove("cursor-on", "cursor-hover");
    };
    const onDown = () => root.classList.add("cursor-down");
    const onUp = () => root.classList.remove("cursor-down");

    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      root.classList.remove("cursor-on", "cursor-hover", "cursor-down");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
