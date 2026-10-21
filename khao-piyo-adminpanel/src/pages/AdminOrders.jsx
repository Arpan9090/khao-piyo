// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Loader2, MapPin, Package, Phone, RefreshCw, Search, ShieldAlert, Mail } from 'lucide-react';
// import { getAllOrders, updateOrderStatus } from '../services/orderService.js';
// import {
//   NEXT_LABEL,
//   STATUS,
//   STATUS_STYLE,
//   isFinal,
//   isPaid,
//   nextStatus,
//   normalizeStatus,
//   orderDate,
//   orderTimestamp,
// } from '../utils/orderStatus.js';
// import { formatPrice } from '../utils/format.js';

// const TABS = [
//   { key: 'all', label: 'All' },
//   { key: STATUS.PLACED, label: 'New' },
//   { key: STATUS.PREPARING, label: 'Preparing' },
//   { key: STATUS.OUT, label: 'Out for delivery' },
//   { key: STATUS.DELIVERED, label: 'Delivered' },
//   { key: STATUS.CANCELLED, label: 'Cancelled' },
// ];

// const StatCard = ({ label, value, highlight }) => (
//   <div className={`rounded-2xl border p-4 ${highlight ? 'border-brand/40 bg-brand/5' : 'border-line bg-surface'}`}>
//     <p className="text-sm text-muted">{label}</p>
//     <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
//   </div>
// );

// const OrderCard = ({ order, busy, confirming, error, onAdvance, onAskCancel, onKeep, onCancel }) => {
//   const status = normalizeStatus(order.orderStatus);
//   const next = nextStatus(status);
//   const closed = isFinal(status);
//   const items = order.orderedItems || [];

//   return (
//     <li
//       className={`overflow-hidden rounded-2xl border bg-surface ${
//         status === STATUS.PLACED ? 'border-brand/50 border-l-4 border-l-brand' : 'border-line'
//       }`}
//     >
//       <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
//         <div>
//           <p className="flex items-center gap-2 font-display text-lg font-bold">
//             Order #{order.id.slice(-8).toUpperCase()}
//             {status === STATUS.PLACED && (
//               <span className="animate-pulse rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold uppercase text-white">New</span>
//             )}
//           </p>
//           <p className="text-xs text-muted">{orderDate(order.id)}</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <span className="font-bold">{formatPrice(order.amount)}</span>
//           <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}>{status}</span>
//         </div>
//       </div>

//       <div className="grid gap-5 p-5 md:grid-cols-[1fr_280px]">
//         <ul className="space-y-3">
//           {items.map((item, i) => (
//             <li key={`${item.foodId}-${i}`} className="flex items-center gap-3">
//               <img src={item.imageUrl} alt="" className="size-12 shrink-0 rounded-lg bg-ink/5 object-cover" />
//               <div className="min-w-0 flex-1">
//                 <p className="truncate text-sm font-semibold">{item.name}</p>
//                 <p className="text-xs text-muted">{item.quantity} × {formatPrice(item.price)}</p>
//               </div>
//             </li>
//           ))}
//         </ul>

//         <div className="space-y-2 text-sm md:border-l md:border-line md:pl-5">
//           <p className="flex items-start gap-2 text-muted">
//             <MapPin className="mt-0.5 size-4 shrink-0 text-brand" /> <span>{order.userAddress}</span>
//           </p>
//           {order.phoneNumber && (
//             <p className="flex items-center gap-2">
//               <Phone className="size-4 shrink-0 text-brand" />
//               <a href={`tel:${order.phoneNumber}`} className="hover:underline">{order.phoneNumber}</a>
//             </p>
//           )}
//           {order.email && (
//             <p className="flex items-center gap-2 text-muted">
//               <Mail className="size-4 shrink-0 text-brand" /> <span className="truncate">{order.email}</span>
//             </p>
//           )}
//         </div>
//       </div>

//       {!closed && (
//         <div className="flex flex-wrap items-center gap-3 border-t border-line bg-bg/50 px-5 py-4">
//           {confirming ? (
//             <>
//               <span className="text-sm font-medium">Cancel this order?</span>
//               <button
//                 onClick={onCancel}
//                 disabled={busy}
//                 className="btn bg-red-600 py-2 text-white hover:bg-red-700 disabled:pointer-events-none disabled:opacity-70"
//               >
//                 {busy ? <Loader2 className="size-4 animate-spin" /> : 'Yes, cancel order'}
//               </button>
//               <button onClick={onKeep} disabled={busy} className="btn btn-outline py-2">Keep order</button>
//             </>
//           ) : (
//             <>
//               {next && (
//                 <button
//                   onClick={onAdvance}
//                   disabled={busy}
//                   className="btn btn-primary py-2 disabled:pointer-events-none disabled:opacity-70"
//                 >
//                   {busy ? <><Loader2 className="size-4 animate-spin" /> Updating…</> : NEXT_LABEL[status]}
//                 </button>
//               )}
//               <button
//                 onClick={onAskCancel}
//                 disabled={busy}
//                 className="btn btn-ghost py-2 text-red-600 hover:bg-red-500/10 dark:text-red-400"
//               >
//                 Cancel order
//               </button>
//             </>
//           )}
//           {error && <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
//         </div>
//       )}
//     </li>
//   );
// };

// const AdminOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');
//   const [forbidden, setForbidden] = useState(false);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const [tab, setTab] = useState('all');
//   const [search, setSearch] = useState('');
//   const [busyId, setBusyId] = useState(null);
//   const [confirmId, setConfirmId] = useState(null);
//   const [rowErrors, setRowErrors] = useState({});

//   const load = useCallback(async ({ manual = false } = {}) => {
//     if (manual) setRefreshing(true);
//     try {
//       const data = await getAllOrders();
//       setOrders(data.filter(isPaid).sort((a, b) => b.id.localeCompare(a.id))); // newest first
//       setError('');
//       setForbidden(false);
//       setLastUpdated(new Date());
//     } catch (err) {
//       if (err?.isAuthError) return;
//       if (err.response?.status === 403) setForbidden(true);
//       else if (manual || loading) setError('We could not load the orders. Please try again.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Load now, then keep checking for new orders while the tab is open
//   useEffect(() => {
//     load();
//     const timer = setInterval(() => {
//       if (document.visibilityState === 'visible') load();
//     }, 15000);
//     const onFocus = () => load();
//     window.addEventListener('focus', onFocus);
//     return () => {
//       clearInterval(timer);
//       window.removeEventListener('focus', onFocus);
//     };
//   }, [load]);

//   const changeStatus = async (order, status) => {
//     setBusyId(order.id);
//     setRowErrors((e) => ({ ...e, [order.id]: '' }));
//     try {
//       await updateOrderStatus(order.id, status);
//       setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, orderStatus: status } : o)));
//       setConfirmId(null);
//     } catch (err) {
//       if (err?.isAuthError) return;
//       const code = err.response?.status;
//       const text =
//         code === 403
//           ? 'You do not have permission to update orders.'
//           : code === 409
//             ? 'This order can no longer be changed. Refreshing…'
//             : 'Could not update the order. Please try again.';
//       setRowErrors((e) => ({ ...e, [order.id]: text }));
//       if (code === 409) load();
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const counts = useMemo(() => {
//     const c = { all: orders.length };
//     TABS.slice(1).forEach((t) => { c[t.key] = 0; });
//     orders.forEach((o) => { c[normalizeStatus(o.orderStatus)] += 1; });
//     return c;
//   }, [orders]);

//   const stats = useMemo(() => {
//     const startOfToday = new Date().setHours(0, 0, 0, 0);
//     const today = orders.filter((o) => orderTimestamp(o.id) >= startOfToday);
//     return {
//       todayCount: today.length,
//       todayRevenue: today
//         .filter((o) => normalizeStatus(o.orderStatus) !== STATUS.CANCELLED)
//         .reduce((sum, o) => sum + o.amount, 0),
//       inProgress: counts[STATUS.PREPARING] + counts[STATUS.OUT],
//     };
//   }, [orders, counts]);

//   const visible = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return orders.filter((o) => {
//       if (tab !== 'all' && normalizeStatus(o.orderStatus) !== tab) return false;
//       if (!q) return true;
//       const haystack = [
//         o.id,
//         o.id.slice(-8),
//         o.email,
//         o.phoneNumber,
//         o.userAddress,
//         ...(o.orderedItems || []).map((i) => i.name),
//       ].join(' ').toLowerCase();
//       return haystack.includes(q);
//     });
//   }, [orders, tab, search]);

//   if (forbidden) {
//     return (
//       <div className="container-x py-24 text-center">
//         <ShieldAlert className="mx-auto size-12 text-muted" />
//         <h1 className="mt-4 font-display text-2xl font-bold">Admins only</h1>
//         <p className="mx-auto mt-1 max-w-md text-muted">
//           The server says this account is not an admin. If you were just given admin access, sign out and sign in again.
//         </p>
//         <Link to="/" className="btn btn-primary mt-6">Back to home</Link>
//       </div>
//     );
//   }

//   return (
//     <div className="container-x py-10">
//       <div className="flex flex-wrap items-end justify-between gap-4">
//         <div>
//           <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Orders</h1>
//           <p className="mt-1 text-sm text-muted">
//             Updates automatically every 15 seconds
//             {lastUpdated && ` · last updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`}
//           </p>
//         </div>
//         <button onClick={() => load({ manual: true })} disabled={refreshing} className="btn btn-outline">
//           <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
//         </button>
//       </div>

//       <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
//         <StatCard label="New orders" value={counts[STATUS.PLACED] ?? 0} highlight={(counts[STATUS.PLACED] ?? 0) > 0} />
//         <StatCard label="In progress" value={stats.inProgress} />
//         <StatCard label="Orders today" value={stats.todayCount} />
//         <StatCard label="Revenue today" value={formatPrice(stats.todayRevenue)} />
//       </div>

//       <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0" role="tablist">
//           {TABS.map((t) => (
//             <button
//               key={t.key}
//               role="tab"
//               aria-selected={tab === t.key}
//               onClick={() => setTab(t.key)}
//               className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 ${
//                 tab === t.key
//                   ? 'border-brand bg-brand text-white'
//                   : 'border-line bg-surface text-muted hover:border-brand/40 hover:text-ink'
//               }`}
//             >
//               {t.label}
//               <span className={`rounded-full px-1.5 text-xs ${tab === t.key ? 'bg-white/25' : 'bg-ink/5'}`}>
//                 {counts[t.key] ?? 0}
//               </span>
//             </button>
//           ))}
//         </div>

//         <div className="relative lg:w-80">
//           <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search order ID, phone, email, dish…"
//             aria-label="Search orders"
//             className="input rounded-full! pl-11!"
//           />
//         </div>
//       </div>

//       {loading && (
//         <div className="mt-6 space-y-4">
//           {[0, 1, 2].map((i) => (
//             <div key={i} className="h-44 animate-pulse rounded-2xl border border-line bg-surface" />
//           ))}
//         </div>
//       )}

//       {!loading && error && (
//         <div className="mt-6 rounded-2xl border border-line bg-surface p-10 text-center">
//           <p className="text-muted">{error}</p>
//           <button onClick={() => load({ manual: true })} className="btn btn-primary mt-4">Try again</button>
//         </div>
//       )}

//       {!loading && !error && visible.length === 0 && (
//         <div className="mt-6 rounded-2xl border border-dashed border-line p-12 text-center">
//           <Package className="mx-auto size-12 text-muted" />
//           <p className="mt-3 font-display text-lg font-bold">
//             {orders.length === 0 ? 'No orders yet' : 'No orders match this view'}
//           </p>
//           <p className="mt-1 text-muted">
//             {orders.length === 0 ? 'New orders will appear here as customers pay.' : 'Try another tab or clear the search.'}
//           </p>
//         </div>
//       )}

//       {!loading && !error && visible.length > 0 && (
//         <ul className="mt-6 space-y-5">
//           {visible.map((order) => (
//             <OrderCard
//               key={order.id}
//               order={order}
//               busy={busyId === order.id}
//               confirming={confirmId === order.id}
//               error={rowErrors[order.id]}
//               onAdvance={() => changeStatus(order, nextStatus(normalizeStatus(order.orderStatus)))}
//               onAskCancel={() => setConfirmId(order.id)}
//               onKeep={() => setConfirmId(null)}
//               onCancel={() => changeStatus(order, STATUS.CANCELLED)}
//             />
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default AdminOrders;