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
      <html lang="en" className={`${montserrat.variable} bg-[#ffffff] w-screen overflow-x-hidden font-display`}>
        <body>
          <ReactQueryProvider>
            <div className="flex min-h-screen flex-col justify-between px-4 md:px-8 lg:px-16 lx:px-32 2xl:px-64">
              <div>
                <Navbar />
                {children}
              </div>
              <Footer />
            </div>
            <ToastContainer position="bottom-right" />
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}




