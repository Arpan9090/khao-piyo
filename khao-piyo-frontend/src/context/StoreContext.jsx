import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getFoods } from '../service/foodService.js';
import { addItem, clearServerCart, getServerCart, removeItem } from '../service/cartService.js';
import { getStoredAuth } from '../utils/authStorage.js';
import { useAuth } from './AuthContext.jsx';

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

const GUEST_KEY = 'kp-guest-cart';

const readGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || {};
  } catch {
    return {};
  }
};

const writeGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(cart));
  } catch {
    /* ignore */
  }
};

// The server can keep a food with quantity 0, so hide those lines
const normalize = (items = {}) =>
  Object.fromEntries(Object.entries(items).filter(([, qty]) => qty > 0));

export const StoreProvider = ({ children }) => {
  const { token } = useAuth();
  const isAuthed = Boolean(token);

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // cart = { [foodId]: quantity }. Guests: stored in this browser. Signed in: stored on the server.
  const [cart, setCart] = useState(() => (token ? {} : readGuestCart()));
  const [cartLoading, setCartLoading] = useState(Boolean(token));
  const [notice, setNotice] = useState('');

  const cartRef = useRef(cart); // always the latest cart, even between renders
  const queue = useRef(Promise.resolve()); // server calls run one after another
  const pending = useRef(0);
  const noticeTimer = useRef();

  const applyCart = useCallback((next) => {
    cartRef.current = next;
    setCart(next);
  }, []);

  const notify = useCallback((message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 4000);
  }, []);

  // ---------------- foods ----------------
  const fetchFoods = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setFoods(await getFoods());
    } catch (e) {
      setError('We could not load the menu. Check that the server is running and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  // ---------------- cart sync ----------------
  // Runs a server change in order. When the LAST queued change finishes, the screen
  // is set to the server's version. If one fails, the cart is reloaded from the server.
  const runServer = useCallback(
    (task) => {
      pending.current += 1;
      queue.current = queue.current
        .then(task)
        .then((data) => {
          if (pending.current === 1 && data?.items) applyCart(normalize(data.items));
        })
        .catch(async (err) => {
          if (err?.isAuthError || !getStoredAuth()?.token) return; // signed out meanwhile
          notify('Could not update your cart. Please try again.');
          try {
            const data = await getServerCart();
            if (pending.current === 1) applyCart(normalize(data.items));
          } catch {
            /* ignore */
          }
        })
        .finally(() => {
          pending.current -= 1;
        });
    },
    [applyCart, notify]
  );

  // Sign in  -> load the user's server cart and merge anything added while signed out.
  // Sign out -> go back to the (empty) guest cart, so the next visitor never sees it.
  useEffect(() => {
    if (!token) {
      applyCart(readGuestCart());
      setCartLoading(false);
      return undefined;
    }

    let cancelled = false;
    setCartLoading(true);
    pending.current += 1;
    queue.current = queue.current
      .then(async () => {
        const guest = readGuestCart();
        writeGuestCart({}); // cleared right away so it can never be merged twice
        let data = await getServerCart();
        for (const [foodId, qty] of Object.entries(guest)) {
          for (let i = 0; i < qty; i += 1) data = await addItem(foodId);
        }
        if (!cancelled) applyCart(normalize(data.items));
      })
      .catch((err) => {
        if (!err?.isAuthError && !cancelled) notify('Could not load your cart.');
      })
      .finally(() => {
        pending.current -= 1;
        if (!cancelled) setCartLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, applyCart, notify]);

  // ---------------- cart actions (same names as before) ----------------
  const addToCart = (id, qty = 1) => {
    const next = { ...cartRef.current, [id]: (cartRef.current[id] || 0) + qty };
    applyCart(next);
    if (isAuthed) {
      // The API adds one at a time
      runServer(async () => {
        let data;
        for (let i = 0; i < qty; i += 1) data = await addItem(id);
        return data;
      });
    } else {
      writeGuestCart(next);
    }
  };

  const decreaseFromCart = (id) => {
    const next = { ...cartRef.current, [id]: (cartRef.current[id] || 0) - 1 };
    if (next[id] <= 0) delete next[id];
    applyCart(next);
    if (isAuthed) runServer(() => removeItem(id));
    else writeGuestCart(next);
  };

  // Removes the whole line (the API removes one at a time)
  const removeFromCart = (id) => {
    const qty = cartRef.current[id] || 0;
    const next = { ...cartRef.current };
    delete next[id];
    applyCart(next);
    if (isAuthed) {
      if (qty > 0) {
        runServer(async () => {
          let data;
          for (let i = 0; i < qty; i += 1) data = await removeItem(id);
          return data;
        });
      }
    } else {
      writeGuestCart(next);
    }
  };

  const clearCart = () => {
    applyCart({});
    if (isAuthed) runServer(() => clearServerCart().then(() => ({ items: {} })));
    else writeGuestCart({});
  };

  const cartItems = useMemo(
    () => foods.filter((f) => cart[f.id]).map((f) => ({ ...f, quantity: cart[f.id] })),
    [foods, cart]
  );
  const cartCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, f) => sum + f.price * f.quantity, 0),
    [cartItems]
  );

  const value = {
    foods,
    loading,
    error,
    refetch: fetchFoods,
    cart,
    cartItems,
    cartCount,
    cartTotal,
    cartLoading,
    notice,
    addToCart,
    decreaseFromCart,
    removeFromCart,
    clearCart,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};