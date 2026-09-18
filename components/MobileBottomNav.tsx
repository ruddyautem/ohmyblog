"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";

const MobileBottomNavContent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, user } = useUser();
  const { openUserProfile, signOut } = useClerk();

  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  // Auto-focus search input when opening
  const toggleSearch = () => {
    setAccountMenuOpen(false);
    setSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 80);
      }
      return next;
    });
  };

  const toggleAccountMenu = () => {
    setSearchOpen(false);
    setAccountMenuOpen((prev) => !prev);
  };

  // Close overlays on outside click / tap
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        searchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target)
      ) {
        setSearchOpen(false);
      }
      if (
        accountMenuOpen &&
        accountMenuRef.current &&
        !accountMenuRef.current.contains(target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    if (searchOpen || accountMenuOpen) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
    }
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [searchOpen, accountMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push("/posts");
    } else {
      router.push(`/posts?search=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchOpen(false);
  };

  const isHomeActive = pathname === "/";
  const isPostsActive = pathname === "/posts" && !searchOpen;
  const isWriteActive = pathname === "/write";
  const isSearchActive = searchOpen || (pathname === "/posts" && !!searchParams.get("search"));

  return (
    <>
      {/* 1. Quick Search Sheet (Appears above the bottom bar) */}
      {searchOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 dark:bg-black/75 backdrop-blur-xs transition-opacity lg:hidden animate-in fade-in duration-150">
          <div
            ref={searchContainerRef}
            className="fixed inset-x-0 bottom-18 z-50 rounded-t-3xl border-t border-zinc-200/90 dark:border-slate-800 bg-white dark:bg-[#121826] p-5 shadow-2xl dark:shadow-[0_-8px_40px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-6 duration-200"
          >
            {/* Grabber indicator */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-200 dark:bg-slate-700" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                Recherche rapide
              </span>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#182032] hover:text-zinc-700 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Fermer la recherche"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center rounded-2xl bg-zinc-100 dark:bg-[#182032] p-1.5 ring-1 ring-zinc-200/80 dark:ring-slate-700 focus-within:bg-white dark:focus-within:bg-[#1e293b] focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-indigo-500 transition-all">
                <svg
                  className="ml-3 h-4 w-4 text-zinc-400 dark:text-slate-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un récit, astuce, thématique..."
                  className="w-full bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mr-1 rounded-full p-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-slate-300"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  className="rounded-xl bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-500 shrink-0 cursor-pointer"
                >
                  Chercher
                </button>
              </div>
            </form>

            {/* Quick Category Tags */}
            <div className="mt-4">
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-slate-500 block mb-2">Suggestions :</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "🌍 Voyages", cat: "voyages" },
                  { label: "🍳 Cuisine", cat: "cuisine" },
                  { label: "🐾 Animaux", cat: "animaux" },
                  { label: "💡 Astuces", cat: "astuces" },
                ].map((item) => (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => {
                      router.push(`/posts?cat=${item.cat}`);
                      setSearchOpen(false);
                    }}
                    className="rounded-xl border border-zinc-200 dark:border-slate-700/80 bg-zinc-50 dark:bg-[#182032] px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-slate-300 hover:bg-zinc-900 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white dark:hover:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quick Account Bottom Sheet (When signed in and user taps profile) */}
      {accountMenuOpen && isSignedIn && (
        <div className="fixed inset-0 z-40 bg-black/40 dark:bg-black/75 backdrop-blur-xs transition-opacity lg:hidden animate-in fade-in duration-150">
          <div
            ref={accountMenuRef}
            className="fixed inset-x-0 bottom-18 z-50 rounded-t-3xl border-t border-zinc-200/90 dark:border-slate-800 bg-white dark:bg-[#121826] p-5 shadow-2xl dark:shadow-[0_-8px_40px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-6 duration-200"
          >
            {/* Grabber indicator */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-200 dark:bg-slate-700" />

            {/* User Profile Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-100 dark:border-slate-800">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-2 ring-zinc-900/10 dark:ring-indigo-500/30 shadow-xs">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || user.username || "Avatar"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900 dark:bg-gradient-to-tr dark:from-indigo-600 dark:to-blue-600 text-sm font-bold text-white">
                    {user?.firstName?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                  {user?.fullName || user?.username || "Auteur OhMyBlog"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-slate-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAccountMenuOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#182032] hover:text-zinc-700 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Fermer le menu"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Account Actions */}
            <div className="flex flex-col gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  openUserProfile();
                }}
                className="flex items-center gap-3 w-full rounded-2xl p-3 text-left text-sm font-semibold text-zinc-800 dark:text-slate-200 hover:bg-zinc-100 dark:hover:bg-[#182032] transition-colors cursor-pointer"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-[#1e293b] text-base">
                  ⚙️
                </span>
                <div className="flex flex-col">
                  <span>Gérer mon profil</span>
                  <span className="text-[11px] font-normal text-zinc-400 dark:text-slate-500">
                    Paramètres du compte & sécurité
                  </span>
                </div>
              </button>

              <Link
                href="/write"
                onClick={() => setAccountMenuOpen(false)}
                className="flex items-center gap-3 w-full rounded-2xl p-3 text-left text-sm font-semibold text-zinc-800 dark:text-slate-200 hover:bg-zinc-100 dark:hover:bg-[#182032] transition-colors cursor-pointer"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-[#1e293b] text-base">
                  ✍️
                </span>
                <div className="flex flex-col">
                  <span>Rédiger un article</span>
                  <span className="text-[11px] font-normal text-zinc-400 dark:text-slate-500">
                    Ouvrir le studio d&apos;écriture
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-3 w-full rounded-2xl p-3 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer mt-1"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60 text-base">
                  🚪
                </span>
                <div className="flex flex-col">
                  <span>Se déconnecter</span>
                  <span className="text-[11px] font-normal text-red-400 dark:text-red-500">
                    Quitter la session en cours
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. The Main Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Navigation mobile principale"
        className="fixed bottom-0 inset-x-0 z-40 block lg:hidden border-t border-zinc-200/80 dark:border-slate-800/80 bg-white/92 dark:bg-[#0b0f17]/92 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.6)] transition-all"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {/* TAB 1: Accueil */}
          <Link
            href="/"
            className={`group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-150 active:scale-90 ${
              isHomeActive
                ? "text-zinc-950 dark:text-indigo-400 font-bold"
                : "text-zinc-400 dark:text-slate-500 hover:text-zinc-700 dark:hover:text-slate-300"
            }`}
          >
            <div className="relative">
              <svg
                className={`h-5 w-5 transition-transform duration-150 ${isHomeActive ? "scale-110" : ""}`}
                fill={isHomeActive ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isHomeActive ? 0 : 2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {isHomeActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-indigo-400" />
              )}
            </div>
            <span className="mt-1 text-[10px] tracking-tight">Accueil</span>
          </Link>

          {/* TAB 2: Explorer / Posts */}
          <Link
            href="/posts"
            className={`group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-150 active:scale-90 ${
              isPostsActive
                ? "text-zinc-950 dark:text-indigo-400 font-bold"
                : "text-zinc-400 dark:text-slate-500 hover:text-zinc-700 dark:hover:text-slate-300"
            }`}
          >
            <div className="relative">
              <svg
                className={`h-5 w-5 transition-transform duration-150 ${isPostsActive ? "scale-110" : ""}`}
                fill={isPostsActive ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isPostsActive ? 0 : 2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              {isPostsActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-indigo-400" />
              )}
            </div>
            <span className="mt-1 text-[10px] tracking-tight">Explorer</span>
          </Link>

          {/* TAB 3: CENTER HERO ACTION BUTTON - Écrire un post */}
          <div className="relative -top-3 flex flex-col items-center justify-center px-1">
            <Link
              href="/write"
              aria-label="Rédiger un nouvel article"
              className={`group flex h-13 w-13 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-gradient-to-tr dark:from-indigo-600 dark:to-blue-500 text-white shadow-lg dark:shadow-[0_0_24px_rgba(99,102,241,0.45)] ring-4 ring-white dark:ring-[#0b0f17] dark:border dark:border-indigo-400/40 transition-all duration-200 active:scale-90 hover:scale-105 hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-400 ${
                isWriteActive ? "ring-zinc-900/20 dark:ring-indigo-500/50" : ""
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-xl leading-none transition-transform group-hover:rotate-6">
                  ✍️
                </span>
              </div>
            </Link>
            <span
              className={`mt-1 text-[10px] tracking-tight ${
                isWriteActive ? "text-zinc-950 dark:text-indigo-400 font-extrabold" : "text-zinc-600 dark:text-slate-400 font-semibold"
              }`}
            >
              Écrire
            </span>
          </div>

          {/* TAB 4: Recherche instantanée */}
          <button
            type="button"
            onClick={toggleSearch}
            className={`group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-150 active:scale-90 cursor-pointer ${
              isSearchActive
                ? "text-zinc-950 dark:text-indigo-400 font-bold"
                : "text-zinc-400 dark:text-slate-500 hover:text-zinc-700 dark:hover:text-slate-300"
            }`}
          >
            <div className="relative">
              <svg
                className={`h-5 w-5 transition-transform duration-150 ${isSearchActive ? "scale-110" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isSearchActive ? 2.5 : 2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {isSearchActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-indigo-400" />
              )}
            </div>
            <span className="mt-1 text-[10px] tracking-tight">Recherche</span>
          </button>

          {/* TAB 5: Profil / Mon Compte */}
          {isSignedIn ? (
            <button
              type="button"
              onClick={toggleAccountMenu}
              className="group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-150 active:scale-90 cursor-pointer text-zinc-700 dark:text-slate-300"
            >
              <div className="relative">
                <div
                  className={`h-6 w-6 overflow-hidden rounded-full ring-2 transition-all ${
                    accountMenuOpen
                      ? "ring-zinc-900 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-[#0b0f17]"
                      : "ring-zinc-300 dark:ring-slate-700 group-hover:ring-zinc-600 dark:group-hover:ring-slate-500"
                  }`}
                >
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.fullName || "Profil"}
                      width={24}
                      height={24}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-900 dark:bg-gradient-to-tr dark:from-indigo-600 dark:to-blue-600 text-[10px] font-bold text-white">
                      {user?.firstName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                {/* Active green presence dot */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white dark:ring-[#0b0f17]" />
              </div>
              <span
                className={`mt-1 text-[10px] tracking-tight truncate max-w-14 ${
                  accountMenuOpen ? "font-bold text-zinc-950 dark:text-indigo-400" : "text-zinc-400 dark:text-slate-500"
                }`}
              >
                Compte
              </span>
            </button>
          ) : (
            <Link
              href="/sign-in"
              className={`group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-150 active:scale-90 ${
                pathname === "/sign-in" || pathname === "/sign-up"
                  ? "text-zinc-950 dark:text-indigo-400 font-bold"
                  : "text-zinc-400 dark:text-slate-500 hover:text-zinc-700 dark:hover:text-slate-300"
              }`}
            >
              <div className="relative">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="mt-1 text-[10px] tracking-tight">Connexion</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

const MobileBottomNav = () => {
  const pathname = usePathname();
  return (
    <Suspense fallback={null}>
      <MobileBottomNavContent key={pathname} />
    </Suspense>
  );
};

export default MobileBottomNav;
