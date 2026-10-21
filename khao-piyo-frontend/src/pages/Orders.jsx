import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, Package, Phone } from 'lucide-react';
import { getMyOrders } from '../service/orderService.js';
import OrderTracker from '../components/OrderTracker.jsx';
import { STATUS_STYLE, isPaid, normalizeStatus, orderDate } from '../utils/orderStatus.js';
import { formatPrice } from '../utils/format.js';

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Show the success banner once, then clear the navigation state so a refresh doesn't repeat it
  const [justPaid] = useState(Boolean(location.state?.justPaid));
  useEffect(() => {
    if (location.state?.justPaid) navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async (silent = false) => {
    try {
      const data = await getMyOrders();
      setOrders(data.filter(isPaid).sort((a, b) => b.id.localeCompare(a.id))); // paid only, newest first
      setError('');
    } catch (err) {
      if (!silent && !err?.isAuthError) setError('We could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Keep the status fresh while the page is open
  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load(true);
    }, 15000);
    const onFocus = () => load(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">My orders</h1>
      <p className="mt-1 text-sm text-muted">Delivery status updates automatically.</p>

      {justPaid && (
        <div
          role="status"
          className="animate-slide-down mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4"
        >
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-semibold">Payment successful. Your order is confirmed!</p>
            <p className="text-sm text-muted">The restaurant has your order and will start preparing it.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-8 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="text-muted">{error}</p>
          <button onClick={() => load()} className="btn btn-primary mt-4">Try again</button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-12 text-center">
          <Package className="mx-auto size-12 text-muted" />
          <h2 className="mt-4 font-display text-xl font-bold">No orders yet</h2>
          <p className="mt-1 text-muted">When you place an order, it will show up here.</p>
          <Link to="/explore" className="btn btn-primary mt-6">Browse the menu</Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="mt-8 space-y-5">
          {orders.map((order) => {
            const status = normalizeStatus(order.orderStatus);
            const items = order.orderedItems || [];
            return (
              <li key={order.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <p className="font-display text-lg font-bold">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted">{orderDate(order.id)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}>{status}</span>
                </div>

                <div className="border-b border-line px-5 py-6">
                  <OrderTracker status={order.orderStatus} />
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-[1fr_260px]">
                  <ul className="space-y-3">
                    {items.map((item, i) => (
                      <li key={`${item.foodId}-${i}`} className="flex items-center gap-3">
                        <img src={item.imageUrl} alt="" className="size-12 shrink-0 rounded-lg bg-ink/5 object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-muted">{item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3 text-sm md:border-l md:border-line md:pl-5">
                    <p className="flex items-start gap-2 text-muted">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-brand" /> <span>{order.userAddress}</span>
                    </p>
                    {order.phoneNumber && (
                      <p className="flex items-center gap-2 text-muted">
                        <Phone className="size-4 shrink-0 text-brand" /> {order.phoneNumber}
                      </p>
                    )}
                    <p className="flex items-center justify-between border-t border-line pt-3 text-base font-bold">
                      <span>Total paid</span>
                      <span>{formatPrice(order.amount)}</span>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Orders;