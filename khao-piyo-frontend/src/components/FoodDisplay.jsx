import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import FoodItem from './FoodItem.jsx';
import Reveal from './Reveal.jsx';
import useDragScroll from '../hooks/useDragScroll.js';

const sorters = {
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

const Skeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="aspect-4/3 animate-pulse bg-ink/10" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-2/3 animate-pulse rounded bg-ink/10" />
        <div className="h-3 w-full animate-pulse rounded bg-ink/10" />
        <div className="h-7 w-1/2 animate-pulse rounded bg-ink/10" />
      </div>
    </div>
  );
};

// layout="scroll" -> one horizontal, draggable, auto-scrolling row (Home)
// layout="grid"   -> normal wrapping grid (Explore / search results)
const FoodDisplay = ({ category = 'All', query = '', sort = '', title, limit, layout = 'scroll' }) => {
  const { foods, loading, error, refetch } = useStore();
  const { ref, scrollByDir } = useDragScroll({ speed: 28 });
  const isScroll = layout === 'scroll';

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = foods.filter((f) => {
      const inCategory = !category || category === 'All' || f.category?.toLowerCase() === category.toLowerCase();
      const matches = !q || `${f.name} ${f.description} ${f.category}`.toLowerCase().includes(q);
      return inCategory && matches;
    });
    if (sorters[sort]) result = [...result].sort(sorters[sort]);
    return limit ? result.slice(0, limit) : result;
  }, [foods, category, query, sort, limit]);

  const showList = !loading && !error && list.length > 0;

  const wrapperClass = isScroll
    ? 'no-scrollbar -mx-4 flex cursor-grab select-none gap-4 overflow-x-auto px-4 pb-6 pt-3 active:cursor-grabbing sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8'
    : 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
  const cellClass = isScroll ? 'w-56 shrink-0 sm:w-60' : 'h-full';

  const row = (
    <div ref={isScroll ? ref : undefined} className={wrapperClass}>
      {loading
        ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={cellClass}><Skeleton /></div>
          ))
        : list.map((food, i) =>
            isScroll ? (
              <div key={food.id} className={cellClass}>
                <FoodItem food={food} />
              </div>
            ) : (
              <Reveal key={food.id} delay={(i % 5) * 70} className={cellClass}>
                <FoodItem food={food} />
              </Reveal>
            )
          )}
    </div>
  );

  return (
    <section className="container-x py-10" id="foods">
      {(title || (isScroll && showList)) && (
        <Reveal>
          <div className="mb-3 flex items-end justify-between gap-4">
            {title ? <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2> : <span />}
            {isScroll && showList && (
              <div className="hidden gap-2 md:flex">
                <button onClick={() => scrollByDir(-1)} className="icon-btn" aria-label="Scroll dishes left">
                  <ChevronLeft className="size-5" />
                </button>
                <button onClick={() => scrollByDir(1)} className="icon-btn" aria-label="Scroll dishes right">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {(loading || showList) && (isScroll ? <Reveal>{row}</Reveal> : row)}

      {!loading && error && (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="text-muted">{error}</p>
          <button onClick={refetch} className="btn btn-primary mt-4">Try again</button>
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="font-display text-lg font-bold">No dishes found</p>
          <p className="mt-1 text-muted">Try a different category or search term.</p>
        </div>
      )}
    </section>
  );
};

export default FoodDisplay;