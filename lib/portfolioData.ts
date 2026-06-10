export type PortfolioProject = {
  title: string;
  description: string;
  theme: string;
  tags: string[];
  url: string;
  image?: string;
};

export type PortfolioCertificate = {
  title: string;
  issuer: string;
  date: string;
  url: string;
  image?: string;
};

export type PortfolioData = {
  fontFamily: string;
  hero: {
    intro: string;
    highlight: string;
    description: string;
    profileImage: string;
  };
  about: {
    paragraphOne: string;
    paragraphTwo: string;
  };
  contact: {
    email: string;
    facebookUrl: string;
    resumeUrl: string;
  };
  projects: PortfolioProject[];
  certificates: PortfolioCertificate[];
};

export const portfolioStorageKey = "portfolio-admin-data";
export const portfolioApiPath = "/api/portfolio";

export const defaultPortfolioData: PortfolioData = {
  fontFamily: "Inter",
  hero: {
    intro: "Hi, I'm",
    highlight: "a Developer",
    description:
      "I build beautiful, responsive, and high-performance web applications using modern technologies.",
    profileImage: "/profile.png",
  },
  about: {
    paragraphOne:
      "Hi! I'm a 23-year-old Front-End Developer passionate about modern design, smooth interactions, and responsive user interfaces. I focus mainly on front-end development but also understand basic back-end concepts.",
    paragraphTwo:
      "I've worked with React Native, React JS, Next.js, TypeScript, and JavaScript, and I have photo and video editing skills that add a creative touch to my work. I'm adaptable, detail-oriented, and always eager to learn new frameworks and programming languages to grow in the tech industry.",
  },
  contact: {
    email: "marclaurence.moralde@hcdc.edu.ph",
    facebookUrl: "https://www.facebook.com/travismarc15",
    resumeUrl: "/Moralde-CV.pdf",
  },
  projects: [
    {
      title: "Kenshane Store",
      description: "An online store project with a login page and e-commerce style user flow.",
      theme: "store",
      tags: ["PHP", "Web Store", "Login System"],
      url: "https://kenshanestore.42web.io/login.php",
      image: "/kenshane-store-preview.svg",
    },
    {
      title: "VeriHire",
      description:
        "A real or fake job prediction web app that helps users check job posting credibility.",
      theme: "verihire",
      tags: ["AI Detection", "React", "UX Research"],
      url: "https://verihire.onrender.com/",
      image: "/verihire-preview.svg",
    },
  ],
  certificates: [
    {
      title: "Udemy Certificate - UC 0392b919",
      issuer: "Udemy",
      date: "",
      url: "/certificates/uc-0392b919.pdf",
      image: "/certificates/uc-0392b919.pdf",
    },
    {
      title: "Udemy Certificate - UC 29a191fd",
      issuer: "Udemy",
      date: "",
      url: "/certificates/uc-29a191fd.pdf",
      image: "/certificates/uc-29a191fd.pdf",
    },
    {
      title: "Certificate 7398561",
      issuer: "Certificate",
      date: "",
      url: "/certificates/certificate-7398561.pdf",
      image: "/certificates/certificate-7398561.pdf",
    },
    {
      title: "Certificate 10296666",
      issuer: "Certificate",
      date: "",
      url: "/certificates/certificate-10296666.pdf",
      image: "/certificates/certificate-10296666.pdf",
    },
    {
      title: "Certificate 10300960",
      issuer: "Certificate",
      date: "",
      url: "/certificates/certificate-10300960.pdf",
      image: "/certificates/certificate-10300960.pdf",
    },
    {
      title: "Introduction to Cybersecurity",
      issuer: "Cisco Networking Academy",
      date: "",
      url: "/certificates/introduction-to-cybersecurity.pdf",
      image: "/certificates/introduction-to-cybersecurity.pdf",
    },
    {
      title: "Python Essentials 1",
      issuer: "Cisco Networking Academy",
      date: "",
      url: "/certificates/python-essentials-1.pdf",
      image: "/certificates/python-essentials-1.pdf",
    },
  ],
};

export function normalizePortfolioData(data: Partial<PortfolioData> = {}): PortfolioData {
  return {
    ...defaultPortfolioData,
    ...data,
    hero: {
      ...defaultPortfolioData.hero,
      ...(data.hero ?? {}),
      profileImage: data.hero?.profileImage || defaultPortfolioData.hero.profileImage,
    },
    about: {
      ...defaultPortfolioData.about,
      ...(data.about ?? {}),
    },
    contact: {
      ...defaultPortfolioData.contact,
      ...(data.contact ?? {}),
    },
    projects: Array.isArray(data.projects) ? data.projects : defaultPortfolioData.projects,
    certificates: Array.isArray(data.certificates)
      ? data.certificates
      : defaultPortfolioData.certificates,
  };
}

export function loadPortfolioData(): PortfolioData {
  if (typeof window === "undefined") {
    return defaultPortfolioData;
  }

  const savedData = window.localStorage.getItem(portfolioStorageKey);
  if (!savedData) {
    return defaultPortfolioData;
  }

  try {
    const parsedData = JSON.parse(savedData) as Partial<PortfolioData>;
    return normalizePortfolioData(parsedData);
  } catch {
    return defaultPortfolioData;
  }
}

export async function loadPortfolioDataFromDatabase(): Promise<PortfolioData> {
  const response = await fetch(portfolioApiPath, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load portfolio database.");
  }

  return normalizePortfolioData((await response.json()) as Partial<PortfolioData>);
}

export async function savePortfolioDataToDatabase(data: PortfolioData): Promise<PortfolioData> {
  const response = await fetch(portfolioApiPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizePortfolioData(data)),
  });

  if (!response.ok) {
    throw new Error("Unable to save portfolio database.");
  }

  const result = (await response.json()) as { data?: Partial<PortfolioData> };
  return normalizePortfolioData(result.data ?? data);
}
