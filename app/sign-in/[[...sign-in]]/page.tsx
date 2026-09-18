"use client";

import { SignIn } from "@clerk/nextjs";
import { useTheme } from "@/components/ThemeProvider";
import { getClerkAppearance } from "@/lib/clerk-appearance";
import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  const { theme, mounted } = useTheme();
  const isDark = mounted ? theme === "dark" : false;

  return (
    <div className="relative flex flex-col items-center justify-center py-4 sm:py-8 lg:min-h-[calc(100vh-14rem)]">
      {/* Ambient background glow in dark mode */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="h-[360px] w-[360px] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-600/15" />
        <div className="h-[280px] w-[280px] -translate-y-16 translate-x-24 rounded-full bg-blue-500/10 blur-[90px] dark:bg-blue-600/10" />
      </div>

      {/* Brand Header */}
      <div className="mb-4 sm:mb-6 flex flex-col items-center text-center">
        <Link
          href="/"
          className="group mb-3 inline-flex items-center gap-2.5 transition-transform hover:scale-105"
        >
          <Image
            src="/logo.png"
            alt="OhMyBlog Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain dark:invert transition-all"
          />
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white sm:text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            OhMyBlog!
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
          Heureux de vous revoir
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400 sm:text-sm">
          Connectez-vous pour réagir et publier vos récits
        </p>
      </div>

      {/* Clerk SignIn with Modern Dark Mode */}
      <div className="flex w-full flex-col items-center justify-center px-2 sm:px-0">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
          appearance={getClerkAppearance(isDark)}
        />
        {/* Mount container for Clerk Smart Bot Protection / Turnstile captcha */}
        <div id="clerk-captcha" />
      </div>
    </div>
  );
}
