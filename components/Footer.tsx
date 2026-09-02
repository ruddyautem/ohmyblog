const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 py-8 border-t border-gray-200 flex items-center justify-center text-xs md:text-sm text-gray-500">
      <p>© {currentYear} ohmyblog.autem.dev. Tous droits réservés.</p>
    </footer>
  );
};

export default Footer;
