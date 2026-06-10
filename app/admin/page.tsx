"use client";

import { useEffect, useState } from "react";
import {
  PortfolioData,
  defaultPortfolioData,
  loadPortfolioData,
  loadPortfolioDataFromDatabase,
  normalizePortfolioData,
  portfolioStorageKey,
  savePortfolioDataToDatabase,
} from "@/lib/portfolioData";

const inputClass =
  "w-full rounded-lg border border-cyan-300/15 bg-slate-950/70 px-3 py-2 text-sm text-cyan-50 outline-none transition-colors placeholder:text-cyan-100/30 focus:border-cyan-300/60";
const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-cyan-200";
const panelClass =
  "rounded-2xl border border-cyan-300/15 bg-slate-950/65 p-5 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-xl";
const adminPassword = "Bugdo15";
const adminSessionKey = "portfolio-admin-unlocked";
const fontOptions = [
  "Inter",
  "Orbitron",
  "Rajdhani",
  "Space Mono",
  "Montserrat",
  "Poppins",
];
const fontStacks: Record<string, string> = {
  Inter: '"Inter", sans-serif',
  Orbitron: '"Orbitron", sans-serif',
  Rajdhani: '"Rajdhani", sans-serif',
  "Space Mono": '"Space Mono", monospace',
  Montserrat: '"Montserrat", sans-serif',
  Poppins: '"Poppins", sans-serif',
};

const isPdfSource = (source = "") => source.toLowerCase().includes(".pdf") || source.startsWith("data:application/pdf");

const safeSetBrowserBackup = (data: PortfolioData) => {
  try {
    window.localStorage.setItem(portfolioStorageKey, JSON.stringify(data));
  } catch {
    window.localStorage.removeItem(portfolioStorageKey);
  }
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const uploadFileToDatabase = async (
  file: File,
  folder: string,
  options: { fileName?: string; overwrite?: boolean } = {}
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  if (options.fileName) {
    formData.append("fileName", options.fileName);
  }

  if (options.overwrite) {
    formData.append("overwrite", "true");
  }

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed.");
  }

  const result = (await response.json()) as { url?: string };

  if (!result.url) {
    throw new Error("Upload returned no URL.");
  }

  return result.url;
};

const getStoredFileSource = async (
  file: File,
  folder: string,
  options: { fileName?: string; overwrite?: boolean; fallbackUrl?: string } = {}
) => {
  try {
    return await uploadFileToDatabase(file, folder, options);
  } catch {
    if (options.fallbackUrl) {
      return options.fallbackUrl;
    }

    return fileToDataUrl(file);
  }
};

export default function AdminPage() {
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsUnlocked(window.sessionStorage.getItem(adminSessionKey) === "true");

    const loadData = async () => {
      try {
        const databaseData = await loadPortfolioDataFromDatabase();

        if (!isMounted) {
          return;
        }

        setData(databaseData);
        safeSetBrowserBackup(databaseData);
      } catch {
        if (isMounted) {
          setData(loadPortfolioData());
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    const lockOnLeave = () => {
      window.sessionStorage.removeItem(adminSessionKey);
    };

    window.addEventListener("pagehide", lockOnLeave);
    return () => window.removeEventListener("pagehide", lockOnLeave);
  }, [isUnlocked]);

  const unlockAdmin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === adminPassword) {
      window.sessionStorage.setItem(adminSessionKey, "true");
      setIsUnlocked(true);
      setPasswordError("");
      return;
    }

    setPasswordError("Wrong password.");
  };

  const persistData = async (nextData: PortfolioData) => {
    const safeData = normalizePortfolioData(nextData);
    setIsSaving(true);
    setSaved(false);
    setSaveError("");

    try {
      const savedData = await savePortfolioDataToDatabase(safeData);

      safeSetBrowserBackup(savedData);
      setData(savedData);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);

      return savedData;
    } finally {
      setIsSaving(false);
    }
  };

  const saveData = async () => {
    const safeData = normalizePortfolioData(data);

    try {
      await persistData(safeData);
    } catch (error) {
      safeSetBrowserBackup(safeData);
      setData(safeData);
      const message = error instanceof Error ? error.message : "Database save failed.";
      setSaveError(`Database save failed: ${message}`);
    }
  };

  const resetData = async () => {
    try {
      await persistData(defaultPortfolioData);
    } catch {
      safeSetBrowserBackup(defaultPortfolioData);
      setData(defaultPortfolioData);
      setSaveError("Database reset failed. Reset only in this browser.");
    }
  };

  const lockAdmin = () => {
    window.sessionStorage.removeItem(adminSessionKey);
    setIsUnlocked(false);
    setPassword("");
  };

  const updateProject = (index: number, key: string, value: string) => {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project, projectIndex) =>
        projectIndex === index
          ? {
              ...project,
              [key]: key === "tags" ? value.split(",").map((tag) => tag.trim()).filter(Boolean) : value,
            }
          : project
      ),
    }));
  };

  const uploadProjectImage = async (index: number, file: File | undefined) => {
    if (!file) {
      return;
    }

    const image = await getStoredFileSource(file, "project-images");
    updateProject(index, "image", image);
  };

  const uploadProfileImage = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    const image = await getStoredFileSource(file, "profile-images");

    setData((current) => {
      const nextData = normalizePortfolioData({
        ...current,
        hero: {
          ...current.hero,
          profileImage: image,
        },
      });

      persistData(nextData).catch(() => {
        setSaveError("Database save failed. Check your Vercel Blob setup and click Save again.");
      });

      return nextData;
    });
  };

  const addProject = () => {
    setData((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          title: "New Project",
          description: "Project description here.",
          theme: "store",
          tags: ["React"],
          url: "https://example.com",
          image: "",
        },
      ],
    }));
  };

  const removeProject = (index: number) => {
    setData((current) => ({
      ...current,
      projects: current.projects.filter((_, projectIndex) => projectIndex !== index),
    }));
  };

  const updateCertificate = (index: number, key: string, value: string) => {
    setData((current) => ({
      ...current,
      certificates: current.certificates.map((certificate, certificateIndex) =>
        certificateIndex === index
          ? {
              ...certificate,
              [key]: value,
            }
          : certificate
      ),
    }));
  };

  const uploadCertificateImage = async (index: number, file: File | undefined) => {
    if (!file) {
      return;
    }

    const fileSource = await getStoredFileSource(file, "certificate-files");
    updateCertificate(index, "image", fileSource);
    updateCertificate(index, "url", fileSource);
  };

  const uploadResumeFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    const resumeUrl = await getStoredFileSource(file, "resume-files", {
      fallbackUrl: "/Moralde-CV.pdf",
      fileName: "Moralde-CV.pdf",
      overwrite: true,
    });
    const nextData = normalizePortfolioData({
      ...data,
      contact: {
        ...data.contact,
        resumeUrl,
      },
    });

    setData(nextData);

    try {
      await persistData(nextData);
    } catch {
      setSaveError("Resume uploaded locally, but database save failed. Check Vercel Blob setup.");
    }
  };

  const addCertificate = () => {
    setData((current) => ({
      ...current,
      certificates: [
        ...current.certificates,
        {
          title: "New Certificate",
          issuer: "Issuer name",
          date: "",
          url: "",
          image: "",
        },
      ],
    }));
  };

  const removeCertificate = (index: number) => {
    setData((current) => ({
      ...current,
      certificates: current.certificates.filter((_, certificateIndex) => certificateIndex !== index),
    }));
  };

  if (!isUnlocked) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 text-cyan-50">
        <form onSubmit={unlockAdmin} className={panelClass}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Secret Admin</p>
          <h1 className="mt-2 text-3xl font-extrabold">Password Required</h1>
          <p className="mt-2 text-sm text-cyan-100/65">
            Enter the admin password to edit the portfolio.
          </p>
          <div className="mt-6">
            <label className={labelClass}>Password</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
            {passwordError && <p className="mt-2 text-sm font-bold text-red-300">{passwordError}</p>}
          </div>
          <button type="submit" className="mt-5 w-full rounded-lg bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-300">
            Unlock Admin
          </button>
          <a href="/" className="mt-3 block text-center text-sm text-cyan-200 hover:text-cyan-100">
            Back to portfolio
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-28 text-cyan-50 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Admin Panel</p>
          <h1 className="mt-2 text-4xl font-extrabold">Edit Portfolio</h1>
          <p className="mt-2 max-w-2xl text-sm text-cyan-100/65">
            Changes save to Vercel Blob when deployed, with browser storage as backup.
          </p>
          {isSaving && <p className="mt-2 text-sm font-bold text-cyan-200">Saving changes...</p>}
          {saveError && <p className="mt-2 text-sm font-bold text-red-300">{saveError}</p>}
        </div>
        <div className="flex gap-3">
          <a
            href="/"
            onClick={lockAdmin}
            className="rounded-lg border border-cyan-300/20 px-4 py-2 text-sm font-bold hover:bg-cyan-300/10"
          >
            View Site
          </a>
          <button
            onClick={resetData}
            disabled={isSaving}
            className="rounded-lg border border-red-300/30 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Reset
          </button>
          <button
            onClick={saveData}
            disabled={isSaving}
            className="min-w-24 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-70"
          >
            {isSaving ? "Saving..." : saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        <section className={panelClass}>
          <h2 className="mb-4 text-xl font-extrabold">Font Style</h2>
          <label className={labelClass}>Portfolio Font</label>
          <select
            className={inputClass}
            value={data.fontFamily}
            onChange={(event) => setData({ ...data, fontFamily: event.target.value })}
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <p className="mt-3 text-sm text-cyan-100/60" style={{ fontFamily: fontStacks[data.fontFamily] ?? fontStacks.Inter }}>
            Preview: The quick brown fox jumps over the futuristic portfolio.
          </p>
        </section>

        <section className={panelClass}>
          <h2 className="mb-4 text-xl font-extrabold">Hero</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Intro</label>
              <input
                className={inputClass}
                value={data.hero.intro}
                onChange={(event) =>
                  setData({ ...data, hero: { ...data.hero, intro: event.target.value } })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Highlighted Text</label>
              <input
                className={inputClass}
                value={data.hero.highlight}
                onChange={(event) =>
                  setData({ ...data, hero: { ...data.hero, highlight: event.target.value } })
                }
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Hero Description</label>
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={data.hero.description}
              onChange={(event) =>
                setData({ ...data, hero: { ...data.hero, description: event.target.value } })
              }
            />
          </div>
          <div className="mt-4 rounded-xl border border-cyan-300/10 bg-black/20 p-4">
            <label className={labelClass}>Profile Picture</label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {data.hero.profileImage && (
                <img
                  src={data.hero.profileImage}
                  alt="Profile preview"
                  className="h-24 w-24 rounded-full border border-cyan-300/20 object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div className="flex-1">
                <input
                  className={inputClass}
                  value={data.hero.profileImage}
                  onChange={(event) =>
                    setData({
                      ...data,
                      hero: { ...data.hero, profileImage: event.target.value },
                    })
                  }
                  placeholder="/profile.png or uploaded image data"
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => uploadProfileImage(event.target.files?.[0])}
                    className="block w-full text-sm text-cyan-100 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-950 hover:file:bg-cyan-300"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setData({
                        ...data,
                        hero: { ...data.hero, profileImage: "/profile.png" },
                      })
                    }
                    className="rounded-lg border border-red-300/30 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-400/10"
                  >
                    Reset Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={panelClass}>
          <h2 className="mb-4 text-xl font-extrabold">About</h2>
          <div className="grid gap-4">
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={data.about.paragraphOne}
              onChange={(event) =>
                setData({ ...data, about: { ...data.about, paragraphOne: event.target.value } })
              }
            />
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={data.about.paragraphTwo}
              onChange={(event) =>
                setData({ ...data, about: { ...data.about, paragraphTwo: event.target.value } })
              }
            />
          </div>
        </section>

        <section className={panelClass}>
          <h2 className="mb-4 text-xl font-extrabold">Contact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input
                className={inputClass}
                value={data.contact.email}
                onChange={(event) =>
                  setData({ ...data, contact: { ...data.contact, email: event.target.value } })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input
                className={inputClass}
                value={data.contact.facebookUrl}
                onChange={(event) =>
                  setData({ ...data, contact: { ...data.contact, facebookUrl: event.target.value } })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Resume URL</label>
              <input
                className={inputClass}
                value={data.contact.resumeUrl}
                placeholder="/Moralde-CV.pdf or hosted resume link"
                onChange={(event) =>
                  setData({ ...data, contact: { ...data.contact, resumeUrl: event.target.value } })
                }
              />
              <div className="mt-3 rounded-lg border border-cyan-300/10 bg-slate-950/40 p-3">
                <label className={labelClass}>Upload Resume PDF</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => uploadResumeFile(event.target.files?.[0])}
                    className="block w-full text-sm text-cyan-100 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-950 hover:file:bg-cyan-300"
                  />
                  {data.contact.resumeUrl && (
                    <a
                      href={data.contact.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-cyan-300/25 px-3 py-2 text-center text-xs font-bold text-cyan-100 hover:bg-cyan-300/10"
                    >
                      Open Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={panelClass}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold">Projects</h2>
            <button onClick={addProject} className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-bold hover:bg-cyan-300/10">
              Add Project
            </button>
          </div>
          <div className="grid gap-5">
            {data.projects.map((project, index) => (
              <div key={`${project.title}-${index}`} className="rounded-xl border border-cyan-300/10 bg-black/20 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-bold">{project.title}</h3>
                  <button onClick={() => removeProject(index)} className="text-xs font-bold text-red-200 hover:text-red-100">
                    Remove
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input className={inputClass} value={project.title} onChange={(event) => updateProject(index, "title", event.target.value)} />
                  <input className={inputClass} value={project.url} onChange={(event) => updateProject(index, "url", event.target.value)} />
                  <input className={inputClass} value={project.theme} onChange={(event) => updateProject(index, "theme", event.target.value)} />
                  <input className={inputClass} value={project.image ?? ""} onChange={(event) => updateProject(index, "image", event.target.value)} placeholder="Image path or uploaded data URL" />
                  <div className="rounded-lg border border-cyan-300/10 bg-slate-950/40 p-3 md:col-span-2">
                    <label className={labelClass}>Project Image</label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => uploadProjectImage(index, event.target.files?.[0])}
                        className="block w-full text-sm text-cyan-100 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-950 hover:file:bg-cyan-300"
                      />
                      <button
                        type="button"
                        onClick={() => updateProject(index, "image", "")}
                        className="rounded-lg border border-red-300/30 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-400/10"
                      >
                        Remove Image
                      </button>
                    </div>
                    {project.image && (
                      <img
                        src={project.image}
                        alt={`${project.title} preview`}
                        className="mt-4 aspect-video w-full rounded-lg border border-cyan-300/10 object-contain"
                      />
                    )}
                  </div>
                  <input className={`${inputClass} md:col-span-2`} value={project.tags.join(", ")} onChange={(event) => updateProject(index, "tags", event.target.value)} />
                  <textarea className={`${inputClass} min-h-24 resize-y md:col-span-2`} value={project.description} onChange={(event) => updateProject(index, "description", event.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={panelClass}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold">Certificates</h2>
            <button onClick={addCertificate} className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-bold hover:bg-cyan-300/10">
              Add Certificate
            </button>
          </div>
          <div className="grid gap-5">
            {data.certificates.length === 0 && (
              <p className="rounded-xl border border-cyan-300/10 bg-black/20 p-4 text-sm text-cyan-100/60">
                No certificates yet. Click Add Certificate to add one.
              </p>
            )}
            {data.certificates.map((certificate, index) => (
              <div key={`${certificate.title}-${index}`} className="rounded-xl border border-cyan-300/10 bg-black/20 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-bold">{certificate.title}</h3>
                  <button onClick={() => removeCertificate(index)} className="text-xs font-bold text-red-200 hover:text-red-100">
                    Remove
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className={inputClass}
                    value={certificate.title}
                    onChange={(event) => updateCertificate(index, "title", event.target.value)}
                    placeholder="Certificate title"
                  />
                  <input
                    className={inputClass}
                    value={certificate.issuer}
                    onChange={(event) => updateCertificate(index, "issuer", event.target.value)}
                    placeholder="Issuer"
                  />
                  <input
                    className={inputClass}
                    value={certificate.date}
                    onChange={(event) => updateCertificate(index, "date", event.target.value)}
                    placeholder="Date, e.g. 2026"
                  />
                  <input
                    className={inputClass}
                    value={certificate.url}
                    onChange={(event) => updateCertificate(index, "url", event.target.value)}
                    placeholder="Certificate link (optional)"
                  />
                  <input
                    className={`${inputClass} md:col-span-2`}
                    value={certificate.image ?? ""}
                    onChange={(event) => updateCertificate(index, "image", event.target.value)}
                    placeholder="Image path or uploaded data URL"
                  />
                  <div className="rounded-lg border border-cyan-300/10 bg-slate-950/40 p-3 md:col-span-2">
                    <label className={labelClass}>Certificate Image</label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(event) => uploadCertificateImage(index, event.target.files?.[0])}
                        className="block w-full text-sm text-cyan-100 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-950 hover:file:bg-cyan-300"
                      />
                      <button
                        type="button"
                        onClick={() => updateCertificate(index, "image", "")}
                        className="rounded-lg border border-red-300/30 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-400/10"
                      >
                        Remove Image
                      </button>
                    </div>
                    {certificate.image && (
                      isPdfSource(certificate.image) ? (
                        <iframe
                          src={certificate.image}
                          title={`${certificate.title} certificate preview`}
                          className="mt-4 aspect-video w-full rounded-lg border border-cyan-300/10 bg-slate-950"
                        />
                      ) : (
                        <img
                          src={certificate.image}
                          alt={`${certificate.title} certificate preview`}
                          className="mt-4 aspect-video w-full rounded-lg border border-cyan-300/10 object-contain"
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
