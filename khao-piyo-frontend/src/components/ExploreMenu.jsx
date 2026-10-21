import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '../data/categories.js';
import Reveal from './Reveal.jsx';

const CategoryImage = ({ item, active }) => {
  const [ok, setOk] = useState(true);
  return (
    <span
      className={`grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-surface transition-all duration-300 sm:h-28 sm:w-28 ${
        active ? 'scale-105 ring-4 ring-brand' : 'ring-1 ring-line group-hover:scale-105'
      }`}
    >
      {ok ? (
        <img src={item.image} alt="" onError={() => setOk(false)} className="h-full w-full object-cover" />
      ) : (
        <span className="text-4xl sm:text-5xl" aria-hidden="true">{item.emoji}</span>
      )}
    </span>
  );
};

const ExploreMenu = ({ category, setCategory }) => {
  const rowRef = useRef(null);

  const scroll = (dir) =>
    rowRef.current?.scrollBy({ left: dir * rowRef.current.clientWidth * 0.7, behavior: 'smooth' });

  return (
    <section className="container-x pt-12" id="menu">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">What's on your mind?</h2>
            <p className="mt-1 text-muted">Pick a category to filter the dishes below.</p>
          </div>
          <div className="hidden gap-2 md:flex">
            <button onClick={() => scroll(-1)} className="btn btn-outline h-10 w-10 p-0!" aria-label="Scroll categories left">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scroll(1)} className="btn btn-outline h-10 w-10 p-0!" aria-label="Scroll categories right">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Reveal>

      <div
        ref={rowRef}
        className="no-scrollbar -mx-4 mt-6 flex snap-x gap-5 overflow-x-auto px-4 py-3 sm:-mx-6 sm:gap-7 sm:px-6 lg:mx-0 lg:px-0"
      >
        {categories.map((item) => {
          const active = category === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setCategory(active ? 'All' : item.name)}
              aria-pressed={active}
              className="group flex shrink-0 snap-start flex-col items-center gap-2 rounded-2xl active:scale-95 transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <CategoryImage item={item} active={active} />
              <span className={`text-sm font-medium ${active ? 'text-brand' : 'text-ink'}`}>{item.name}</span>
            </button>
          );
        })}
      </div>
      <hr className="mt-6 border-line" />
    </section>
  );
};

export default ExploreMenu;
