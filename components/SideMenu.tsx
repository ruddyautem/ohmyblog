"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Search from "./Search";

const sortOptions = [
  { label: "Plus Récent", value: "newest" },
  { label: "Plus Ancien", value: "oldest" },
  { label: "Plus Visité", value: "popular" },
  { label: "En Vedette", value: "featured" },
];

const categoryOptions = [
  { label: "Général", value: "general" },
  { label: "Voyages", value: "voyages" },
  { label: "Cuisine", value: "cuisine" },
  { label: "Animaux", value: "animaux" },
  { label: "Astuces", value: "astuces" },
];

const SideMenu = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSort = searchParams.get("sort") || "newest";
  const currentCat = searchParams.get("cat") || "general";

  const handleFilterChange = (val: string) => {
    if (currentSort !== val) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("sort", val);
      router.push(`/posts?${newParams.toString()}`);
    }
  };

  const handleCategoryChange = (category: string) => {
    if (category === "general") {
      router.push("/posts");
    } else {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("cat", category);
      router.push(`/posts?${newParams.toString()}`);
    }
  };

  return (
    <aside className='sticky top-24 space-y-6'>
      {/* Search Card */}
      <div className='rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] p-5 shadow-xs'>
        <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500'>
          Rechercher
        </h3>
        <Search className="w-full h-9.5" />
      </div>

      {/* Sort Filters Card */}
      <div className='rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] p-5 shadow-xs'>
        <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500'>
          Trier par
        </h3>
        <div className='flex flex-col gap-1.5'>
          {sortOptions.map((opt) => {
            const isSelected = currentSort === opt.value;
            return (
              <button
                key={opt.value}
                type='button'
                onClick={() => handleFilterChange(opt.value)}
                aria-pressed={isSelected}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-[#182032] hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className='text-xs font-bold'>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Card */}
      <div className='rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] p-5 shadow-xs'>
        <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500'>
          Catégories
        </h3>
        <div className='flex flex-wrap gap-2'>
          {categoryOptions.map((cat) => {
            const isSelected =
              currentCat === cat.value ||
              (cat.value === "general" && !searchParams.get("cat"));
            return (
              <button
                key={cat.value}
                type='button'
                onClick={() => handleCategoryChange(cat.value)}
                aria-pressed={isSelected}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 text-white shadow-xs ring-1 ring-zinc-900 dark:ring-indigo-500/50"
                    : "bg-zinc-100 dark:bg-[#182032] text-zinc-700 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-[#1e293b] hover:text-zinc-900 dark:hover:text-white border border-transparent dark:border-slate-800/60"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default SideMenu;
