import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { getFoodById } from '../service/foodService.js';
import { formatPrice } from '../utils/format.js';
import FoodItem from '../components/FoodItem.jsx';

const FoodDetails = () => {
  const { id } = useParams();
  const { foods, addToCart } = useStore();
  const [food, setFood] = useState(() => foods.find((f) => String(f.id) === id) || null);
  const [loading, setLoading] = useState(!food);
  const [error, setError] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Use the cached list when possible, otherwise fetch this one dish.
  useEffect(() => {
    const cached = foods.find((f) => String(f.id) === id);
    if (cached) {
      setFood(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    getFoodById(id)
      .then(setFood)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id, foods]);

  useEffect(() => { setQty(1); setAdded(false); }, [id]);

  const handleAdd = () => {
    addToCart(food.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  if (loading) {
    return (
      <div className="container-x grid gap-8 py-10 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-ink/10" />
        <div className="space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded bg-ink/10" />
          <div className="h-5 w-full animate-pulse rounded bg-ink/10" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-ink/10" />
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="container-x py-24 text-center">
        <p className="font-display text-2xl font-bold">We couldn't find that dish</p>
        <Link to="/explore" className="btn btn-primary mt-6">Browse the menu</Link>
      </div>
    );
  }

  const related = foods.filter((f) => f.category === food.category && f.id !== food.id).slice(0, 4);

  return (
    <div className="container-x py-8">
      <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-14">
        <div className="animate-slide-in-left overflow-hidden rounded-3xl border border-line bg-surface">
          <img src={food.imageUrl} alt={food.name} className="aspect-square h-full w-full object-cover" />
        </div>

        <div className="animate-slide-in-right flex flex-col justify-center">
          {food.category && (
            <span className="w-fit rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand">{food.category}</span>
          )}
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{food.name}</h1>
          <p className="mt-4 max-w-prose leading-relaxed text-muted">{food.description}</p>
          <p className="mt-6 font-display text-4xl font-extrabold">{formatPrice(food.price)}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-line bg-surface p-1.5">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-ink/5 active:scale-90" aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-bold" aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-ink/5 active:scale-90" aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className={`btn px-8! py-3! text-base ${added ? 'bg-emerald-600 text-white' : 'btn-primary'}`}
            >
              {added ? <><Check className="h-5 w-5" /> Added to cart</> : <><ShoppingBag className="h-5 w-5" /> Add to cart · {formatPrice(food.price * qty)}</>}
            </button>
          </div>

          <p className="mt-4 text-sm text-muted">Delivery in about 30 minutes. Free above ₹299.</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">More in {food.category}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((f) => <FoodItem key={f.id} food={f} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default FoodDetails;
