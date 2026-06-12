import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') fetchCart();
    else setCart({ items: [] });
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/api/cart');
      setCart(data);
    } catch {}
  };

  const addToCart = async (productId, quantity, size, color) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/cart', { productId, quantity, size, color });
      setCart(data);
      return true;
    } catch { return false; }
    finally { setLoading(false); }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const { data } = await axios.put(`/api/cart/${itemId}`, { quantity });
      setCart(data);
    } catch {}
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`/api/cart/${itemId}`);
      setCart(prev => ({ ...prev, items: prev.items.filter(i => i._id !== itemId) }));
    } catch {}
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart/clear');
      setCart({ items: [] });
    } catch {}
  };

  const cartCount = cart.items?.reduce((a, i) => a + i.quantity, 0) || 0;

  const cartTotal = cart.items?.reduce((a, i) => {
    const p = i.productId;
    if (!p) return a;
    const price = p.price - (p.price * p.discount / 100);
    return a + price * i.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, loading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);