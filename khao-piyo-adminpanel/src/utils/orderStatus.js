export const STATUS = {
  PLACED: 'Order Placed',
  PREPARING: 'Preparing',
  OUT: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// The normal journey of an order
export const FLOW = [STATUS.PLACED, STATUS.PREPARING, STATUS.OUT, STATUS.DELIVERED];

// Maps stored text onto standard statuses
export const normalizeStatus = (raw = '') => {
  const s = String(raw).toLowerCase();
  if (s.includes('cancel')) return STATUS.CANCELLED;
  if (s.includes('out')) return STATUS.OUT;
  if (s.includes('deliver')) return STATUS.DELIVERED;
  if (s.includes('prepar')) return STATUS.PREPARING;
  return STATUS.PLACED;
};

export const isFinal = (status) => status === STATUS.DELIVERED || status === STATUS.CANCELLED;

export const nextStatus = (status) => {
  const i = FLOW.indexOf(status);
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
};

export const NEXT_LABEL = {
  [STATUS.PLACED]: 'Start preparing',
  [STATUS.PREPARING]: 'Send out for delivery',
  [STATUS.OUT]: 'Mark as delivered',
};

export const STATUS_STYLE = {
  [STATUS.PLACED]: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20',
  [STATUS.PREPARING]: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
  [STATUS.OUT]: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20',
  [STATUS.DELIVERED]: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
  [STATUS.CANCELLED]: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600',
};

export const isPaid = (order) => order.paymentStatus?.toLowerCase() === 'paid';

export const formatPrice = (value) => `₹${Number(value || 0).toFixed(0)}`;

export const orderTimestamp = (id = '') =>
  /^[0-9a-f]{24}$/i.test(id) ? parseInt(id.slice(0, 8), 16) * 1000 : 0;

export const orderDate = (id = '') => {
  const t = orderTimestamp(id);
  if (!t) return '';
  return new Date(t).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};