import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/api';
import { toast } from 'react-toastify';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const delivery = cartTotal >= 999 ? 0 : 49;
  const finalAmount = cartTotal + delivery;

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = cart.items.map(i => ({
        productId: i.productId._id,
        name: i.productId.name,
        image: i.productId.images?.[0],
        price: i.productId.price - (i.productId.price * i.productId.discount / 100),
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      }));
      const order = await placeOrder({ items, shippingAddress: address, paymentMethod, totalAmount: cartTotal, discount: 0, finalAmount });
      await clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${order.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error placing order');
    } finally { setLoading(false); }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form onSubmit={handleOrder} className="checkout-form">
          <div className="checkout-section">
            <h3>Delivery Address</h3>
            <div className="form-grid">
              {[['name','Full Name'],['phone','Phone Number'],['street','Street Address'],['city','City'],['state','State'],['pincode','Pincode']].map(([field, label]) => (
                <div key={field} className={`form-group ${field === 'street' ? 'full' : ''}`}>
                  <label>{label}</label>
                  <input value={address[field]} onChange={e => setAddress({ ...address, [field]: e.target.value })}
                    required placeholder={label} />
                </div>
              ))}
            </div>
          </div>

          <div className="checkout-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
                <input type="radio" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                💵 Cash on Delivery
              </label>
              <label className={`payment-option ${paymentMethod === 'Online' ? 'active' : ''}`}>
                <input type="radio" value="Online" checked={paymentMethod === 'Online'} onChange={() => setPaymentMethod('Online')} />
                💳 Online Payment
              </label>
            </div>
            {paymentMethod === 'Online' && <p className="coming-soon">Online payment integration coming soon. Please use COD.</p>}
          </div>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? 'Placing Order...' : `Place Order — ₹${finalAmount.toFixed(0)}`}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {cart.items?.map(item => {
            const p = item.productId;
            if (!p) return null;
            const price = p.price - (p.price * p.discount / 100);
            return (
              <div key={item._id} className="summary-item">
                <img src={p.images?.[0] || 'https://via.placeholder.com/60'} alt={p.name} />
                <div>
                  <p>{p.name}</p>
                  <small>{item.size} | Qty: {item.quantity}</small>
                </div>
                <span>₹{(price * item.quantity).toFixed(0)}</span>
              </div>
            );
          })}
          <div className="summary-divider" />
          <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toFixed(0)}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{finalAmount.toFixed(0)}</span></div>
        </div>
      </div>
    </div>
  );
}