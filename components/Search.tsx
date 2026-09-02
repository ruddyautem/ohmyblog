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
    <div className="flex h-10 max-h-10 w-56 items-center justify-center gap-2 rounded bg-gray-100 px-2 placeholder:text-center focus-within:outline-2 focus-within:outline-black">
      <Image src="/search.svg" alt="Search" width={16} height={16} />
      <input
        type="text"
        placeholder="Chercher un post..."
        className="w-full bg-transparent outline-none placeholder:text-center"
        onKeyDown={handleKeyPress}
      />
    </div>
  );
};

export default Search;


