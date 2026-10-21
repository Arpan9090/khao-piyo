export const STATUS = {
  PLACED: 'Order Placed',
  PREPARING: 'Preparing',
  OUT: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// The normal journey of an order
export const FLOW = [STATUS.PLACED, STATUS.PREPARING, STATUS.OUT, STATUS.DELIVERED];

// Maps whatever text is stored in the database onto one of the statuses above
export const normalizeStatus = (raw = '') => {
  const s = String(raw).toLowerCase();
  if (s.includes('cancel')) return STATUS.CANCELLED;
  if (s.includes('out')) return STATUS.OUT; // checked before "deliver" ("Out for Delivery")
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
  [STATUS.PLACED]: 'bg-brand/15 text-brand',
  [STATUS.PREPARING]: 'bg-turmeric/25 text-amber-800 dark:text-turmeric',
  [STATUS.OUT]: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  [STATUS.DELIVERED]: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  [STATUS.CANCELLED]: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export const isPaid = (order) => order.paymentStatus?.toLowerCase() === 'paid';

// Orders have no timestamp field, but a Mongo id starts with its creation time
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