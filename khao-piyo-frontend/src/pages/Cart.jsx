import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getDeliveryFee } from '../utils/pricing.js';
import { formatPrice } from '../utils/format.js';

const Cart = () => {
  const { cartItems, cartTotal, addToCart, decreaseFromCart, removeFromCart, loading, cartLoading } = useStore();
  const { isAuthenticated } = useAuth();
  const delivery = getDeliveryFee(cartTotal);

  if (loading || cartLoading) {
    return <div className="container-x py-24 text-center text-muted">Loading your cart…</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <ShoppingBag className="mx-auto size-12 text-muted" />
        <h1 className="mt-4 font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-muted">Add a few dishes and they will show up here.</p>
        <Link to="/explore" className="btn btn-primary mt-6">Browse the menu</Link>
      </div>
    );
  }

  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Your cart</h1>
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
          {cartItems.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <Link to={`/food/${item.id}`} className="block truncate font-display font-bold hover:text-brand">{item.name}</Link>
                <p className="text-sm text-muted">{formatPrice(item.price)} each</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => decreaseFromCart(item.id)} className="grid h-8 w-8 place-items-center rounded-full border border-line transition active:scale-90" aria-label="Remove one"><Minus className="h-4 w-4" /></button>
                  <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => addToCart(item.id)} className="grid h-8 w-8 place-items-center rounded-full border border-line transition active:scale-90" aria-label="Add one more"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-muted transition hover:text-brand" aria-label={`Remove ${item.name}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-bold">Order summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(cartTotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{delivery === 0 ? 'Free' : formatPrice(delivery)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPrice(cartTotal + delivery)}</dd></div>
        </dl>
        <Link to="/checkout" className="btn btn-primary mt-6 w-full py-3">
          {isAuthenticated ? 'Proceed to checkout' : 'Sign in to check out'}
        </Link>
        {!isAuthenticated && (
          <p className="mt-3 text-center text-xs text-muted">Your cart will be saved to your account when you sign in.</p>
        )}
      </aside>
    </div>
  );
};

export default Cart;