import type { Metadata, Viewport } from "next";
import { Sora, DM_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

const heading = Sora({ variable: "--font-heading", subsets: ["latin"], display: "swap", weight: ["600", "700", "800"] });
const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const mono = Fira_Code({ variable: "--font-mono", subsets: ["latin"], display: "swap", weight: ["400", "500"] });

const SITE = "Orbit Library";
const DESC =
  "A library of interactive study pages: animated lessons, quizzes, interview practice and revision sheets for backend, data and architecture topics, each with its sources and version.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${SITE}: interactive study pages`, template: `%s | ${SITE}` },
  description: DESC,
  applicationName: SITE,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE, title: SITE, description: DESC },
  twitter: { card: "summary", title: SITE, description: DESC },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

/** Runs before first paint: night is the default; a saved choice wins. */
const THEME_SCRIPT = `try{var t=localStorage.getItem("orbit-theme");if(t!=="light")document.documentElement.classList.add("dark")}catch(e){document.documentElement.classList.add("dark")}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="o-skip">Skip to content</a>
        <div className="o-progress" aria-hidden="true" />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <noscript>
          <p className="o-page o-muted">Orbit Library works best with JavaScript on. The lessons themselves need it.</p>
        </noscript>
      </body>
    </html>
  );
}
