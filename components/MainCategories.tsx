"use client";
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

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-2 sm:p-2.5 backdrop-blur-sm">
      {/* Category Pills */}
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {categoryLinks.map(({ to, label, cat }) => {
          const isActive = currentCat === cat;
          return (
            <Link
              key={label}
              href={to}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-900"
                  : "bg-white text-zinc-700 hover:bg-zinc-900 hover:text-white border border-zinc-200/60 shadow-xs"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MainCategories;
