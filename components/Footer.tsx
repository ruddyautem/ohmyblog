import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-zinc-100 bg-white/60 py-10">
      <div className="mx-auto flex max-w-7xl 2xl:max-w-screen-2xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="OhMyBlog Logo"
            width={24}
            height={24}
            className="h-6 w-6 object-contain rounded-md"
          />
          <span className="text-sm font-bold tracking-tight text-zinc-900">
            OhMyBlog!
          </span>
        </div>

        <p className="text-xs text-zinc-500 text-center sm:text-right">
          © {currentYear} ohmyblog.autem.dev. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
