import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "GradGT | Georgia Tech Course Planner & Registration Guide",
  description: "An interactive tool to plan your Georgia Tech academic journey. Visualize course prerequisites, track requirements, and optimize your graduation path.",
  keywords: ["Georgia Tech", "course planner", "GT courses", "degree requirements", "computer science", "engineering", "prerequisites", "academic planning", "college courses", "graduation requirements"],
  creator: "Georgia Tech Students",
  authors: [{ name: "GradGT Team" }],
  metadataBase: new URL("https://gradgt.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gradgt.vercel.app",
    title: "GradGT | Georgia Tech Course Planner",
    description: "Interactive visualization of GT course requirements and prerequisites to help you plan your perfect academic journey",
    siteName: "GradGT",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GradGT - Georgia Tech Course Planner"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "GradGT | Georgia Tech Course Planner",
    description: "Plan your Georgia Tech academic journey visually",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: '/Georgia Tech Yellow Jackets Logo.png',
    apple: '/Georgia Tech Yellow Jackets Logo.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://gradgt.vercel.app" />
        <JsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
