import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import JsonLd from "@/components/seo/JsonLd";
import BookingProvider from "@/components/booking/BookingProvider";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

/**
 * All three families are variable fonts, so we omit `weight` and let next/font
 * serve the variable file — one file per style covering the whole weight range,
 * instead of a static instance per weight.
 */
const display = Fraunces({
  subsets: ["latin"],
  variable: "--ff-display",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--ff-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--ff-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: {
    default: `${siteName} — Premium Travel Experiences Across India`,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "India tour packages",
    "Kashmir packages",
    "Manali packages",
    "Kerala backwaters",
    "Rajasthan tours",
    "group departures",
    "Himalayan treks",
    "Bundelkhand Pride Travels",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName,
    title: `${siteName} — Premium Travel Experiences Across India`,
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Premium Travel Across India`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bone text-ink-text">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <SmoothScroll />
        <BookingProvider>{children}</BookingProvider>
      </body>
    </html>
  );
}
