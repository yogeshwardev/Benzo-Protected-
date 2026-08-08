import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://benzo.co.in"),
  title: {
    default: "BENZO",
    template: "%s | BENZO"
  },
  description: "Affordable instructor-led technology courses for practical beginners.",
  openGraph: {
    title: "BENZO",
    description: "Live, practical technology courses with accountability.",
    url: "https://benzo.co.in",
    siteName: "BENZO",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "BENZO",
    description: "Affordable instructor-led technology courses for practical beginners."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

