import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="container-x flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted sm:flex-row">
        <Logo />
        <nav className="flex gap-6" aria-label="Footer">
          <Link to="/explore" className="hover:text-ink">Explore</Link>
          <Link to="/contact" className="hover:text-ink">Contact us</Link>
          <Link to="/cart" className="hover:text-ink">Cart</Link>
        </nav>
        <p>© {new Date().getFullYear()} Khao Piyo</p>
      </div>
    </footer>
  );
};

export default Footer;
