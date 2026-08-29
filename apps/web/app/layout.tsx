import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, APP_DISPLAY_NAME, BRAND_THEME_COLOR } from "../lib/tenant";
import { PwaClient } from "./pwa-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  // Served at /manifest.webmanifest by app/manifest.ts — makes the app
  // installable.
  manifest: "/manifest.webmanifest",
  // iOS home-screen chrome: installed app opens full-screen with the tenant
  // title (single binding) and the default (light) status-bar style.
  appleWebApp: {
    capable: true,
    title: APP_DISPLAY_NAME,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: BRAND_THEME_COLOR,
  // Content extends under notches / the dynamic island so the standalone app
  // fills the screen edge-to-edge.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PwaClient />
      </body>
    </html>
  );
}
