import type { Metadata } from "next";
import { Inter, Geist_Mono, Newsreader } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StarfieldBackground } from "@/components/StarfieldBackground";

/**
 * Inter — the humanist geometric sans-serif used throughout Claude's interface
 * and UC Berkeley's digital brand. Variable-weight, excellent screen rendering.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">{`
(() => {
  try {
    const key = "theme";
    const stored = localStorage.getItem(key);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (stored === "light" || stored === "dark") {
      root.classList.add(stored);
      return;
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    if (prefersDark) root.classList.add("dark");
  } catch {}
})();
        `}</Script>
        <StarfieldBackground />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
