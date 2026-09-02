import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
            <main className="mx-auto w-full max-w-[1440px] 2xl:max-w-[1560px] flex-1 px-4 sm:px-6 lg:px-10 py-8">
              {children}
            </main>
            <Footer />
            <ToastContainer position="bottom-right" autoClose={3000} />
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}




