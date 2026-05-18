import { VersionCheck } from "@/app/version-check";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
//import "@/app/globals.css";

import { Providers } from "@/app/providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SysLogistics",
  description: "Plataforma logística multiempresa",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="es"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
    >
      <body className="min-h-screen bg-white text-black">
        <VersionCheck />
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" duration={2000} closeButton />
      </body>
    </html>
  );
}
