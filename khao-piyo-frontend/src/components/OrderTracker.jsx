import React from 'react';
import { Ban, Bike, ChefHat, ClipboardCheck, PackageCheck } from 'lucide-react';
import { FLOW, STATUS, normalizeStatus } from '../utils/orderStatus.js';

const STEPS = [
  { status: STATUS.PLACED, label: 'Order placed', icon: ClipboardCheck },
  { status: STATUS.PREPARING, label: 'Preparing', icon: ChefHat },
  { status: STATUS.OUT, label: 'Out for delivery', icon: Bike },
  { status: STATUS.DELIVERED, label: 'Delivered', icon: PackageCheck },
];

const MESSAGE = {
  [STATUS.PLACED]: 'We have received your order. The kitchen will start on it shortly.',
  [STATUS.PREPARING]: 'Your food is being prepared.',
  [STATUS.OUT]: 'Your order is on its way to you.',
  [STATUS.DELIVERED]: 'Delivered. Enjoy your meal!',
};

const OrderTracker = ({ status }) => {
  const current = normalizeStatus(status);

  if (current === STATUS.CANCELLED) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
        <Ban className="mt-0.5 size-5 shrink-0" />
        <p>
          This order was cancelled. If you were charged, please contact support to arrange a refund.
        </p>
      </div>
    );
  }

  const index = FLOW.indexOf(current);

  return (
    <div>
      <ol className="relative grid grid-cols-4" aria-label="Order progress">
        {/* grey track + brand-coloured progress */}
        <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-5 h-1 -translate-y-1/2 rounded-full bg-line" />
        <span
          aria-hidden="true"
          className="absolute left-[12.5%] top-5 h-1 -translate-y-1/2 rounded-full bg-brand transition-all duration-700"
          style={{ width: `${(index / (STEPS.length - 1)) * 75}%` }}
        />

        {STEPS.map(({ status: step, label, icon: Icon }, i) => {
          const done = i <= index;
          const active = i === index && current !== STATUS.DELIVERED;
          return (
            <li
              key={step}
              aria-current={i === index ? 'step' : undefined}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <span className="relative grid size-10 place-items-center">
                {active && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-brand/30" />}
                <span
                  className={`relative grid size-10 place-items-center rounded-full border-2 transition-colors duration-500 ${
                    done ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-muted'
                  }`}
                >
                  <Icon className="size-5" />
                </span>
              </span>
              <span className={`mt-2 text-xs font-medium sm:text-sm ${done ? 'text-ink' : 'text-muted'}`}>{label}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-center text-sm text-muted" aria-live="polite">{MESSAGE[current]}</p>
    </div>
  );
};

export default OrderTracker;