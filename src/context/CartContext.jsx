import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ORDER_TYPE } from '../constants';
import { getBusinessId } from '../lib/tenant';

const CartContext = createContext(null);
// Per-tenant key: the cart of one restaurant must never leak into another.
const storageKey = () => `kakros-cart-v1:${getBusinessId()}`;

function loadInitial() {
  try {
    const raw = sessionStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : { items: [], orderType: null, tableId: null };
  } catch {
    return { items: [], orderType: null, tableId: null };
  }
}

export function CartProvider({ children }) {
  const [state, setState] = useState(loadInitial);

  useEffect(() => {
    sessionStorage.setItem(storageKey(), JSON.stringify(state));
  }, [state]);

  /** Called once on landing when ?table= is present in the URL — locks
   *  orderType to DINE_IN and the table so the customer can't pick a
   *  different table mid-flow (product-11: "tidak boleh memilih meja lain
   *  jika sudah masuk melalui QR meja"). */
  function bindTable(tableId) {
    setState((s) => ({ ...s, tableId, orderType: ORDER_TYPE.DINE_IN }));
  }

  function setOrderType(orderType) {
    setState((s) => ({ ...s, orderType }));
  }

  function addItem(item) {
    // item: { productId, name, price, qty, modifiers, notes, station }
    setState((s) => ({ ...s, items: [...s.items, item] }));
  }

  function updateItemQty(index, qty) {
    setState((s) => {
      const items = [...s.items];
      if (qty <= 0) {
        items.splice(index, 1);
      } else {
        items[index] = { ...items[index], qty };
      }
      return { ...s, items };
    });
  }

  function removeItem(index) {
    setState((s) => ({ ...s, items: s.items.filter((_, i) => i !== index) }));
  }

  function clearCart() {
    setState({ items: [], orderType: null, tableId: null });
    sessionStorage.removeItem(storageKey());
  }

  const subtotal = useMemo(() => {
    return state.items.reduce((sum, item) => {
      const modifierTotal = (item.modifiers || []).reduce((s, m) => s + (m.priceDelta || 0), 0);
      return sum + (item.price + modifierTotal) * item.qty;
    }, 0);
  }, [state.items]);

  const itemCount = useMemo(
    () => state.items.reduce((n, item) => n + item.qty, 0),
    [state.items]
  );

  const value = { ...state, subtotal, itemCount, bindTable, setOrderType, addItem, updateItemQty, removeItem, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>');
  return ctx;
}
