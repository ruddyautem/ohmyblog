import { Link, useSearchParams, useNavigate } from "react-router";
import Search from "./Search";

const SideMenu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleFilterChange = (e) => {
    if (searchParams.get("sort") !== e.target.value) {
      setSearchParams({
        ...Object.fromEntries(searchParams.entries()),
        sort: e.target.value,
      });
    }
  };

  const handleCategoryChange = (category) => {
    if (category === "general") {
      navigate("/posts");
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("cat", category);
      navigate(`/posts?${newParams.toString()}`);
    }
  };

  return (
    <div className="sticky top-8 h-max px-4">
      <h1 className="mb-4 text-sm font-medium">Rechercher</h1>
      <Search />
      <h1 className="mt-8 mb-4 text-sm font-medium">Filtres</h1>
      <div className="flex flex-col text-sm">
        <label htmlFor="" className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="sort"
            onChange={handleFilterChange}
            value="newest"
            className="h-4 w-4 cursor-pointer appearance-none border-[1.5px] border-black bg-white checked:bg-black"
          />
          Plus Récent
        </label>
        <label htmlFor="" className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="sort"
            onChange={handleFilterChange}
            value="oldest"
            className="h-4 w-4 cursor-pointer appearance-none border-[1.5px] border-black bg-white checked:bg-black"
          />
          Plus Ancien
        </label>
        <label htmlFor="" className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="sort"
            onChange={handleFilterChange}
            value="popular"
            className="h-4 w-4 cursor-pointer appearance-none border-[1.5px] border-black bg-white checked:bg-black"
          />
          Plus Visité
        </label>
        <label htmlFor="" className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="sort"
            onChange={handleFilterChange}
            value="trending"
            className="h-4 w-4 cursor-pointer appearance-none border-[1.5px] border-black bg-white checked:bg-black"
          />
          En Vedette
        </label>
      </div>
      <h1 className="mt-8 mb-4 text-sm font-medium">Categories</h1>
      <div className="flex flex-col gap-2 text-sm">
        <span
          className="cursor-pointer underline"
          onClick={() => handleCategoryChange("general")}
        >
          Général
        </span>
        <span
          className="cursor-pointer underline"
          onClick={() => handleCategoryChange("voyages")}
        >
          Voyages
        </span>
        <span
          className="cursor-pointer underline"
          onClick={() => handleCategoryChange("cuisine")}
        >
          Cuisine
        </span>
        <span
          className="cursor-pointer underline"
          onClick={() => handleCategoryChange("animaux")}
        >
          Animaux
        </span>
        <span
          className="cursor-pointer underline"
          onClick={() => handleCategoryChange("astuces")}
        >
          Astuces
        </span>
      </div>
    </div>
  );
};

export default SideMenu;