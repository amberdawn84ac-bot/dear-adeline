import type { Metadata } from "next";
import { Outfit, Inter, Dancing_Script } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dear Adeline | Personalized AI-Powered Learning",
  description: "A student-led learning platform where AI adapts to your interests, tracks skills toward graduation, and helps you build a meaningful portfolio. Perfect for homeschool families.",
  keywords: ["homeschool", "AI learning", "personalized education", "Oklahoma curriculum", "portfolio", "graduation tracker"],
  openGraph: {
    title: "Dear Adeline | Personalized AI-Powered Learning",
    description: "Where every student's journey is uniquely their own.",
    type: "website",
    url: "https://dearadeline.co",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} ${dancingScript.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
