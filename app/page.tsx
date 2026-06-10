"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import EmailModal from "../components/EmailModal";
import {
  defaultPortfolioData,
  loadPortfolioData,
  loadPortfolioDataFromDatabase,
} from "@/lib/portfolioData";
import EditedHeroText from "@/components/EditedHeroText";

const fontStacks: Record<string, string> = {
  Inter: '"Inter", sans-serif',
  Orbitron: '"Orbitron", sans-serif',
  Rajdhani: '"Rajdhani", sans-serif',
  "Space Mono": '"Space Mono", monospace',
  Montserrat: '"Montserrat", sans-serif',
  Poppins: '"Poppins", sans-serif',
};

const isPdfSource = (source = "") => source.toLowerCase().includes(".pdf") || source.startsWith("data:application/pdf");

export default function Home() {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<{
    title: string;
    source: string;
  } | null>(null);
  const [portfolioData, setPortfolioData] = useState(defaultPortfolioData);
  const [adminClicks, setAdminClicks] = useState(0);
  const [profileTilt, setProfileTilt] = useState({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  const projects = portfolioData.projects;
  const certificates = portfolioData.certificates;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const databaseData = await loadPortfolioDataFromDatabase();

        if (!isMounted) {
          return;
        }

        setPortfolioData(databaseData);
      } catch {
        if (isMounted) {
          setPortfolioData(loadPortfolioData());
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSecretAdminClick = () => {
    setAdminClicks((currentClicks) => {
      const nextClicks = currentClicks + 1;

      if (nextClicks >= 5) {
        window.location.href = "/admin";
        return 0;
      }

      window.setTimeout(() => setAdminClicks(0), 1800);
      return nextClicks;
    });
  };

  const handleProfileMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setProfileTilt({
      rotateX: y * -10,
      rotateY: x * 10,
      x: x * 12,
      y: y * 12,
    });
  };

  return (
    <div
      className="mx-auto flex max-w-5xl flex-col gap-16 pb-16 sm:gap-20 sm:pb-20 lg:gap-24"
      style={{ fontFamily: fontStacks[portfolioData.fontFamily] ?? fontStacks.Inter }}
    >
      {/* Hero Section */}
      <section className="relative flex min-h-[38vh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center sm:min-h-[42vh] sm:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_12%,rgba(34,211,238,0.16),transparent_24rem)]" />
        <EditedHeroText
          intro={portfolioData.hero.intro}
          highlight={portfolioData.hero.highlight}
          description={portfolioData.hero.description}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          <a href="#projects" className="rounded-full bg-cyan-400 px-6 py-3 font-medium text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-colors hover:bg-cyan-300">
            View Projects
          </a>
          <a href="#contact" className="rounded-full border border-cyan-300/25 bg-slate-900/70 px-6 py-3 font-medium text-cyan-50 transition-colors hover:bg-slate-800">
            Contact Me
          </a>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="scroll-mt-24">
        <div className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="mb-7 text-4xl font-extrabold text-cyan-50 sm:text-5xl">About Me</h2>
            <div className="max-w-3xl space-y-4 text-base leading-8 text-cyan-50/78 sm:text-lg">
              <p>{portfolioData.about.paragraphOne}</p>
              <p>{portfolioData.about.paragraphTwo}</p>
            </div>
          </div>

          <motion.div
            onMouseMove={handleProfileMove}
            onMouseLeave={() => setProfileTilt({ rotateX: 0, rotateY: 0, x: 0, y: 0 })}
            animate={profileTilt}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl bg-slate-900 shadow-[0_0_60px_rgba(34,211,238,0.12)] lg:max-w-md"
          >
            <motion.img
              src={portfolioData.hero.profileImage || "/profile.png"}
              alt="Profile portrait"
              className="h-full w-full object-cover"
              animate={{ scale: profileTilt.x || profileTilt.y ? 1.04 : 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-transparent to-violet-500/10 opacity-70" />
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="skills" className="scroll-mt-24">
        <h2 className="mb-8 text-3xl font-extrabold text-cyan-50">Tech Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { name: "React Native", icon: "react", color: "61DAFB" },
            { name: "React JS", icon: "react", color: "61DAFB" },
            { name: "Next.js", icon: "nextdotjs", color: "white" },
            { name: "JavaScript", icon: "javascript", color: "F7DF1E" },
            { name: "Tailwind CSS", icon: "tailwindcss", color: "06B6D4" },
            { name: "Node.js", icon: "nodedotjs", color: "339933" },
            { name: "HTML", icon: "html5", color: "E34F26" },
            { name: "CSS", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
            { name: "PHP", icon: "php", color: "777BB4" },
          ].map((tech) => (
            <motion.div 
              key={tech.name}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex min-h-32 flex-col items-center justify-center gap-4 rounded-2xl border border-cyan-300/15 bg-slate-950/55 p-5 shadow-[0_0_30px_rgba(34,211,238,0.05)] backdrop-blur-xl transition-colors hover:border-primary/50 sm:p-6"
            >
              <img 
                src={tech.customUrl || `https://cdn.simpleicons.org/${tech.icon}/${tech.color}`} 
                alt={tech.name} 
                className="w-10 h-10 object-contain drop-shadow-md"
              />
              <span className="text-center text-xs font-semibold tracking-wide text-cyan-50/80">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="scroll-mt-24">
        <div>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold leading-tight text-cyan-50 sm:text-4xl md:text-[2.6rem]">My Projects</h2>
          </div>

          {projects.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white/85 p-8 text-center shadow-sm backdrop-blur sm:p-10">
              <h3 className="text-2xl font-extrabold text-cyan-50">Projects coming soon</h3>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-cyan-50/70">
                I will add my real projects here once they are ready.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {projects.map((project) => (
              <motion.article
                key={project.title}
                role="link"
                tabIndex={0}
                onClick={() => window.open(project.url, "_blank", "noopener,noreferrer")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    window.open(project.url, "_blank", "noopener,noreferrer");
                  }
                }}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="group flex min-h-[28rem] cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-700 bg-[#2b3848] shadow-xl transition-colors hover:border-cyan-300 sm:min-h-[32rem] lg:min-h-[34rem]"
              >
                <div className={`project-thumb project-thumb-${project.theme}`}>
                  {project.image ? (
                    <img src={project.image} alt={`${project.title} preview`} className="project-preview-image" />
                  ) : (
                    <span>{project.title}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="text-2xl font-extrabold text-cyan-100">{project.title}</h3>
                  <p className="mt-4 text-base leading-7 text-cyan-50/80">
                    {project.description}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-3 pt-8 text-[0px] text-transparent sm:pt-10">
                    {project.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-slate-600/60 px-3 py-1.5 text-xs font-medium text-indigo-200">
                        {tag}
                      </span>
                    ))}
                    View Details <span className="ml-1 text-lime-400">-&gt;</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Certificates Section */}
      <section id="certificates" className="scroll-mt-24">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold leading-tight text-cyan-50 sm:text-4xl md:text-[2.6rem]">
            Certificates
          </h2>
        </div>

        {certificates.length === 0 ? (
          <div className="rounded-2xl border border-cyan-300/15 bg-slate-950/55 p-8 text-center shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-xl">
            <h3 className="text-xl font-extrabold text-cyan-50">Certificates coming soon</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-cyan-50/65">
              Add certificates from the admin panel and they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate, index) => {
              const certificateSource = certificate.image || certificate.url;
              const content = (
                <motion.article
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="group overflow-hidden rounded-2xl border border-cyan-300/15 bg-slate-950/35 shadow-[0_0_35px_rgba(34,211,238,0.08)] backdrop-blur-xl transition-colors hover:border-cyan-300/45"
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      if (certificate.url) {
                        window.open(certificate.url, "_blank", "noopener,noreferrer");
                        return;
                      }

                      if (certificateSource) {
                        setSelectedCertificate({
                          title: certificate.title,
                          source: certificateSource,
                        });
                      }
                    }}
                    className="grid aspect-video w-full place-items-center overflow-hidden bg-transparent text-left"
                    aria-label={`View ${certificate.title} certificate image`}
                  >
                    {certificateSource ? (
                      isPdfSource(certificateSource) ? (
                        <iframe
                          src={certificateSource}
                          title={`${certificate.title} certificate`}
                          className="pointer-events-none h-full w-full bg-slate-950"
                        />
                      ) : (
                        <img
                          src={certificateSource}
                          alt={`${certificate.title} certificate`}
                          className="h-full w-full object-contain"
                        />
                      )
                    ) : (
                      <span className="px-6 text-center text-sm font-bold uppercase tracking-[0.2em] text-cyan-100/45">
                        Certificate
                      </span>
                    )}
                  </button>
                </motion.article>
              );

              return <div key={`${certificate.title}-${index}`}>{content}</div>;
            })}
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative mb-10 scroll-mt-24 overflow-hidden rounded-2xl px-2 pb-24 pt-16 sm:rounded-3xl sm:pb-32 sm:pt-20">
        {/* Dotted Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at center, #888 1px, transparent 1px)', backgroundSize: 'clamp(18px, 4vw, 24px) clamp(18px, 4vw, 24px)' }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center">
          {/* Top Pill */}
          <button
            type="button"
            onClick={handleSecretAdminClick}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-slate-950/70 px-4 py-1.5 shadow-sm backdrop-blur-sm transition-colors hover:border-cyan-300/40"
            aria-label="Contact details"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100">
              CONTACT DETAILS
            </span>
          </button>

          {/* Floating Card */}
          <div className="flex w-full max-w-3xl flex-row flex-wrap justify-center gap-8 rounded-3xl border border-cyan-300/15 bg-slate-950/70 p-6 shadow-[0_0_70px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:gap-16 sm:p-8 md:gap-24 md:p-12">
            
            {/* Email Icon */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEmailModalOpen(true)}
              className="flex flex-col items-center gap-4 cursor-pointer group"
            >
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#161b26] flex items-center justify-center border border-gray-200 dark:border-gray-800/80 group-hover:border-cyan-500/50 transition-colors shadow-inner">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300 group-hover:text-cyan-400 transition-colors">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-cyan-400 transition-colors">Email</span>
            </motion.div>

            {/* Resume Icon */}
            <motion.a
              href={portfolioData.contact.resumeUrl || undefined}
              target={portfolioData.contact.resumeUrl ? "_blank" : undefined}
              rel={portfolioData.contact.resumeUrl ? "noopener noreferrer" : undefined}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={(event) => {
                if (!portfolioData.contact.resumeUrl) {
                  event.preventDefault();
                }
              }}
              className="flex flex-col items-center gap-4 cursor-pointer group"
              aria-label={portfolioData.contact.resumeUrl ? "Open resume" : "Resume link not set"}
            >
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#161b26] flex items-center justify-center border border-gray-200 dark:border-gray-800/80 group-hover:border-fuchsia-500/50 transition-colors shadow-inner">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300 group-hover:text-fuchsia-400 transition-colors">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-fuchsia-400 transition-colors">Resume</span>
            </motion.a>

            {/* Facebook Icon */}
            <motion.a
              href={portfolioData.contact.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-4 cursor-pointer group"
              aria-label="Facebook profile"
            >
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#161b26] flex items-center justify-center border border-gray-200 dark:border-gray-800/80 group-hover:border-blue-500/50 transition-colors shadow-inner">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors" aria-hidden="true">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.25 10.44 22v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.9h2.77l-.44 2.91h-2.33V22C18.34 21.25 22 17.08 22 12.06z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-500 transition-colors">Facebook</span>
            </motion.a>

          </div>
        </div>
      </section>
      
      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        email={portfolioData.contact.email}
      />

      {selectedCertificate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSelectedCertificate(null)}
            className="absolute inset-0"
            aria-label="Close certificate image"
          />
          <button
            type="button"
            onClick={() => setSelectedCertificate(null)}
            className="absolute right-4 top-4 z-20 rounded-full bg-black/45 px-3 py-1.5 text-sm font-bold text-cyan-50 backdrop-blur hover:bg-black/65"
          >
            Close
          </button>
          {isPdfSource(selectedCertificate.source) ? (
            <iframe
              src={selectedCertificate.source}
              title={`${selectedCertificate.title} full certificate`}
              className="relative z-10 h-[92vh] w-full max-w-5xl rounded-lg border border-cyan-300/15 bg-slate-950 shadow-[0_0_80px_rgba(34,211,238,0.16)]"
            />
          ) : (
            <img
              src={selectedCertificate.source}
              alt={`${selectedCertificate.title} full certificate`}
              className="relative z-10 max-h-[92vh] w-auto max-w-full rounded-lg object-contain shadow-[0_0_80px_rgba(34,211,238,0.16)]"
            />
          )}
        </div>
      )}
    </div>
  );
}
