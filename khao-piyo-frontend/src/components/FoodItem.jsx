import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/format.js';

const FoodItem = ({ food }) => {
  const { cart, addToCart, decreaseFromCart } = useStore();
  const qty = cart[food.id] || 0;

  // Buttons sit inside a <Link>, so stop the click from navigating.
  const act = (fn) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  return (
    <Link
      to={`/food/${food.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-ink/5">
        <img
          src={food.imageUrl}
          alt={food.name}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {food.category && (
          <span className="absolute left-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
            {food.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-1 font-display text-base font-bold leading-snug">{food.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{food.description}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold">{formatPrice(food.price)}</span>

          {qty === 0 ? (
            <button
              onClick={act(() => addToCart(food.id))}
              className="btn btn-primary px-3.5 py-1.5 text-xs"
              aria-label={`Add ${food.name} to cart`}
            >
              <Plus className="size-3.5" /> Add
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-brand/10 p-1">
              <button
                onClick={act(() => decreaseFromCart(food.id))}
                className="grid size-7 place-items-center rounded-full bg-surface text-brand shadow-sm transition active:scale-90"
                aria-label="Remove one"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-bold" aria-live="polite">{qty}</span>
              <button
                onClick={act(() => addToCart(food.id))}
                className="grid size-7 place-items-center rounded-full bg-brand text-white shadow-sm transition active:scale-90"
                aria-label="Add one more"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default FoodItem;