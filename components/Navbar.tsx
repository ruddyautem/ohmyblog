"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import Search from "./Search";
import Image from "next/image";

const links = [
  { label: "Tous les Posts", path: "/posts" },
  { label: "Les Plus Visités", path: "/posts?sort=popular" },
  { label: "Posts Vedettes", path: "/posts?sort=featured" },
];

interface NavLinkProps {
  label: string;
  path: string;
  onClick?: () => void;
  className?: string;
}

const NavLink = ({ label, path, onClick, className = "" }: NavLinkProps) => (
  <Link
    href={path}
    onClick={onClick}
    className={`flex h-10 max-w-56 items-center justify-center rounded bg-gray-100 text-center hover:bg-black hover:text-white ${className}`}
  >
    {label}
  </Link>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { openUserProfile, signOut } = useClerk();

  return (
    <div className='flex h-16 w-full items-center justify-between md:h-20'>
      {/* Logo */}
      <Link
        href='/'
        className='mr-10 flex cursor-pointer items-center gap-3.5 text-xl md:text-2xl font-bold'
      >
        <Image
          src='/logo.png'
          alt='OhMyBlog Logo'
          width={34}
          height={34}
          className='w-8 h-8 md:w-[34px] md:h-[34px] object-contain'
        />
        <span>OhMyBlog!</span>
      </Link>

      {/* Mobile Menu Toggle */}
      <div className='lg:hidden'>
        <div
          className='cursor-pointer text-4xl'
          onClick={() => setOpen((prev) => !prev)}
        >
          <Image width={30} height={30}
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
          <Suspense fallback='...'>
            <Search onSubmit={() => setOpen(false)} />
          </Suspense>
          {links.map((link) => (
            <NavLink
              key={link.label}
              label={link.label}
              path={link.path}
              onClick={() => setOpen(false)}
              className='w-56'
            />
          ))}
          {!isSignedIn ? (
            <Link href='/sign-in' onClick={() => setOpen(false)}>
              <button className='h-10 w-56 cursor-pointer rounded bg-black text-white transition-all duration-200 ease-in-out hover:scale-105'>
                Login
              </button>
            </Link>
          ) : (
            <div className='flex flex-col gap-3'>
              <button
                type='button'
                onClick={() => {
                  setOpen(false);
                  openUserProfile();
                }}
                className='flex h-10 w-56 cursor-pointer items-center justify-center rounded border border-black text-white bg-black text-sm font-medium transition-all duration-200'
              >
                <span>Compte</span>
                
              </button>
              <button
                type='button'
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className='flex h-10 w-56 cursor-pointer items-center justify-center rounded border text-white text-sm font-medium bg-red-500 transition-all duration-200'
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Menu */}
      <div className='hidden items-center gap-4 text-xs font-medium lg:flex xl:gap-4'>
        <Suspense fallback='...'>
          <Search />
        </Suspense>
        {links.map((link) => (
          <NavLink
            key={link.label}
            label={link.label}
            path={link.path}
            className='h-10 w-36'
          />
        ))}

        {!isSignedIn ? (
          <Link href='/sign-in'>
            <button className='h-10 w-36 cursor-pointer rounded bg-black text-white transition-all duration-200 ease-in-out hover:scale-105'>
              Login
            </button>
          </Link>
        ) : (
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "!rounded-none",
                avatarImage: "!rounded-none",
                avatarBox: "!rounded-none",
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Navbar;
