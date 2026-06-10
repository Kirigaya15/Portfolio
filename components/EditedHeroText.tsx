"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type EditedHeroTextProps = {
  intro: string;
  highlight: string;
  description: string;
};

export default function EditedHeroText({ intro, highlight, description }: EditedHeroTextProps) {
  const fullTitle = `${intro} ${highlight}`.trim();
  const [typedTitle, setTypedTitle] = useState("");
  const [typedDescription, setTypedDescription] = useState("");

  useEffect(() => {
    let titleInterval: number | undefined;
    let descriptionInterval: number | undefined;
    let titleStartTimer: number | undefined;
    let descriptionStartTimer: number | undefined;
    let descriptionRestartTimer: number | undefined;

    setTypedTitle("");

    titleStartTimer = window.setTimeout(() => {
      let titleIndex = 0;

      titleInterval = window.setInterval(() => {
        titleIndex += 1;
        setTypedTitle(fullTitle.slice(0, titleIndex));

        if (titleIndex >= fullTitle.length) {
          window.clearInterval(titleInterval);
        }
      }, 38);
    }, 260);

    const runDescriptionAnimation = () => {
      setTypedDescription("");
      let descriptionIndex = 0;

      descriptionInterval = window.setInterval(() => {
        descriptionIndex += 2;

        setTypedDescription(description.slice(0, descriptionIndex));

        if (descriptionIndex >= description.length) {
          window.clearInterval(descriptionInterval);
          descriptionRestartTimer = window.setTimeout(runDescriptionAnimation, 20000);
        }
      }, 38);
    };

    descriptionStartTimer = window.setTimeout(runDescriptionAnimation, 260);

    return () => {
      window.clearTimeout(titleStartTimer);
      window.clearTimeout(descriptionStartTimer);
      window.clearTimeout(descriptionRestartTimer);
      window.clearInterval(titleInterval);
      window.clearInterval(descriptionInterval);
    };
  }, [description, fullTitle]);

  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mb-5 min-h-[1.15em] text-4xl font-extrabold tracking-tight text-cyan-50 sm:text-5xl md:text-6xl"
      >
        <span className="text-primary">
          {typedTitle}
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
        className="mx-auto mb-8 min-h-[3.5rem] max-w-3xl text-lg font-semibold leading-8 text-cyan-100/70 sm:text-xl md:text-2xl"
      >
        {typedDescription}
        <span className="hero-type-caret hero-type-caret-small" aria-hidden="true" />
      </motion.p>
    </>
  );
}
