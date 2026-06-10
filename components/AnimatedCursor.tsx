"use client";

import { useEffect, useRef, useState } from "react";

const interactiveSelector = "a, button, input, textarea, select, [role='button']";

export default function AnimatedCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const cursor = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number>();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const canUseCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canUseCustomCursor || prefersReducedMotion) {
      return;
    }

    setIsEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const moveCursor = () => {
      cursor.current = mouse.current;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursor.current.x}px, ${cursor.current.y}px, 0)`;
      }

      animationFrame.current = window.requestAnimationFrame(moveCursor);
    };

    const handlePointerMove = (event: PointerEvent) => {
      mouse.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest(interactiveSelector)) {
        document.documentElement.classList.add("custom-cursor-active");
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest(interactiveSelector)) {
        document.documentElement.classList.remove("custom-cursor-active");
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerover", handlePointerOver);
    window.addEventListener("pointerout", handlePointerOut);
    animationFrame.current = window.requestAnimationFrame(moveCursor);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor", "custom-cursor-active");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerout", handlePointerOut);

      if (animationFrame.current) {
        window.cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <div ref={cursorRef} className="anime-cursor" aria-hidden="true">
      <svg viewBox="0 0 42 42" role="img">
        <ellipse className="hand-cursor-rainbow hand-cursor-rainbow-red" cx="20" cy="31" rx="9" ry="5" />
        <ellipse className="hand-cursor-rainbow hand-cursor-rainbow-yellow" cx="23" cy="32" rx="9" ry="5" />
        <ellipse className="hand-cursor-rainbow hand-cursor-rainbow-green" cx="26" cy="33" rx="9" ry="5" />
        <path className="hand-cursor-outline" d="M15 4h4v13h2v-5h4v6h2v-4h4v7h2v-3h4v11l-5 8H18l-9-9v-5h4l2 2V4z" />
        <path className="hand-cursor-fill" d="M17 6h2v14h4v-6h2v7h4v-5h2v8h4v-4h2v8l-4 7H19l-8-8v-2h1l5 5V6z" />
        <path className="hand-cursor-highlight" d="M17 6h1v17h-1V6zm6 8h1v6h-1v-6zm6 2h1v6h-1v-6z" />
      </svg>
    </div>
  );
}
