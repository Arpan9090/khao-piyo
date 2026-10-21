import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, LogOut } from 'lucide-react';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import SearchBar from './SearchBar.jsx';
import UserMenu from './UserMenu.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/contact', label: 'Contact us' },
];

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
    isActive ? 'bg-brand/10 text-brand' : 'text-muted hover:bg-ink/5 hover:text-ink'
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useStore();
  const { user, isAuthenticated, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navLinks = isAuthenticated ? [...links, { to: '/orders', label: 'My orders' }] : links;

  // The Explore page has its own search bar, so the navbar one is hidden there
  const showSearch = pathname !== '/explore';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-line bg-surface/80 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-ink/5' : ''
      }`}
    >
      <div className="container-x flex h-18 items-center gap-3 lg:gap-6">
        <Logo className="shrink-0" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {showSearch && <SearchBar className="ml-auto hidden max-w-lg flex-1 lg:block" />}

        <div className={`ml-auto flex items-center gap-2 ${showSearch ? 'lg:ml-0' : ''}`}>
          <ThemeToggle />

          <Link to="/cart" className="icon-btn" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 animate-pop place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white ring-2 ring-surface"
              >
                {cartCount}
              </span>
            )}
          </Link>

          <span className="mx-1 hidden h-6 w-px bg-line lg:block" aria-hidden="true" />

          {isAuthenticated ? (
            <UserMenu onLogout={handleLogout} className="hidden lg:block" />
          ) : (
            <>
              <Link to="/login" className="btn btn-outline hidden lg:inline-flex">Sign in</Link>
              <Link to="/register" className="btn btn-primary hidden lg:inline-flex">Sign up</Link>
            </>
          )}

          <button
            className="icon-btn lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-slide-down border-t border-line bg-surface lg:hidden">
          <div className="container-x flex flex-col gap-4 py-4">
            {showSearch && <SearchBar onDone={() => setOpen(false)} />}
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      isActive ? 'bg-brand/10 text-brand' : 'text-ink hover:bg-ink/5'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 rounded-2xl border border-line p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand to-brand-2 font-bold uppercase text-white">
                  {user.displayName.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{user.displayName}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="btn btn-outline px-4 py-2">
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setOpen(false)} className="btn btn-outline py-3">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn btn-primary py-3">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;