"use client";

import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 12) {
        setIsVisible(true);
      } else {
        setIsVisible(currentScrollY < lastScrollY.current);
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-3 z-50 flex justify-center px-4 text-cyan-50 transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
      }`}
    >
      <div className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-cyan-300/20 bg-slate-900/70 px-2 py-2 shadow-[0_0_35px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:gap-2">
        <a href="#about" className="whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors hover:bg-cyan-300/10 hover:text-primary sm:text-sm">
          About
        </a>
        <a href="#projects" className="whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors hover:bg-cyan-300/10 hover:text-primary sm:text-sm">
          Projects
        </a>
        <a href="#skills" className="whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors hover:bg-cyan-300/10 hover:text-primary sm:text-sm">
          Tech Stack
        </a>
        <a href="#certificates" className="whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors hover:bg-cyan-300/10 hover:text-primary sm:text-sm">
          Certificates
        </a>
        <a href="#contact" className="whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors hover:bg-cyan-300/10 hover:text-primary sm:text-sm">
          Contact
        </a>
      </div>
    </nav>
  );
}
