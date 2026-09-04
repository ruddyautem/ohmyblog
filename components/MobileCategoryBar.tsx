"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

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

const MobileCategoryBarContent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("cat") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentAuthor = searchParams.get("author") || "";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Close dropdown when tapping/clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Dynamic label for mobile dropdown trigger
  let mobileDropdownLabel = "Tous";
  if (pathname === "/posts" && !currentCat) {
    if (currentSort === "featured") mobileDropdownLabel = "Vedette";
    else if (currentSort === "popular") mobileDropdownLabel = "Populaires";
  }

  // Determine active category index in top bar (only among the 4 categories)
  let activeIndex = -1;
  if (pathname === "/posts" && currentCat) {
    const foundIdx = categoryLinks.findIndex((l) => l.cat === currentCat);
    if (foundIdx !== -1) activeIndex = foundIdx;
  }

  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    if (activeIndex >= 0 && linkRefs.current[activeIndex]) {
      const el = linkRefs.current[activeIndex];
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
  }, [activeIndex, pathname, currentCat, currentSort, currentSearch, currentAuthor]);

  // Dropdown inner sliding black pill state
  let dropdownActiveIndex = 0;
  if (currentSort === "featured") dropdownActiveIndex = 1;
  else if (currentSort === "popular") dropdownActiveIndex = 2;

  const dropdownLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [dropdownPillStyle, setDropdownPillStyle] = useState<{ top: number; height: number; opacity: number }>({
    top: 0,
    height: 0,
    opacity: 0,
  });

  useEffect(() => {
    if (dropdownOpen && dropdownActiveIndex >= 0 && dropdownLinkRefs.current[dropdownActiveIndex]) {
      const el = dropdownLinkRefs.current[dropdownActiveIndex];
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
  }, [dropdownOpen, dropdownActiveIndex, currentSort, pathname, currentCat]);

  return (
    <div className="block lg:hidden w-full mb-6">
      <div
        ref={containerRef}
        onMouseLeave={() => setDropdownOpen(false)}
        className="relative w-full max-w-md mx-auto"
      >
        <div className="relative flex items-center justify-between w-full rounded-full bg-zinc-100/90 p-1 border border-zinc-200/60 shadow-2xs">
          {/* Tous les posts Dropdown Trigger Button (Dynamic Label) */}
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={`cursor-pointer inline-flex items-center gap-1 justify-center rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 shrink-0 ${
              dropdownOpen || (pathname === "/posts" && !currentCat)
                ? "text-zinc-950 font-bold"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <span>{mobileDropdownLabel}</span>
            <svg
              className={`h-3 w-3 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Categories Bar with Solid Black Smooth Sliding Pill */}
          <nav className="relative flex items-center flex-1 justify-around gap-0.5 sm:gap-1">
            {/* Solid Black Smooth Sliding Pill */}
            <span
              className="pointer-events-none absolute top-0 bottom-0 rounded-full bg-zinc-900 shadow-xs transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${pillStyle.left}px)`,
                width: `${pillStyle.width}px`,
                opacity: pillStyle.opacity,
                left: 0,
              }}
            />

            {categoryLinks.map((link, idx) => {
              const isSelected = activeIndex === idx;

              return (
                <Link
                  key={link.label}
                  href={link.path}
                  ref={(el) => {
                    linkRefs.current[idx] = el;
                  }}
                  onClick={() => setDropdownOpen(false)}
                  className={`relative z-10 inline-flex items-center justify-center rounded-full px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                    isSelected
                      ? "text-white font-semibold"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dropdown Menu spanning almost full width on mobile */}
        {dropdownOpen && (
          <div className="absolute inset-x-0 top-full pt-2 z-40 origin-top transform transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">
            <div className="relative flex flex-col gap-1 rounded-2xl border border-zinc-200/90 bg-white/98 p-1.5 shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
              {/* Smooth Sliding Black Pill Indicator inside Dropdown */}
              <span
                className="pointer-events-none absolute left-1.5 right-1.5 rounded-xl bg-zinc-900 shadow-sm transition-all duration-200 ease-out"
                style={{
                  transform: `translateY(${dropdownPillStyle.top}px)`,
                  height: `${dropdownPillStyle.height}px`,
                  opacity: dropdownPillStyle.opacity,
                  top: 0,
                }}
              />

              {allPostsDropdownOptions.map((opt, idx) => {
                const isSelected = dropdownActiveIndex === idx;

                return (
                  <Link
                    key={opt.label}
                    href={opt.path}
                    ref={(el) => {
                      dropdownLinkRefs.current[idx] = el;
                    }}
                    className={`relative z-10 flex items-center justify-between rounded-xl px-4 py-2.5 transition-colors duration-150 ${
                      isSelected
                        ? "text-white font-semibold"
                        : "text-zinc-700 hover:text-zinc-950"
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs sm:text-sm font-semibold leading-snug">{opt.label}</span>
                      <span className={`text-[10px] sm:text-xs leading-tight mt-0.5 ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                        {opt.desc}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-white ml-2">✓</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MobileCategoryBar = () => {
  return (
    <Suspense fallback={<div className="block lg:hidden h-11 w-full mb-6 rounded-full bg-zinc-100 animate-pulse" />}>
      <MobileCategoryBarContent />
    </Suspense>
  );
};

export default MobileCategoryBar;
