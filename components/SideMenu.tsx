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
      <div className='rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs'>
        <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400'>
          Rechercher
        </h3>
        <Search />
      </div>

      {/* Sort Filters Card */}
      <div className='rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs'>
        <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400'>
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
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all  cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className='text-xs'>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Card */}
      <div className='rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs'>
        <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 '>
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
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all  cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 text-white shadow-xs ring-1 ring-zinc-900"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
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
