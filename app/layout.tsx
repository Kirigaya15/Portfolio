import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CyberAuroraBackground from "@/components/CyberAuroraBackground";

export const metadata: Metadata = {
  title: "Portfolio | Front-End Developer",
  description:
    "Portfolio of a front-end developer focused on modern, responsive web interfaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CyberAuroraBackground />
        <Navbar />
        <main className="relative z-10 min-h-screen overflow-x-hidden px-4 pt-10 pb-12 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
