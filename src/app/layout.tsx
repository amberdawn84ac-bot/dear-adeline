import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { Providers } from "@/components/Providers";
import { FloatingActionBar } from "@/components/FloatingActionBar";

export const metadata: Metadata = {
  title: "Dear Adeline | Personalized AI-Powered Learning",
  description: "A student-led learning platform where AI adapts to your interests, tracks skills toward graduation, and helps you build a meaningful portfolio. Perfect for homeschool families.",
  keywords: ["homeschool", "AI learning", "personalized education", "Oklahoma curriculum", "portfolio", "graduation tracker"],
  openGraph: {
    title: "Dear Adeline | Personalized AI-Powered Learning",
    description: "Where every student's journey is uniquely their own.",
    type: "website",
    url: "http://localhost:3000",
  },
};

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

  const themeData = settings?.value as any || {};
  const theme = {
    primaryColor: themeData.primaryColor || '#2F4731', // Default to Forest Green
    fontSize: themeData.fontSize || '16px'
  };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Fredoka:wght@400;500;600;700&family=Comic+Neue:wght@400;700&family=Patrick+Hand&family=Caveat:wght@4400;700&family=Architects+Daughter&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --forest: ${theme.primaryColor};
            --font-size-base: ${theme.fontSize};
          }
          body {
            font-size: var(--font-size-base);
            background-color: var(--cream);
          }
        `}} />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <FloatingActionBar />
      </body>
    </html>
  );
}
