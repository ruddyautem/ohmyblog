import { Link } from "react-router";
import Search from "./Search";

const MainCategories = () => {
  return (
    <div className="hidden items-stretch justify-center gap-8 rounded border border-gray-300 bg-white p-4 text-xs md:flex xl:text-base">
      {/* LINKS */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {[
          { to: "/posts", label: "Tous Les Posts", primary: true },
          { to: "/posts?cat=voyages", label: "Voyages" },
          { to: "/posts?cat=cuisine", label: "Cuisine" },
          { to: "/posts?cat=animaux", label: "Animaux" },
          { to: "/posts?cat=astuces", label: "Astuces" },
        ].map(({ to, label, primary }) => (
          <Link
            key={label}
            to={to}
            className={`rounded px-4 py-2 whitespace-nowrap ${
              primary
                ? "bg-black text-white hover:bg-gray-700"
                : "bg-gray-100 hover:bg-black hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Divider */}
      {/* <div className="my-2 h-full w-px bg-black" /> */}
      <div className="flex flex-row gap-2">
        <Link
          to="/write"
          className="flex h-10 max-h-10 w-56 cursor-pointer items-center justify-center gap-2 rounded bg-black px-2 text-white placeholder:text-center focus-within:outline-2 focus-within:outline-black"
        >
          Ecrire un post
        </Link>
      </div>
    </div>
  );
};

export default MainCategories;
