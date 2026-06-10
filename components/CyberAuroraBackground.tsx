"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

const seededParticle = (index: number) => {
  const leftSeed = (index * 37 + 17) % 100;
  const topSeed = (index * 53 + 29) % 100;
  const sizeSeed = ((index * 19) % 30) / 10;
  const durationSeed = (index * 23) % 12;
  const delaySeed = ((index * 31) % 80) / 10;

  return {
    id: index,
    left: `${leftSeed}%`,
    top: `${topSeed}%`,
    size: sizeSeed + 1,
    duration: durationSeed + 10,
    delay: delaySeed,
  };
};

const particles = Array.from({ length: 25 }, (_, index) => seededParticle(index));

export default function CyberAuroraBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const frameRef = useRef<number>();

  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        mouseX.set(event.clientX);
        mouseY.set(event.clientY);
      });
    };

    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [mouseX, mouseY]);

  return (
    <div className="cyber-background" aria-hidden="true">
      <motion.div
        className="mouse-orb"
        style={{
          x: smoothX,
          y: smoothY,
        }}
      />

      <div className="deep-space" />
      <div className="cyber-grid" />
      <div className="cyber-grid cyber-grid-secondary" />
      <div className="cyber-noise" />
      <div className="cyber-scanlines" />

      <motion.div
        className="aurora aurora-one"
        animate={{
          x: [0, 120, -80, 0],
          y: [0, -70, 80, 0],
          scale: [1, 1.18, 0.95, 1],
          rotate: [0, 12, -8, 0],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="aurora aurora-two"
        animate={{
          x: [0, -110, 90, 0],
          y: [0, 90, -60, 0],
          scale: [1, 0.9, 1.2, 1],
          rotate: [0, -10, 9, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="aurora aurora-three"
        animate={{
          x: [0, 70, -120, 0],
          y: [0, 55, -75, 0],
          scale: [1, 1.15, 0.92, 1],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="particle-field">
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -34, 0],
              opacity: [0.15, 0.8, 0.15],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="hologram-ring ring-one"
        animate={{ rotate: 360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="hologram-ring ring-two"
        animate={{ rotate: -360 }}
        transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
