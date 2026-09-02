import { useLocation, useNavigate, useSearchParams } from "react-router";
import SearchIcon from "/search.svg";

const Search = ({ onSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const query = e.target.value;
      if (location.pathname === "/posts") {
        setSearchParams({ ...Object.fromEntries(searchParams), search: query });
      } else {
        navigate(`/posts?search=${query}`);
      }
      if (onSubmit) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex h-10 max-h-10 w-56 items-center justify-center gap-2 rounded bg-gray-100 px-2 placeholder:text-center focus-within:outline-2 focus-within:outline-black">
      <img src={SearchIcon} alt="" />
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
