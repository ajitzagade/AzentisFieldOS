import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { currentBranding } from "../lib/current-branding";
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const branding = await currentBranding();

  // Deliberate AD-4 carve-out (same exception BrandingForm's own preview
  // panel documents): BrandingConfig's three brand colors are runtime tenant
  // data, not design-token literals, so they're applied here as a CSS
  // custom-property override rather than hardcoded anywhere in component
  // code. This must sit on <html> — not on some inner wrapper div further
  // down the tree — because several shared components (Dialog, Toast,
  // Combobox, Popover; see packages/ui's Base UI usage) render their content
  // through a React portal straight to document.body, which is a sibling of
  // this element in the real DOM, not a descendant of any div nested inside
  // it; only an override this high in the tree reaches them too.
  //
  // --accent-teal-700 and --gold-500 each carry a separately-tuned .dark
  // value in theme.css (brighter, for contrast against dark surfaces); an
  // inline style always wins the cascade over a class-based rule, so this
  // applies the tenant's exact hex in both themes and intentionally forgoes
  // that dark-mode tuning — BrandingConfig models one color per role, not a
  // light/dark pair. --accent-navy-800 has no .dark variant to begin with
  // (the sidebar is deliberately navy in both themes), so it's unaffected.
  const brandingStyle = {
    "--accent-teal-700": branding.primaryColor,
    "--accent-navy-800": branding.secondaryColor,
    "--gold-500": branding.accentColor,
  } as CSSProperties;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={brandingStyle}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PwaClient />
      </body>
    </html>
  );
}
