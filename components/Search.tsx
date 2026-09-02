"use client";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const Search = ({ onSubmit }: { onSubmit?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = e.currentTarget.value;
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set('search', query);
      } else {
        params.delete('search');
      }

      if (pathname === "/posts") {
        router.push(`/posts?${params.toString()}`);
      } else {
        router.push(`/posts?search=${query}`);
      }
      
      if (onSubmit) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative flex h-9.5 w-full lg:w-52 items-center rounded-full bg-zinc-100/90 px-3 text-sm text-zinc-900 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:shadow-sm">
      <Image src="/search.svg" alt="Search" width={14} height={14} className="opacity-45 mr-2 flex-shrink-0" />
      <input
        type="text"
        placeholder="Rechercher..."
        defaultValue={searchParams.get("search") || ""}
        className="w-full bg-transparent text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
        onKeyDown={handleKeyPress}
      />
    </div>
  );
};

export default Search;


