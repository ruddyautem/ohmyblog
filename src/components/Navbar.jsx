import { useEffect, useState } from "react";
import Image from "./Image";
import { Link } from "react-router";
import { SignedIn, SignedOut, useAuth, UserButton } from "@clerk/clerk-react";
import Search from "./Search";

const links = [
  { label: "Tous les Posts", path: "/posts" },
  { label: "Les Plus Visités", path: "/posts?sort=popular" },
  { label: "Posts Vedettes", path: "/posts?sort=featured" },
];

const NavLink = ({ label, path, onClick, className = "" }) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex h-10 max-w-56 items-center justify-center rounded bg-gray-100 text-center hover:bg-black hover:text-white ${className}`}
  >
    {label}
  </Link>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    getToken().then((token) => console.log(token));
  }, [getToken]);

  return (
    <div className="flex h-16 w-full items-center justify-between md:h-20">
      {/* Logo */}
      <Link
        to="/"
        className="mr-10 flex cursor-pointer items-center gap-4 text-2xl font-bold"
      >
        <Image src="logo.png" alt="OhMyBlog Logo" w={32} h={32} />
        <span>OhMyBlog!</span>
      </Link>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden">
        <div
          className="cursor-pointer text-4xl"
          onClick={() => setOpen((prev) => !prev)}
        >
          <img
            src={open ? "/close.svg" : "/burger.svg"}
            alt={open ? "Close Menu" : "Open Menu"}
          />
        </div>

        {/* Mobile Menu */}
        <div
          className={`absolute top-16 z-50 flex h-screen w-full flex-col items-center justify-center gap-8 bg-white text-lg font-medium transition-all duration-300 ease-in-out ${
            open ? "left-0" : "left-full"
          }`}
        >
          <Search onSubmit={() => setOpen(false)} />
          {links.map((link) => (
            <NavLink
              key={link.label}
              label={link.label}
              path={link.path}
              onClick={() => setOpen(false)}
              className="w-56"
            />
          ))}
          <Link to="/login" onClick={() => setOpen(false)}>
            <button className="h-10 w-56 cursor-pointer rounded bg-black text-white transition-all duration-200 ease-in-out hover:scale-105">
              Login
            </button>
          </Link>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden items-center gap-4 text-xs font-medium lg:flex xl:gap-4">
        <Search />
        {links.map((link) => (
          <NavLink
            key={link.label}
            label={link.label}
            path={link.path}
            className="h-10 w-36"
          />
        ))}

        <SignedOut>
          <Link to="/login">
            <button className="h-10 w-36 cursor-pointer rounded bg-black text-white transition-all duration-200 ease-in-out hover:scale-105">
              Login
            </button>
          </Link>
        </SignedOut>

        <SignedIn asChild>
          <UserButton className="ring-4" />
        </SignedIn>
      </div>
    </div>
  );
};

export default Navbar;
