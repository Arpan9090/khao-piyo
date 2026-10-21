import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Check,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { deleteAddress, getAddresses, saveAddress } from '../service/addressService.js';
import { createOrder, verifyPayment } from '../service/orderService.js';
import { payWithRazorpay } from '../service/paymentService.js';
import { FREE_DELIVERY_ABOVE, getDeliveryFee } from '../utils/pricing.js';
import { formatPrice } from '../utils/format.js';

const LABELS = [
  { name: 'Home', icon: Home },
  { name: 'Work', icon: Briefcase },
  { name: 'Other', icon: MapPin },
];

const emptyForm = { label: 'Home', name: '', phone: '', line1: '', landmark: '', city: '', pincode: '' };

const STAGE_TEXT = {
  creating: 'Creating your order…',
  paying: 'Complete the payment in the popup…',
  confirming: 'Confirming your payment…',
};

const NOTICE_STYLE = {
  error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  info: 'border-line bg-bg',
};

const validate = (f) => {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter the receiver’s name';
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number';
  if (f.line1.trim().length < 5) e.line1 = 'Enter house no., building and street';
  if (!f.city.trim()) e.city = 'Enter your city';
  if (!/^\d{6}$/.test(f.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
  return e;
};

const formatAddress = (a) =>
  `${a.line1}${a.landmark ? `, ${a.landmark}` : ''}, ${a.city} - ${a.pincode}`;

const Field = ({ label, error, children, className = '' }) => (
  <label className={`block text-sm font-medium ${className}`}>
    {label}
    <div className="mt-1.5">{children}</div>
    {error && (
      <span className="mt-1 block text-xs font-normal text-red-600 dark:text-red-400" role="alert">
        {error}
      </span>
    )}
  </label>
);

const SectionCard = ({ id, step, title, children }) => (
  <section id={id} className="scroll-mt-24 rounded-2xl border border-line bg-surface p-5 sm:p-6">
    <h2 className="flex items-center gap-3 font-display text-xl font-bold">
      <span className="grid size-7 place-items-center rounded-full bg-brand text-sm text-white">{step}</span>
      {title}
    </h2>
    <div className="mt-5">{children}</div>
  </section>
);

const PlaceOrder = () => {
  const { cartItems, cartTotal, loading, cartLoading, clearCart } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false); // true = the "new address" form is open
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saveForLater, setSaveForLater] = useState(true);
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(''); // '' | 'creating' | 'paying' | 'confirming'
  const [notice, setNotice] = useState(null); // { tone: 'error' | 'info', text, link? }
  const [unconfirmed, setUnconfirmed] = useState(false); // paid, but /verify failed

  // The order created on the server for the current cart + address.
  // If the user closes the popup and clicks Pay again, this one is reused (no duplicate orders).
  const pendingOrder = useRef(null);

  // Load previously saved addresses; pre-select the most recent one
  useEffect(() => {
    getAddresses().then((list) => {
      setAddresses(list);
      if (list.length) setSelectedId(list[0].id);
      else setAdding(true);
      setReady(true);
    });
  }, []);

  const deliveryFee = getDeliveryFee(cartTotal);
  const total = cartTotal + deliveryFee;
  const selectedAddress = addresses.find((a) => a.id === selectedId);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const startAdding = () => {
    const last = addresses[0]; // reuse the name and phone from the last address
    setForm({ ...emptyForm, name: last?.name || '', phone: last?.phone || '' });
    setErrors({});
    setAdding(true);
  };

  const pickSaved = (id) => {
    setSelectedId(id);
    setAdding(false);
    setNotice(null);
  };

  const removeSaved = async (id) => {
    await deleteAddress(id);
    const list = addresses.filter((a) => a.id !== id);
    setAddresses(list);
    if (selectedId === id) setSelectedId(list[0]?.id ?? null);
    if (list.length === 0) {
      setForm(emptyForm);
      setAdding(true);
    }
  };

  const scrollToAddress = () =>
    document.getElementById('address-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // The body sent to POST /api/orders/create  (matches your OrderRequest)
  const buildPayload = (address) => ({
    orderedItems: cartItems.map((i) => ({
      foodId: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      category: i.category,
      imageUrl: i.imageUrl,
      description: i.description,
    })),
    userAddress: `${address.name}, ${formatAddress(address)}`,
    amount: Math.round(total * 100) / 100,
    email: user?.email || '',
    phoneNumber: address.phone,
    orderStatus: 'Order Placed',
    // note: note.trim(),   // uncomment after adding a `note` field to OrderRequest/OrderEntity/OrderResponse
  });

  const finish = () => {
    setProcessing(false);
    setStage('');
  };

  const handlePlaceOrder = async () => {
    if (processing || unconfirmed) return;
    setNotice(null);

    // ---- 1. work out the delivery address ----
    let address;
    try {
      if (adding) {
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) {
          scrollToAddress();
          return;
        }
        address = {
          ...form,
          name: form.name.trim(),
          line1: form.line1.trim(),
          landmark: form.landmark.trim(),
          city: form.city.trim(),
        };
        if (saveForLater) {
          address = await saveAddress(address);
          setAddresses(await getAddresses());
          setSelectedId(address.id);
          setAdding(false);
        }
      } else {
        address = selectedAddress;
        if (!address) {
          setNotice({ tone: 'error', text: 'Please select or add a delivery address.' });
          scrollToAddress();
          return;
        }
      }
    } catch {
      setNotice({ tone: 'error', text: 'Could not save your address. Please try again.' });
      return;
    }

    const payload = buildPayload(address);
    const key = JSON.stringify(payload);
    setProcessing(true);

    // ---- 2. create the order on the server (reuse it if nothing changed) ----
    let order;
    try {
      setStage('creating');
      if (pendingOrder.current?.key === key) {
        order = pendingOrder.current.order;
      } else {
        order = await createOrder(payload);
        pendingOrder.current = { key, order };
      }
    } catch (err) {
      if (!err?.isAuthError) {
        setNotice({ tone: 'error', text: 'We could not create your order. Please try again.' });
      }
      finish();
      return;
    }

    // ---- 3. open Razorpay and wait for the payment ----
    let response;
    try {
      setStage('paying');
      response = await payWithRazorpay({
        order,
        prefill: { name: address.name, email: user?.email, contact: address.phone },
      });
    } catch (err) {
      if (err?.type === 'dismissed') {
        setNotice({
          tone: 'info',
          text: 'Payment cancelled. Your cart is safe, you can try again whenever you are ready.',
        });
      } else {
        setNotice({
          tone: 'error',
          text: err?.name === 'PaymentError' ? err.message : 'Something went wrong with the payment. Please try again.',
        });
      }
      finish();
      return;
    }

    // ---- 4. tell the server the payment happened ----
    try {
      setStage('confirming');
      await verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
    } catch (err) {
      if (!err?.isAuthError) {
        setUnconfirmed(true);
        setNotice({
          tone: 'error',
          link: true,
          text: 'Your payment went through, but we could not confirm it yet. Please do not pay again. Check My orders in a minute.',
        });
      }
      finish();
      return;
    }

    // ---- 5. done ----
    pendingOrder.current = null;
    navigate('/orders', { state: { justPaid: true } });
    clearCart(); // the server already emptied it; this just updates the screen
  };

  // ---- states before the page can render ----
  if (loading || cartLoading || !ready) {
    return <div className="container-x py-24 text-center text-muted">Loading your order…</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <ShoppingBag className="mx-auto size-12 text-muted" />
        <h1 className="mt-4 font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-muted">Add some dishes before you check out.</p>
        <Link to="/explore" className="btn btn-primary mt-6">Browse the menu</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink">
        <ArrowLeft className="size-4" /> Back to cart
      </Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Checkout</h1>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        {/* ---------------- left column ---------------- */}
        <div className="space-y-6">
          {/* 1. Delivery address */}
          <SectionCard id="address-section" step="1" title="Delivery address">
            {addresses.length > 0 && (
              <>
                <p className="mb-3 text-sm text-muted">Choose one of your saved addresses</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {addresses.map((a) => {
                    const selected = !adding && selectedId === a.id;
                    const Icon = LABELS.find((l) => l.name === a.label)?.icon || MapPin;
                    return (
                      <li key={a.id} className="relative">
                        <button
                          type="button"
                          onClick={() => pickSaved(a.id)}
                          aria-pressed={selected}
                          className={`flex h-full w-full gap-3 rounded-xl border p-4 pr-12 text-left transition duration-200 active:scale-[0.99] ${
                            selected
                              ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                              : 'border-line hover:border-brand/40 hover:bg-ink/5'
                          }`}
                        >
                          <span
                            className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition ${
                              selected ? 'border-brand bg-brand text-white' : 'border-line'
                            }`}
                          >
                            {selected && <Check className="size-3" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-sm font-bold">
                              <Icon className="size-4 text-brand" /> {a.label}
                            </span>
                            <span className="mt-1 block text-sm">{a.name} · {a.phone}</span>
                            <span className="mt-0.5 block text-sm text-muted">{formatAddress(a)}</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSaved(a.id)}
                          aria-label={`Delete ${a.label} address`}
                          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted transition hover:bg-red-500/10 hover:text-red-600 active:scale-90"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {!adding && (
                  <button type="button" onClick={startAdding} className="btn btn-outline mt-4">
                    <Plus className="size-4" /> Add a new address
                  </button>
                )}
              </>
            )}

            {adding && (
              <div className={addresses.length > 0 ? 'mt-5 border-t border-line pt-5' : ''}>
                {addresses.length > 0 && <p className="mb-4 font-semibold">New address</p>}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errors.name}>
                    <input
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      autoComplete="name"
                      className={`input ${errors.name ? 'border-red-500' : ''}`}
                    />
                  </Field>
                  <Field label="Mobile number" error={errors.phone}>
                    <input
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="10-digit number"
                      className={`input ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </Field>
                  <Field label="House no., building, street" error={errors.line1} className="sm:col-span-2">
                    <input
                      value={form.line1}
                      onChange={(e) => setField('line1', e.target.value)}
                      autoComplete="street-address"
                      className={`input ${errors.line1 ? 'border-red-500' : ''}`}
                    />
                  </Field>
                  <Field label="Landmark (optional)" className="sm:col-span-2">
                    <input
                      value={form.landmark}
                      onChange={(e) => setField('landmark', e.target.value)}
                      placeholder="Near temple, opposite mall…"
                      className="input"
                    />
                  </Field>
                  <Field label="City" error={errors.city}>
                    <input
                      value={form.city}
                      onChange={(e) => setField('city', e.target.value)}
                      autoComplete="address-level2"
                      className={`input ${errors.city ? 'border-red-500' : ''}`}
                    />
                  </Field>
                  <Field label="Pincode" error={errors.pincode}>
                    <input
                      value={form.pincode}
                      onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      className={`input ${errors.pincode ? 'border-red-500' : ''}`}
                    />
                  </Field>
                </div>

                <fieldset className="mt-5">
                  <legend className="text-sm font-medium">Save as</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LABELS.map(({ name, icon: Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setField('label', name)}
                        aria-pressed={form.label === name}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 ${
                          form.label === name
                            ? 'border-brand bg-brand/10 text-brand'
                            : 'border-line text-muted hover:border-brand/40 hover:text-ink'
                        }`}
                      >
                        <Icon className="size-4" /> {name}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={saveForLater}
                    onChange={(e) => setSaveForLater(e.target.checked)}
                    className="size-4 accent-brand"
                  />
                  Save this address for my next order
                </label>

                {addresses.length > 0 && (
                  <button type="button" onClick={() => setAdding(false)} className="btn btn-ghost mt-4">
                    Cancel
                  </button>
                )}
              </div>
            )}
          </SectionCard>

          {/* 2. Note */}
          <SectionCard step="2" title="Delivery instructions">
            <Field label="Anything the restaurant or rider should know? (optional)">
              <textarea
                rows={3}
                maxLength={200}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Less spicy, ring the bell twice…"
                className="input resize-none"
              />
            </Field>
          </SectionCard>

          {/* 3. Payment */}
          <SectionCard step="3" title="Payment">
            <div className="flex items-center gap-4 rounded-xl border border-brand bg-brand/5 p-4 ring-2 ring-brand/20">
              <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                <CreditCard className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">Pay online</p>
                <p className="text-sm text-muted">UPI, cards, netbanking and wallets via Razorpay</p>
              </div>
              <span className="grid size-5 place-items-center rounded-full bg-brand text-white">
                <Check className="size-3" strokeWidth={3} />
              </span>
            </div>
          </SectionCard>
        </div>

        {/* ---------------- right column: summary ---------------- */}
        <aside className="rounded-2xl border border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold">Order summary</h2>

          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <img src={item.imageUrl} alt="" className="size-12 shrink-0 rounded-lg bg-ink/5 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted">{item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(cartTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
              <dt>To pay</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          {deliveryFee > 0 && (
            <p className="mt-3 rounded-lg bg-turmeric/15 px-3 py-2 text-xs">
              Add {formatPrice(FREE_DELIVERY_ABOVE - cartTotal)} more for free delivery.
            </p>
          )}

          {!adding && selectedAddress && (
            <p className="mt-4 flex items-start gap-2 text-xs text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                Delivering to <b className="text-ink">{selectedAddress.label}</b>: {formatAddress(selectedAddress)}
              </span>
            </p>
          )}

          {notice && (
            <div
              className={`mt-4 rounded-lg border px-3 py-2 text-sm ${NOTICE_STYLE[notice.tone] || NOTICE_STYLE.info}`}
              role={notice.tone === 'error' ? 'alert' : 'status'}
            >
              <p>{notice.text}</p>
              {notice.link && (
                <Link to="/orders" className="mt-2 inline-block font-semibold text-brand hover:underline">
                  Go to My orders
                </Link>
              )}
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={processing || unconfirmed}
            className="btn btn-primary mt-5 w-full py-3.5 text-base disabled:pointer-events-none disabled:opacity-70"
          >
            {processing ? (
              <><Loader2 className="size-5 animate-spin" /> {STAGE_TEXT[stage] || 'Processing…'}</>
            ) : (
              <><ShieldCheck className="size-5" /> Pay {formatPrice(total)}</>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-muted">Secure payment by Razorpay.</p>
        </aside>
      </div>
    </div>
  );
};

export default PlaceOrder;