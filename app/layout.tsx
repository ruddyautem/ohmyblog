import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { Toaster } from "sonner";

import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata = {
  title: "ohmyblog! - Ruddy Autem",
  description: "A fast, SEO-friendly blog built with Next.js",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr" className={`${montserrat.variable} bg-white text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white`}>
        <body className="min-h-screen flex flex-col justify-between">
          <ReactQueryProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-7xl 2xl:max-w-screen-2xl flex-1 px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
            <Toaster position="bottom-right" richColors closeButton />
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}




