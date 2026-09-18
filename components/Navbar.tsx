"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import Search from "./Search";
import Image from "next/image";
import { ThemeToggle, useTheme } from "./ThemeProvider";
import { dark } from "@clerk/themes";

const categoryLinks = [
  { label: "Voyages", path: "/posts?cat=voyages", cat: "voyages" },
  { label: "Cuisine", path: "/posts?cat=cuisine", cat: "cuisine" },
  { label: "Animaux", path: "/posts?cat=animaux", cat: "animaux" },
  { label: "Astuces", path: "/posts?cat=astuces", cat: "astuces" },
];

const allPostsDropdownOptions = [
  { label: "Tous les posts", path: "/posts", desc: "Toutes les publications", sort: "" },
  { label: "En vedette", path: "/posts?sort=featured", desc: "Sélection coups de cœur", sort: "featured" },
  { label: "Populaires", path: "/posts?sort=popular", desc: "Les plus consultés", sort: "popular" },
];

const NavSelectorsContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("cat") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentAuthor = searchParams.get("author") || "";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Determine active category index in top bar (only among the 4 categories)
  let activeIndex = -1;
  if (pathname === "/posts" && currentCat) {
    const foundIdx = categoryLinks.findIndex((l) => l.cat === currentCat);
    if (foundIdx !== -1) activeIndex = foundIdx;
  }

  // Top pill hover state (only for the 4 categories)
  const [topHoverIndex, setTopHoverIndex] = useState<number | null>(null);
  const targetIndex = topHoverIndex !== null ? topHoverIndex : activeIndex;

  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    if (targetIndex >= 0 && linkRefs.current[targetIndex]) {
      const el = linkRefs.current[targetIndex];
      if (el) {
        setPillStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1,
        });
      }
    } else {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [targetIndex, pathname, currentCat, currentSort, currentSearch, currentAuthor]);

  // Dropdown inner sliding black pill state (defaults to 0 "Tous les posts")
  let dropdownActiveIndex = 0;
  if (currentSort === "featured") dropdownActiveIndex = 1;
  else if (currentSort === "popular") dropdownActiveIndex = 2;

  const [dropdownHoverIndex, setDropdownHoverIndex] = useState<number | null>(null);
  const targetDropdownIndex = dropdownHoverIndex !== null ? dropdownHoverIndex : dropdownActiveIndex;

  const dropdownLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [dropdownPillStyle, setDropdownPillStyle] = useState<{ top: number; height: number; opacity: number }>({
    top: 0,
    height: 0,
    opacity: 0,
  });

  useEffect(() => {
    if (dropdownOpen && targetDropdownIndex >= 0 && dropdownLinkRefs.current[targetDropdownIndex]) {
      const el = dropdownLinkRefs.current[targetDropdownIndex];
      if (el) {
        setDropdownPillStyle({
          top: el.offsetTop,
          height: el.offsetHeight,
          opacity: 1,
        });
      }
    } else {
      setDropdownPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [dropdownOpen, targetDropdownIndex, currentSort, pathname, currentCat]);

  const openDropdown = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setDropdownOpen(true);
  };

  const closeDropdown = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  // Dynamic label for dropdown trigger
  let dropdownTriggerLabel = "Tous les posts";
  if (pathname === "/posts" && !currentCat) {
    if (currentSort === "featured") dropdownTriggerLabel = "En vedette";
    else if (currentSort === "popular") dropdownTriggerLabel = "Populaires";
  }

  const handleTopMouseEnter = (idx: number, path: string) => {
    setTopHoverIndex(idx);
    closeDropdown();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    // Trigger live preview navigation on hover with a lightweight 120ms debounce
    hoverTimeoutRef.current = setTimeout(() => {
      router.push(path);
    }, 120);
  };

  const handleTopMouseLeave = () => {
    setTopHoverIndex(null);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <div
      className='relative flex items-center'
      onMouseLeave={() => {
        handleTopMouseLeave();
        closeDropdown();
      }}
    >
      <div className='relative flex items-center rounded-full bg-zinc-100/90 dark:bg-[#121826] p-1 border border-zinc-200/60 dark:border-slate-800 shadow-2xs'>
        {/* Tous les posts Dropdown Trigger Button (No pill on top hover, dynamic label) */}
        <button
          type='button'
          onMouseEnter={openDropdown}
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          className={`cursor-pointer inline-flex items-center gap-1.5 justify-center rounded-full px-3.5 py-1.5 text-xs lg:text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
            dropdownOpen || (pathname === "/posts" && !currentCat)
              ? "text-zinc-950 dark:text-white font-semibold"
              : "text-zinc-600 dark:text-slate-400 hover:text-zinc-950 dark:hover:text-white"
          }`}
        >
          <span>{dropdownTriggerLabel}</span>
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Categories Bar with Solid Smooth Sliding Pill */}
        <nav
          onMouseLeave={handleTopMouseLeave}
          className='relative flex items-center'
        >
          {/* Solid Smooth Sliding Pill for the 4 Categories */}
          <span
            className='pointer-events-none absolute top-0 bottom-0 rounded-full bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 shadow-xs dark:shadow-[0_0_14px_rgba(99,102,241,0.4)] transition-all duration-300 ease-out'
            style={{
              transform: `translateX(${pillStyle.left}px)`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity,
              left: 0,
            }}
          />

          {categoryLinks.map((link, idx) => {
            const isTargeted = targetIndex === idx;

            return (
              <Link
                key={link.label}
                href={link.path}
                ref={(el) => {
                  linkRefs.current[idx] = el;
                }}
                onMouseEnter={() => handleTopMouseEnter(idx, link.path)}
                className={`relative z-10 inline-flex items-center gap-1.5 justify-center rounded-full px-3.5 py-1.5 text-xs lg:text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  isTargeted
                    ? "text-white font-semibold"
                    : "text-zinc-600 dark:text-slate-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Dropdown Menu with Slide-down Animation and Inner Sliding Pill */}
      {dropdownOpen && (
        <div
          onMouseEnter={openDropdown}
          onMouseLeave={closeDropdown}
          className='absolute left-0 top-full pt-1.5 w-60 z-50 origin-top transform transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2'
        >
          <div
            onMouseLeave={() => setDropdownHoverIndex(null)}
            className='relative flex flex-col gap-1 rounded-2xl border border-zinc-200/90 dark:border-slate-800 bg-white/98 dark:bg-[#121826]/95 p-1.5 shadow-2xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] ring-1 ring-black/5 dark:ring-slate-700/50 backdrop-blur-md'
          >
            {/* Smooth Sliding Pill Indicator inside Dropdown */}
            <span
              className='pointer-events-none absolute left-1.5 right-1.5 rounded-xl bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 shadow-sm dark:shadow-[0_0_12px_rgba(99,102,241,0.35)] transition-all duration-200 ease-out'
              style={{
                transform: `translateY(${dropdownPillStyle.top}px)`,
                height: `${dropdownPillStyle.height}px`,
                opacity: dropdownPillStyle.opacity,
                top: 0,
              }}
            />

            {allPostsDropdownOptions.map((opt, idx) => {
              const isTargeted = targetDropdownIndex === idx;

              return (
                <Link
                  key={opt.label}
                  href={opt.path}
                  ref={(el) => {
                    dropdownLinkRefs.current[idx] = el;
                  }}
                  onMouseEnter={() => setDropdownHoverIndex(idx)}
                  onClick={() => {
                    setTopHoverIndex(null);
                  }}
                  className={`relative z-10 flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors duration-150 ${
                    isTargeted
                      ? "text-white font-semibold"
                      : "text-zinc-700 dark:text-slate-300 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  <div className='flex flex-col text-left'>
                    <span className='text-sm font-semibold leading-snug'>{opt.label}</span>
                    <span className={`text-[11px] leading-tight mt-0.5 ${isTargeted ? "text-indigo-100" : "text-zinc-400 dark:text-slate-400"}`}>
                      {opt.desc}
                    </span>
                  </div>
                  {isTargeted && (
                    <span className='text-xs font-bold text-white ml-2'>✓</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const NavSelectors = () => {
  return (
    <Suspense fallback={<div className="h-8 w-80 rounded-full bg-zinc-100 animate-pulse"></div>}>
      <NavSelectorsContent />
    </Suspense>
  );
};

const MobileNavSelectorsContent = ({ setOpen }: { setOpen: (v: boolean) => void }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("cat") || "";
  const currentSort = searchParams.get("sort") || "";

  const mobileLinks = [
    { label: "Tous les posts", path: "/posts", active: pathname === "/posts" && !currentCat && !currentSort },
    { label: "En vedette", path: "/posts?sort=featured", active: pathname === "/posts" && currentSort === "featured" },
    { label: "Populaires", path: "/posts?sort=popular", active: pathname === "/posts" && currentSort === "popular" },
    { label: "Voyages", path: "/posts?cat=voyages", active: currentCat === "voyages" },
    { label: "Cuisine", path: "/posts?cat=cuisine", active: currentCat === "cuisine" },
    { label: "Animaux", path: "/posts?cat=animaux", active: currentCat === "animaux" },
    { label: "Astuces", path: "/posts?cat=astuces", active: currentCat === "astuces" },
  ];

  return (
    <nav className='flex flex-col gap-2 pt-4'>
      {mobileLinks.map((link) => (
        <Link
          key={link.label}
          href={link.path}
          onClick={() => setOpen(false)}
          className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
            link.active
              ? "bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 text-white font-semibold shadow-xs"
              : "bg-zinc-50 dark:bg-[#121826] text-zinc-800 dark:text-slate-200 hover:bg-zinc-100 dark:hover:bg-[#182032] border border-transparent dark:border-slate-800/60"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

const MobileNavSelectors = ({ setOpen }: { setOpen: (v: boolean) => void }) => {
  return (
    <Suspense fallback={<div className="h-40 rounded-xl bg-zinc-100 dark:bg-[#121826] animate-pulse"></div>}>
      <MobileNavSelectorsContent setOpen={setOpen} />
    </Suspense>
  );
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const { theme } = useTheme();

  return (
    <header className='sticky top-0 z-50 w-full border-b border-zinc-100 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b0f17]/85 backdrop-blur-md transition-all'>
      <div className='mx-auto flex h-16 md:h-20 max-w-7xl 2xl:max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4'>
        {/* Logo - pure original with dark:invert */}
        <Link
          href='/'
          className='group flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90 shrink-0'
        >
          <Image
            src='/logo.png'
            alt='OhMyBlog Logo'
            width={36}
            height={36}
            className='h-9 w-9 object-contain dark:invert transition-all'
          />
          <span className='text-xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-2xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'>
            OhMyBlog!
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className='hidden items-center gap-3 lg:flex'>
          <Suspense fallback='...'>
            <Search />
          </Suspense>

          <NavSelectors />

          <ThemeToggle />

          {/* Modern Dark Write Button with Glowing Badge */}
          <Link
            href='/write'
            className='group inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:via-indigo-500 dark:to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-500 dark:shadow-[0_0_22px_rgba(99,102,241,0.45)] dark:border dark:border-indigo-400/30 hover:scale-[1.02] active:scale-[0.98] shrink-0'
          >
            <span className='flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 dark:bg-white/20 text-xs shadow-inner dark:shadow-[0_0_10px_rgba(255,255,255,0.25)] transition-transform group-hover:rotate-12'>✍️</span>
            <span>Écrire</span>
          </Link>

          {!isSignedIn ? (
            <Link
              href='/sign-in'
              className='shrink-0 inline-flex items-center justify-center rounded-full border border-zinc-300 dark:border-slate-700 bg-transparent dark:bg-[#121826] px-4 py-2 text-sm font-medium text-zinc-800 dark:text-slate-200 transition-all hover:border-zinc-900 dark:hover:border-indigo-500 hover:bg-zinc-900 dark:hover:bg-indigo-600 hover:text-white cursor-pointer'
            >
              Se connecter
            </Link>
          ) : (
            <div className='ml-1 flex items-center shrink-0'>
              <UserButton
                appearance={{
                  theme: theme === "dark" ? dark : undefined,
                  variables: theme === "dark" ? {
                    colorBackground: "#121826",
                    colorForeground: "#f8fafc",
                    colorMutedForeground: "#94a3b8",
                  } : undefined,
                  elements: {
                    userButtonAvatarBox:
                      "h-9 w-9 !rounded-lg ring-1 ring-zinc-200 dark:ring-slate-700",
                    avatarImage: "!rounded-lg",
                    avatarBox: "!rounded-lg",
                    userButtonPopoverCard:
                      "border border-zinc-200 dark:border-slate-800 bg-white dark:bg-[#121826] shadow-xl",
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Mobile Menu Actions */}
        <div className='flex items-center gap-2.5 lg:hidden'>
          <ThemeToggle />

          <button
            type='button'
            className='cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-[#121826] text-zinc-700 dark:text-slate-300 transition-colors hover:bg-zinc-100 dark:hover:bg-[#182032]'
            onClick={() => setOpen((prev) => !prev)}
            aria-label='Toggle menu'
            aria-expanded={open}
          >
            <Image
              width={20}
              height={20}
              src={open ? "/close.svg" : "/burger.svg"}
              alt={open ? "Fermer" : "Menu"}
              className='h-5 w-5 object-contain dark:invert'
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className='fixed inset-x-0 top-16 z-50 flex h-[calc(100vh-4rem)] flex-col justify-between border-t border-zinc-100 dark:border-slate-800 bg-white dark:bg-[#0b0f17] p-6 lg:hidden animate-in fade-in slide-in-from-top-4 duration-200'>
          <div className='flex flex-col gap-4'>
            <Suspense fallback='...'>
              <Search onSubmit={() => setOpen(false)} />
            </Suspense>

            <MobileNavSelectors setOpen={setOpen} />
          </div>

          <div className='pt-6 border-t border-zinc-100 dark:border-slate-800'>
            {!isSignedIn ? (
              <Link href='/sign-in' onClick={() => setOpen(false)}>
                <button className='w-full rounded-xl bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-500 shadow-sm cursor-pointer'>
                  Se connecter
                </button>
              </Link>
            ) : (
              <div className='flex flex-col gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    setOpen(false);
                    openUserProfile();
                  }}
                  className='flex w-full items-center justify-center rounded-xl bg-zinc-900 dark:bg-[#182032] border border-transparent dark:border-slate-700 px-4 py-3 text-base font-semibold text-white dark:text-slate-200 transition-colors shadow-sm text-center cursor-pointer hover:dark:bg-[#1e293b]'
                >
                  <span>Gérer mon compte</span>
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className='w-full rounded-xl bg-red-500 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-red-600 cursor-pointer'
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
