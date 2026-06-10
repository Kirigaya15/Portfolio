"use client";

import { useEffect, useState } from "react";

type IntroPhase = "loading" | "jumpscare" | "done";

export default function IntroSplash() {
  const [phase, setPhase] = useState<IntroPhase>("done");

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("portfolio-intro-seen") === "true";

    if (hasSeenIntro) {
      return;
    }

    setPhase("loading");

    const scareTimer = window.setTimeout(() => {
      setPhase("jumpscare");
    }, 3600);

    const doneTimer = window.setTimeout(() => {
      sessionStorage.setItem("portfolio-intro-seen", "true");
      setPhase("done");
    }, 5200);

    return () => {
      window.clearTimeout(scareTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") {
    return null;
  }

  return (
    <div className={`intro-splash intro-splash-${phase}`} role="status" aria-live="polite">
      {phase === "loading" ? (
        <div className="intro-loader">
          <div className="intro-hand" aria-hidden="true">
            <svg viewBox="0 0 90 90">
              <path className="intro-hand-shadow" d="M25 53h34l13 8-8 6H26l-14-9 13-5z" />
              <path className="intro-hand-outline" d="M23 18h13v27h5V9h13v36h5V16h13v32h5V25h12v37L76 76H34L12 63V43h12l7 6V18h-8z" />
              <path className="intro-hand-fill" d="M28 23h7v31h11V14h7v40h11V21h7v36h11V31h6v27L73 71H36L17 60V48h4l11 10V23h-4z" />
              <path className="intro-hand-light" d="M28 23h3v27h-3V23zm18-9h3v36h-3V14zm18 7h3v30h-3V21z" />
            </svg>
          </div>
          <p className="intro-mini-text">LOADING</p>
          <h1>LOADING PORTFOLIO</h1>
        </div>
      ) : (
        <div className="intro-jumpscare" aria-label="Ghost jumpscare">
          <div className="intro-ghost" aria-hidden="true">
            <svg viewBox="0 0 220 260">
              <path className="intro-ghost-shadow" d="M41 229c22 14 112 16 140 0 12-7 10-22-7-26-34-9-90-9-124 0-19 5-22 18-9 26z" />
              <path className="intro-ghost-body" d="M110 10c-51 0-86 39-86 94v120l22-18 18 28 23-25 24 31 25-32 23 26 18-28 19 18V104c0-55-35-94-86-94z" />
              <path className="intro-ghost-face" d="M69 99c0-15 10-27 23-27s23 12 23 27-10 27-23 27-23-12-23-27zm59 0c0-15 10-27 23-27s23 12 23 27-10 27-23 27-23-12-23-27z" />
              <path className="intro-ghost-mouth" d="M86 154c7-17 40-17 48 0 7 16-4 36-24 36s-31-20-24-36z" />
              <path className="intro-ghost-glitch intro-ghost-glitch-red" d="M36 91c10-45 38-69 76-69 25 0 47 11 61 30-14-11-33-17-54-17-43 0-70 23-83 56z" />
              <path className="intro-ghost-glitch intro-ghost-glitch-blue" d="M51 211l12-12 19 28 24-28 24 31 27-34 14 15-12 20-23-26-25 32-24-31-23 25-13-20z" />
            </svg>
          </div>
          <h1>BOO!</h1>
        </div>
      )}
    </div>
  );
}
