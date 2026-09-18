"use client";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export interface SearchProps {
  onSubmit?: () => void;
  className?: string;
  placeholder?: string;
}

const Search = ({ onSubmit, className = "", placeholder = "Rechercher..." }: SearchProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = e.currentTarget.value.trim();
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }

      if (pathname === "/posts") {
        router.push(`/posts?${params.toString()}`);
      } else {
        router.push(`/posts?search=${encodeURIComponent(query)}`);
      }

      if (onSubmit) {
        onSubmit();
      }
    }
  };

  const containerClasses = className
    ? `relative flex items-center rounded-full bg-zinc-100/90 dark:bg-[#121826] border border-transparent dark:border-slate-800 px-3.5 text-sm text-zinc-900 dark:text-white transition-all focus-within:bg-white dark:focus-within:bg-[#182032] focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-indigo-500/40 focus-within:shadow-sm ${className}`
    : "relative flex h-9.5 w-full lg:w-52 items-center rounded-full bg-zinc-100/90 dark:bg-[#121826] border border-transparent dark:border-slate-800 px-3 text-sm text-zinc-900 dark:text-white transition-all focus-within:bg-white dark:focus-within:bg-[#182032] focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-indigo-500/40 focus-within:shadow-sm";

  return (
    <div className={containerClasses}>
      <Image
        src="/search.svg"
        alt="Search"
        width={15}
        height={15}
        className="opacity-45 mr-2.5 flex-shrink-0 dark:invert"
      />
      <input
        type="text"
        name="search"
        aria-label="Rechercher des articles"
        placeholder={placeholder}
        defaultValue={searchParams.get("search") || ""}
        className="w-full bg-transparent text-xs sm:text-sm text-zinc-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none"
        onKeyDown={handleKeyPress}
      />
    </div>
  );
};

export default Search;
