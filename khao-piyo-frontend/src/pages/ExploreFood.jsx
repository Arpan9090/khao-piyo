import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import FoodDisplay from '../components/FoodDisplay.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { categories } from '../data/categories.js';

const selectClass =
  'h-11 w-full cursor-pointer appearance-none rounded-full border border-line bg-surface pl-5 pr-11 text-sm font-medium text-ink shadow-sm transition hover:border-brand/40 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15';

// The search bar here writes ?q= to the URL on every keystroke; the page reads it back.
const ExploreFood = () => {
  const [params, setParams] = useSearchParams();
  const { foods } = useStore();
  const [sort, setSort] = useState('');

  const query = params.get('q') || '';
  const category = params.get('category') || 'All';
  const term = query.trim();

  const setCategory = (value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== 'All') next.set('category', value);
        else next.delete('category');
        return next;
      },
      { replace: true }
    );

  const resultCount = useMemo(() => {
    const q = term.toLowerCase();
    return foods.filter(
      (f) =>
        (category === 'All' || f.category?.toLowerCase() === category.toLowerCase()) &&
        (!q || `${f.name} ${f.description} ${f.category}`.toLowerCase().includes(q))
    ).length;
  }, [foods, category, term]);

  return (
    <>
      <div className="container-x pt-10">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
          {term ? `Results for “${term}”` : 'Explore all food'}
        </h1>
        <p className="mt-1 text-muted">Search by dish name or filter by category.</p>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          {/* The only search bar on this page: live results + suggestions */}
          <SearchBar className="flex-1" />

          {/* Category dropdown */}
          <div className="relative md:w-56">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className={selectClass}
            >
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          </div>

          {/* Sort dropdown */}
          <div className="relative md:w-52">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort dishes"
              className={selectClass}
            >
              <option value="">Recommended</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          </div>
        </div>

        <p className="mt-4 text-sm text-muted" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'dish' : 'dishes'}
          {category !== 'All' && ` in ${category}`}
          {term && ` matching “${term}”`}
        </p>
      </div>

      <FoodDisplay category={category} query={query} sort={sort} layout="grid" />
    </>
  );
};

export default ExploreFood;