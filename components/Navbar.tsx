"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import Search from "./Search";
import Image from "next/image";

const links = [
  { label: "Tous les posts", path: "/posts" },
  { label: "Populaires", path: "/posts?sort=popular" },
  { label: "En vedette", path: "/posts?sort=featured" },
];

const NavSelectors = () => {
  const [hoverStyle, setHoverStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    setHoverStyle({
      left: target.offsetLeft,
      width: target.offsetWidth,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setHoverStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <nav
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center rounded-full bg-zinc-100/90 p-1 border border-zinc-200/60"
    >
      {/* Sliding Pill Background Indicator */}
      <span
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-zinc-900 shadow-xs transition-all duration-300 ease-out"
        style={{
          transform: `translateX(${hoverStyle.left}px)`,
          width: `${hoverStyle.width}px`,
          opacity: hoverStyle.opacity,
          left: 0,
        }}
      />

      {links.map((link) => (
        <Link
          key={link.label}
          href={link.path}
          onMouseEnter={handleMouseEnter}
          className="relative z-10 inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:text-white"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { openUserProfile, signOut } = useClerk();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl 2xl:max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="relative overflow-hidden rounded-lg shadow-sm ring-1 ring-zinc-900/10">
            <Image
              src="/logo.png"
              alt="OhMyBlog Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
            OhMyBlog!
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-3 lg:flex">
          <Suspense fallback="...">
            <Search />
          </Suspense>

          <NavSelectors />

          <Link
            href="/write"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md"
          >
            <span>✍️ Écrire</span>
          </Link>

          {!isSignedIn ? (
            <Link href="/sign-in">
              <button className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition-all hover:border-zinc-900 hover:bg-zinc-900 hover:text-white">
                Se connecter
              </button>
            </Link>
          ) : (
            <div className="ml-1 flex items-center">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9 !rounded-lg ring-1 ring-zinc-200",
                    avatarImage: "!rounded-lg",
                    avatarBox: "!rounded-lg",
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-100"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <Image
              width={20}
              height={20}
              src={open ? "/close.svg" : "/burger.svg"}
              alt={open ? "Fermer" : "Menu"}
              className="h-5 w-5 object-contain"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="fixed inset-x-0 top-16 z-50 flex h-[calc(100vh-4rem)] flex-col justify-between border-t border-zinc-100 bg-white p-6 lg:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4">
            <Suspense fallback="...">
              <Search onSubmit={() => setOpen(false)} />
            </Suspense>

            <nav className="flex flex-col gap-2 pt-4">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.path}
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-zinc-50 px-4 py-3 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-100"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-zinc-100">
            {!isSignedIn ? (
              <Link href="/sign-in" onClick={() => setOpen(false)}>
                <button className="w-full rounded-xl bg-zinc-900 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-zinc-800 shadow-sm">
                  Se connecter
                </button>
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openUserProfile();
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-zinc-900 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-800 shadow-sm"
                >
                  <span>Gérer mon compte</span>
                  <span className="text-xs text-zinc-300">⚙️</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="w-full rounded-xl border border-red-300 bg-red-50 py-3 text-center text-base font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
