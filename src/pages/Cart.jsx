import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import './Cart.css';

export default function Cart() {
  const { cart, cartTotal, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (!cart.items?.length) return (
    <div className="empty-cart">
      <FiShoppingBag size={64} color="#dee2e6" />
      <h2>Your cart is empty</h2>
      <p>Add some beautiful dresses to your cart!</p>
      <button onClick={() => navigate('/shop')}>Shop Now</button>
    </div>
  );

  const savings = cart.items?.reduce((a, i) => {
    const p = i.productId;
    if (!p) return a;
    return a + (p.price * p.discount / 100) * i.quantity;
  }, 0) || 0;

  return (
    <div className="cart-page">
      <h1>Shopping Cart ({cart.items.length} items)</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map(item => {
            const p = item.productId;
            if (!p) return null;
            const price = p.price - (p.price * p.discount / 100);
            return (
              <div key={item._id} className="cart-item">
                <img src={p.images?.[0] || 'https://via.placeholder.com/100x120'} alt={p.name} />
                <div className="cart-item-info">
                  <h3>{p.name}</h3>
                  <p className="cart-item-meta">{item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}</p>
                  <div className="cart-item-price">
                    <span className="cart-price">₹{(price * item.quantity).toFixed(0)}</span>
                    {p.discount > 0 && <span className="cart-original">₹{(p.price * item.quantity).toFixed(0)}</span>}
                    {p.discount > 0 && <span className="cart-saving">{p.discount}% off</span>}
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-ctrl">
                    <button onClick={() => updateItem(item._id, item.quantity - 1)}><FiMinus /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateItem(item._id, item.quantity + 1)}><FiPlus /></button>
                  </div>
                  <button className="remove-btn" onClick={() => removeItem(item._id)}><FiTrash2 /></button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{(cartTotal + savings).toFixed(0)}</span></div>
          <div className="summary-row green"><span>Discount</span><span>-₹{savings.toFixed(0)}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{cartTotal >= 999 ? <span className="free">FREE</span> : '₹49'}</span></div>
          <div className="summary-divider" />
          <div className="summary-row total"><span>Total</span><span>₹{(cartTotal + (cartTotal >= 999 ? 0 : 49)).toFixed(0)}</span></div>
          {savings > 0 && <p className="savings-msg">🎉 You're saving ₹{savings.toFixed(0)} on this order!</p>}
          <button className="checkout-btn" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
}