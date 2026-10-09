import { VersionCheck } from "@/app/version-check";
import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Providers } from "@/app/providers";
import Script from "next/script";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

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
    const mode = localStorage.getItem("agiliza-theme") || "dark";
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
        h-full
        antialiased
      `}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground">
        <Script id="theme-initialization" strategy="beforeInteractive">
          {themeInitializationScript}
        </Script>
        <VersionCheck />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
