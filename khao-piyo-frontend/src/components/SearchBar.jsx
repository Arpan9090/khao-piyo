import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/format.js';

// Bolds the part of the text that matches what the user typed
const Highlight = ({ text = '', term }) => {
  const i = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-bold text-brand">{text.slice(i, i + term.length)}</mark>
      {text.slice(i + term.length)}
    </>
  );
};

// The single search bar of the site (lives in the Navbar).
//  - On /explore: every keystroke filters the dishes live (via the ?q= URL param)
//  - Everywhere: shows dish suggestions; clicking one opens its details page
const SearchBar = ({ className = '', onDone }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const { foods } = useStore();
  const listId = useId();

  const onExplore = pathname === '/explore';
  const urlQuery = onExplore ? params.get('q') || '' : '';
  const category = onExplore ? params.get('category') || 'All' : 'All';

  const [term, setTerm] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);
  const pushed = useRef(urlQuery); // last value this bar wrote to the URL

  // Pick up changes made elsewhere (e.g. "Clear search" button, links with ?q=)
  useEffect(() => {
    if (urlQuery !== pushed.current) {
      pushed.current = urlQuery;
      setTerm(urlQuery);
    }
  }, [urlQuery]);

  // Reset the box when moving to another page
  useEffect(() => {
    pushed.current = urlQuery;
    setTerm(urlQuery);
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const trimmed = term.trim();

  const suggestions = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (!q) return [];
    return foods
      .filter(
        (f) =>
          (category === 'All' || f.category?.toLowerCase() === category.toLowerCase()) &&
          `${f.name} ${f.category}`.toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q))
      )
      .slice(0, 6);
  }, [foods, category, trimmed]);

  // Writes ?q= into the URL while keeping other params (like category)
  const pushQuery = (value) => {
    pushed.current = value;
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set('q', value);
        else next.delete('q');
        return next;
      },
      { replace: true }
    );
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setTerm(value);
    setActive(-1);
    setOpen(true);
    if (onExplore) pushQuery(value); // live filtering on the explore page
  };

  const handleClear = () => {
    setTerm('');
    setActive(-1);
    setOpen(false);
    if (onExplore) pushQuery('');
  };

  const goToFood = (food) => {
    setOpen(false);
    setTerm('');
    navigate(`/food/${food.id}`);
    onDone?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    if (onExplore) pushQuery(trimmed);
    else navigate(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : '/explore');
    onDone?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      goToFood(suggestions[active]);
    }
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} role="search" className="group relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-brand" />
        <input
          type="text"
          enterKeyHint="search"
          value={term}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for biryani, pizza, momos…"
          aria-label="Search food"
          role="combobox"
          aria-expanded={open && trimmed.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          className="h-11 w-full rounded-full border border-line bg-bg pl-11 pr-20 text-sm text-ink transition placeholder:text-muted focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/15"
        />
        {term && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-11 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink active:scale-90"
          >
            <X className="size-4" />
          </button>
        )}
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-linear-to-r from-brand to-brand-2 text-white shadow-md shadow-brand/30 transition hover:scale-105 active:scale-90"
        >
          <ArrowRight className="size-4" />
        </button>
      </form>

      {open && trimmed && (
        <div
          id={listId}
          role="listbox"
          className="animate-slide-down absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-ink/15"
        >
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map((f, i) => (
                <li key={f.id} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // keep input focus until the click lands
                    onClick={() => goToFood(f)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      i === active ? 'bg-brand/10' : 'hover:bg-ink/5'
                    }`}
                  >
                    <img src={f.imageUrl} alt="" className="size-11 shrink-0 rounded-lg bg-ink/5 object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        <Highlight text={f.name} term={trimmed} />
                      </span>
                      <span className="block truncate text-xs text-muted">{f.category}</span>
                    </span>
                    <span className="text-sm font-bold">{formatPrice(f.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-muted">
              No dishes match “{trimmed}”
              {category !== 'All' && ` in ${category}`}.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;