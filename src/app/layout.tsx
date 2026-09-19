import { VersionCheck } from "@/app/version-check";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Agiliza",
    template: "%s | Agiliza",
  },

  description: "Plataforma logística multiempresa",

  manifest: "/manifest.json?v=3",

  icons: {
    icon: [
      {
        url: "/icons/agiliza-icon-192-v3.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/agiliza-icon-512-v3.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/icons/agiliza-apple-touch-icon-v3.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],

    shortcut: "/icons/agiliza-icon-192-v3.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const themeInitializationScript = `(() => {
  try {
    const mode = localStorage.getItem("agiliza-theme") || "light";
    const isDark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.dataset.theme = mode;
  } catch {}
})();`;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="es"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <VersionCheck />

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
