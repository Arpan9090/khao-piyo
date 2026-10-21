const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export class PaymentError extends Error {
  // type: 'config' | 'script' | 'dismissed' | 'failed'
  constructor(type, message) {
    super(message);
    this.name = 'PaymentError';
    this.type = type;
  }
}

let scriptPromise = null;

// Loads Razorpay's checkout script once, only when it is first needed
const loadCheckout = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SRC;
      script.onload = () => resolve(true);
      script.onerror = () => {
        scriptPromise = null; // allow a retry later
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
};

// Opens the Razorpay popup for an order created by your backend.
//   order   -> OrderResponse from /api/orders/create  (needs razorPayOrderId + amount in rupees)
//   prefill -> { name, email, contact }
// Resolves with { razorpay_order_id, razorpay_payment_id, razorpay_signature } on success.
// Rejects with a PaymentError if the popup is closed or the payment fails.
export const payWithRazorpay = async ({ order, prefill = {} }) => {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!key) {
    throw new PaymentError('config', 'Payments are not set up yet (missing VITE_RAZORPAY_KEY_ID).');
  }
  if (!order?.razorPayOrderId) {
    throw new PaymentError('failed', 'This order has no payment reference. Please place the order again.');
  }
  if (!(await loadCheckout())) {
    throw new PaymentError('script', 'Could not load the payment window. Check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    let lastError = '';

    const rzp = new window.Razorpay({
      key,
      amount: Math.round(order.amount * 100), // paise
      currency: 'INR',
      name: 'Khao Piyo',
      description: 'Food order',
      order_id: order.razorPayOrderId,
      prefill,
      theme: { color: '#C82D1E' },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () =>
          reject(
            lastError
              ? new PaymentError('failed', lastError)
              : new PaymentError('dismissed', 'Payment cancelled')
          ),
      },
    });

    // A failed attempt keeps the popup open so the user can retry inside it.
    // We only remember the reason; the popup's own success handler still resolves.
    rzp.on('payment.failed', (res) => {
      lastError = res?.error?.description || 'Payment failed. Please try again.';
    });

    rzp.open();
  });
};