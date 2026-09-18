import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileCategoryBar from "@/components/MobileCategoryBar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { ReactQueryProvider } from "./ReactQueryProvider";
import AppToaster from "@/components/AppToaster";

import type { Metadata } from "next";
import { Montserrat } from 'next/font/google';
import { getBaseUrl } from "@/lib/site-url";

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ohmyblog! - Ruddy Autem",
    template: "%s | ohmyblog!",
  },
  description: "Un blog moderne, rapide et épuré propulsé par Next.js, React et PostgreSQL.",
  keywords: ["blog", "récits", "voyages", "cuisine", "animaux", "astuces", "nextjs", "react", "ruddy autem"],
  authors: [{ name: "Ruddy Autem", url: baseUrl }],
  creator: "Ruddy Autem",
  publisher: "Ruddy Autem",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "ohmyblog! - Ruddy Autem",
    description: "Un blog moderne, rapide et épuré propulsé par Next.js, React et PostgreSQL.",
    url: baseUrl,
    siteName: "ohmyblog!",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ohmyblog! - Ruddy Autem",
    description: "Un blog moderne, rapide et épuré propulsé par Next.js, React et PostgreSQL.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "OhMyBlog!",
  url: baseUrl,
  description: "Un blog moderne, rapide et épuré propulsé par Next.js, React et PostgreSQL.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/posts?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={frFR}>
      <html
        lang="fr"
        suppressHydrationWarning
        className={`${montserrat.variable} bg-white dark:bg-[#0b0f17] text-zinc-900 dark:text-slate-100 antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-indigo-500 dark:selection:text-white`}
      >
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
            }}
          />
        </head>
        <body className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#0b0f17] text-zinc-900 dark:text-slate-100 transition-colors duration-200">
          <ThemeProvider>
            <ReactQueryProvider>
              <Navbar />
              <main className="mx-auto w-full max-w-7xl 2xl:max-w-screen-2xl flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-8">
                <MobileCategoryBar />
                {children}
              </main>
              <Footer />
              <MobileBottomNav />
              <AppToaster />
            </ReactQueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}




