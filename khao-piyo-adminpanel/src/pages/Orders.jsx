import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Mail, MapPin, Package, Phone, RefreshCw, Search } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import {
  NEXT_LABEL,
  STATUS,
  STATUS_STYLE,
  formatPrice,
  isFinal,
  isPaid,
  nextStatus,
  normalizeStatus,
  orderDate,
  orderTimestamp,
} from '../utils/orderStatus';

const card = 'rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
const muted = 'text-gray-500 dark:text-gray-400';
const btn =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:pointer-events-none disabled:opacity-70';
const btnPrimary = `${btn} bg-red-600 text-white hover:bg-red-700`;
const btnOutline = `${btn} border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700`;

const TABS = [
  { key: 'all', label: 'All' },
  { key: STATUS.PLACED, label: 'New' },
  { key: STATUS.PREPARING, label: 'Preparing' },
  { key: STATUS.OUT, label: 'Out for delivery' },
  { key: STATUS.DELIVERED, label: 'Delivered' },
  { key: STATUS.CANCELLED, label: 'Cancelled' },
];

const StatCard = ({ label, value, highlight }) => (
  <div
    className={`rounded-2xl border p-4 ${
      highlight
        ? 'border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-500/10'
        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
    }`}
  >
    <p className={`text-sm ${muted}`}>{label}</p>
    <p className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const OrderCard = ({ order, busy, confirming, onAdvance, onAskCancel, onKeep, onCancel }) => {
  const status = normalizeStatus(order.orderStatus);
  const next = nextStatus(status);
  const items = order.orderedItems || [];

  return (
    <li className={`overflow-hidden ${card} ${status === STATUS.PLACED ? 'border-l-4 border-l-red-600' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            Order #{order.id.slice(-8).toUpperCase()}
            {status === STATUS.PLACED && (
              <span className="animate-pulse rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                New
              </span>
            )}
          </p>
          <p className={`text-xs ${muted}`}>{orderDate(order.id)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900 dark:text-white">{formatPrice(order.amount)}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}>{status}</span>
        </div>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-[1fr_280px]">
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={`${item.foodId}-${i}`} className="flex items-center gap-3">
              <img src={item.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 object-cover dark:bg-gray-700" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                <p className={`text-xs ${muted}`}>{item.quantity} × {formatPrice(item.price)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-2 text-sm md:border-l md:border-gray-200 md:pl-5 dark:md:border-gray-700">
          <p className={`flex items-start gap-2 ${muted}`}>
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> <span>{order.userAddress}</span>
          </p>
          {order.phoneNumber && (
            <p className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Phone className="h-4 w-4 shrink-0 text-red-600" />
              <a href={`tel:${order.phoneNumber}`} className="hover:underline">{order.phoneNumber}</a>
            </p>
          )}
          {order.email && (
            <p className={`flex items-center gap-2 ${muted}`}>
              <Mail className="h-4 w-4 shrink-0 text-red-600" /> <span className="truncate">{order.email}</span>
            </p>
          )}
        </div>
      </div>

      {!isFinal(status) && (
        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900/40">
          {confirming ? (
            <>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Cancel this order?</span>
              <button onClick={onCancel} disabled={busy} className={`${btn} bg-red-700 text-white hover:bg-red-800`}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, cancel order'}
              </button>
              <button onClick={onKeep} disabled={busy} className={btnOutline}>Keep order</button>
            </>
          ) : (
            <>
              {next && (
                <button onClick={onAdvance} disabled={busy} className={btnPrimary}>
                  {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : NEXT_LABEL[status]}
                </button>
              )}
              <button
                onClick={onAskCancel}
                disabled={busy}
                className={`${btn} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`}
              >
                Cancel order
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async ({ manual = false } = {}) => {
    if (manual) setRefreshing(true);
    try {
      const data = await getAllOrders();
      setOrders(data.filter(isPaid).sort((a, b) => b.id.localeCompare(a.id))); // newest first
      setError('');
      setLastUpdated(new Date());
    } catch (err) {
      if (err?.isAuthError) return;
      setError(
        err.response?.status === 403
          ? 'The server says this account is not an admin. Sign out and sign in again.'
          : 'We could not load the orders. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load now, then keep checking for new orders while the tab is open
  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 15000);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  const changeStatus = async (order, status) => {
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, status);
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, orderStatus: status } : o)));
      setConfirmId(null);
      toast.success(`Order #${order.id.slice(-8).toUpperCase()} is now "${status}"`);
    } catch (err) {
      if (err?.isAuthError) return;
      const code = err.response?.status;
      toast.error(
        code === 403
          ? 'You do not have permission to update orders.'
          : code === 409
            ? 'This order can no longer be changed. Refreshing…'
            : 'Could not update the order. Please try again.'
      );
      if (code === 409) load();
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const c = { all: orders.length };
    TABS.slice(1).forEach((t) => { c[t.key] = 0; });
    orders.forEach((o) => { c[normalizeStatus(o.orderStatus)] += 1; });
    return c;
  }, [orders]);

  const stats = useMemo(() => {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const today = orders.filter((o) => orderTimestamp(o.id) >= startOfToday);
    return {
      todayCount: today.length,
      todayRevenue: today
        .filter((o) => normalizeStatus(o.orderStatus) !== STATUS.CANCELLED)
        .reduce((sum, o) => sum + o.amount, 0),
      inProgress: counts[STATUS.PREPARING] + counts[STATUS.OUT],
    };
  }, [orders, counts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== 'all' && normalizeStatus(o.orderStatus) !== tab) return false;
      if (!q) return true;
      return [o.id, o.id.slice(-8), o.email, o.phoneNumber, o.userAddress, ...(o.orderedItems || []).map((i) => i.name)]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [orders, tab, search]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Orders</h1>
          <p className={`mt-1 text-sm ${muted}`}>
            Updates automatically every 15 seconds
            {lastUpdated &&
              ` · last updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`}
          </p>
        </div>
        <button onClick={() => load({ manual: true })} disabled={refreshing} className={btnOutline}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="New orders" value={counts[STATUS.PLACED] ?? 0} highlight={(counts[STATUS.PLACED] ?? 0) > 0} />
        <StatCard label="In progress" value={stats.inProgress} />
        <StatCard label="Orders today" value={stats.todayCount} />
        <StatCard label="Revenue today" value={formatPrice(stats.todayRevenue)} />
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 ${
                tab === t.key
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-red-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 text-xs ${tab === t.key ? 'bg-white/25' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {counts[t.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="relative lg:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, phone, email, dish…"
            aria-label="Search orders"
            className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      {loading && (
        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-44 animate-pulse ${card}`} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className={`mt-6 p-10 text-center ${card}`}>
          <p className={muted}>{error}</p>
          <button onClick={() => load({ manual: true })} className={`${btnPrimary} mt-4`}>Try again</button>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
            {orders.length === 0 ? 'No orders yet' : 'No orders match this view'}
          </p>
          <p className={`mt-1 ${muted}`}>
            {orders.length === 0 ? 'New orders will appear here as customers pay.' : 'Try another tab or clear the search.'}
          </p>
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <ul className="mt-6 space-y-5">
          {visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              busy={busyId === order.id}
              confirming={confirmId === order.id}
              onAdvance={() => changeStatus(order, nextStatus(normalizeStatus(order.orderStatus)))}
              onAskCancel={() => setConfirmId(order.id)}
              onKeep={() => setConfirmId(null)}
              onCancel={() => changeStatus(order, STATUS.CANCELLED)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders;