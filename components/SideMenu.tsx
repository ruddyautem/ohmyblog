"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Search from "./Search";

const sortOptions = [
  { label: "Plus Récent", value: "newest" },
  { label: "Plus Ancien", value: "oldest" },
  { label: "Plus Visité", value: "popular" },
  { label: "En Vedette", value: "trending" },
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (searchParams.get("sort") !== e.target.value) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("sort", e.target.value);
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
    <div className="sticky top-8 h-max px-4">
      <h1 className="mb-4 text-sm font-medium">Rechercher</h1>
      <Search />
      <h1 className="mt-8 mb-4 text-sm font-medium">Filtres</h1>
      <div className="flex flex-col text-sm">
        {sortOptions.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="sort"
              onChange={handleFilterChange}
              value={opt.value}
              checked={currentSort === opt.value}
              className="h-4 w-4 cursor-pointer appearance-none border-[1.5px] border-black bg-white checked:bg-black"
            />
            {opt.label}
          </label>
        ))}
      </div>
      <h1 className="mt-8 mb-4 text-sm font-medium">Categories</h1>
      <div className="flex flex-col gap-2 text-sm">
        {categoryOptions.map((cat) => (
          <span
            key={cat.value}
            className="cursor-pointer underline"
            onClick={() => handleCategoryChange(cat.value)}
          >
            {cat.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SideMenu;

