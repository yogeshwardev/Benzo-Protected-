import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://benzo.co.in"),
  title: {
    default: "BENZO - Live Technology Courses",
    template: "%s | BENZO"
  },
  description:
    "Live instructor-led technology courses with attendance, assignments, quizzes, chat support, payments, referrals, and verified certificates.",
  openGraph: {
    title: "BENZO - Live Technology Courses",
    description: "Practical coding courses with mentors, attendance, assignments, and verified certificates.",
    url: "https://benzo.co.in",
    siteName: "BENZO",
    type: "website",
    images: ["/images/benzo-learning-dashboard.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "BENZO - Live Technology Courses",
    description: "Practical coding courses with mentors, attendance, assignments, and verified certificates.",
    images: ["/images/benzo-learning-dashboard.png"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
