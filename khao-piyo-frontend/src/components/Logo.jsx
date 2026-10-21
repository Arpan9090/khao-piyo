import React from 'react';
import { Link } from 'react-router-dom';

// Swap this for <img src="/logo.png" ... /> once your logo is ready.
const Logo = ({ className = '' }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Khao Piyo home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-lg text-white">🍴</span>
      <span className="font-display text-xl font-extrabold tracking-tight">
        Khao<span className="text-brand">Piyo</span>
      </span>
    </Link>
  );
};

export default Logo;
