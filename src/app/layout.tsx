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
    url: "https://dearadeline.vercel.app",
  },
};

import { createClient } from "@/lib/supabase/server";
import { Providers } from "@/components/Providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'theme')
    .maybeSingle();

  const theme = settings?.value as any || {
    primaryColor: '#87A878',
    fontSize: '16px'
  };

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --sage: ${theme.primaryColor};
            --sage-dark: ${theme.primaryColor}; /* Simplification for now */
            --font-size-base: ${theme.fontSize};
          }
          body {
            font-size: var(--font-size-base);
          }
        `}} />
      </head>
      <body
        className={`${outfit.variable} ${inter.variable} ${dancingScript.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
