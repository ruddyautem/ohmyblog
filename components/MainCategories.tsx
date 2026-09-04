"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const categoryLinks = [
  { to: "/posts", label: "Tous les posts", cat: "" },
  { to: "/posts?cat=voyages", label: "🌍 Voyages", cat: "voyages" },
  { to: "/posts?cat=cuisine", label: "🍳 Cuisine", cat: "cuisine" },
  { to: "/posts?cat=animaux", label: "🐾 Animaux", cat: "animaux" },
  { to: "/posts?cat=astuces", label: "💡 Astuces", cat: "astuces" },
];

const MainCategories = () => {
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("cat") || "";
  const currentSort = searchParams.get("sort") || "";

  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Find active category index
  let activeIndex = 0; // Default to "Tous les posts"
  if (currentCat) {
    const foundIdx = categoryLinks.findIndex((c) => c.cat === currentCat);
    if (foundIdx !== -1) activeIndex = foundIdx;
  } else if (currentSort) {
    activeIndex = -1; // No category selected when sorting popular/featured
  }

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const targetIndex = hoverIndex !== null ? hoverIndex : activeIndex;

  const [pillStyle, setPillStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({
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
  }, [targetIndex, currentCat, currentSort]);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-white p-2.5 sm:p-3 shadow-xs flex items-center justify-center overflow-x-auto max-w-full scrollbar-none">
      {/* Category Pills Bar with Smooth Slide */}
      <nav
        onMouseLeave={() => setHoverIndex(null)}
        className="relative inline-flex items-center rounded-full bg-zinc-100/90 p-1 border border-zinc-200/60 shadow-2xs"
      >
        {/* Smooth Sliding Pill Indicator */}
        <span
          className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-zinc-900 shadow-xs transition-all duration-300 ease-out"
          style={{
            transform: `translateX(${pillStyle.left}px)`,
            width: `${pillStyle.width}px`,
            opacity: pillStyle.opacity,
            left: 0,
          }}
        />

        {categoryLinks.map(({ to, label }, idx) => {
          const isTargeted = targetIndex === idx;

          return (
            <Link
              key={label}
              href={to}
              ref={(el) => {
                linkRefs.current[idx] = el;
              }}
              onMouseEnter={() => setHoverIndex(idx)}
              className={`relative z-10 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                isTargeted
                  ? "text-white font-semibold"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MainCategories;
