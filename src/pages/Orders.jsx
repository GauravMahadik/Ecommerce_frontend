import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyOrders, getOrderById, cancelOrder } from '../services/api';
import { toast } from 'react-toastify';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import './Orders.css';

const statusConfig = {
  pending: { icon: <FiClock />, color: '#ff9800', label: 'Order Placed' },
  confirmed: { icon: <FiCheckCircle />, color: '#2196f3', label: 'Confirmed' },
  shipped: { icon: <FiTruck />, color: '#9c27b0', label: 'Shipped' },
  out_for_delivery: { icon: <FiTruck />, color: '#e91e8c', label: 'Out for Delivery' },
  delivered: { icon: <FiCheckCircle />, color: '#4caf50', label: 'Delivered' },
  cancelled: { icon: <FiXCircle />, color: '#f44336', label: 'Cancelled' },
};

export default function Orders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getOrderById(id).then(res => setSelectedOrder(res.data)).finally(() => setLoading(false));
    } else {
      getMyOrders().then(res => setOrders(res.data)).finally(() => setLoading(false));
    }
  }, [id]);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(orderId);
      toast.success('Order cancelled');
      if (id) getOrderById(id).then(res => setSelectedOrder(res.data));
      else getMyOrders().then(res => setOrders(res.data));
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  if (loading) return <div className="loading-page">Loading...</div>;

  if (id && selectedOrder) {
    const cfg = statusConfig[selectedOrder.status];
    return (
      <div className="order-detail-page">
        <button className="back-btn" onClick={() => navigate('/orders')}>← Back to Orders</button>
        <div className="order-detail-header">
          <div>
            <h1>Order #{selectedOrder._id.slice(-8).toUpperCase()}</h1>
            <p>{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className="order-status-badge" style={{ background: cfg?.color }}>{cfg?.label}</span>
        </div>

        {/* Tracking */}
        <div className="tracking-card">
          <h3>Order Tracking</h3>
          <div className="tracking-timeline">
            {selectedOrder.trackingHistory?.map((t, i) => (
              <div key={i} className="tracking-step">
                <div className="tracking-dot" style={{ background: statusConfig[t.status]?.color || '#e91e8c' }} />
                <div>
                  <p className="tracking-status">{statusConfig[t.status]?.label || t.status}</p>
                  <p className="tracking-msg">{t.message}</p>
                  <p className="tracking-time">{new Date(t.time).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="order-items-card">
          <h3>Items Ordered</h3>
          {selectedOrder.items?.map((item, i) => (
            <div key={i} className="order-item">
              <img src={item.image ? `http://localhost:5000${item.image}` : 'https://via.placeholder.com/70'} alt={item.name} />
              <div>
                <p>{item.name}</p>
                <small>{item.size && `Size: ${item.size}`} {item.color && `| ${item.color}`} | Qty: {item.quantity}</small>
              </div>
              <span>₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="order-total-row">
            <span>Total Paid</span>
            <span>₹{selectedOrder.finalAmount?.toFixed(0)}</span>
          </div>
        </div>

        {/* Address */}
        <div className="address-card">
          <h3>Delivery Address</h3>
          <p><strong>{selectedOrder.shippingAddress?.name}</strong></p>
          <p>{selectedOrder.shippingAddress?.street}</p>
          <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} — {selectedOrder.shippingAddress?.pincode}</p>
          <p>📱 {selectedOrder.shippingAddress?.phone}</p>
        </div>

        {['pending', 'confirmed'].includes(selectedOrder.status) && (
          <button className="cancel-order-btn" onClick={() => handleCancel(selectedOrder._id)}>Cancel Order</button>
        )}
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-orders">
          <FiPackage size={64} color="#dee2e6" />
          <h2>No orders yet</h2>
          <button onClick={() => navigate('/shop')}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const cfg = statusConfig[order.status];
            return (
              <div key={order._id} className="order-card" onClick={() => navigate(`/orders/${order._id}`)}>
                <div className="order-card-header">
                  <div>
                    <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="order-status-badge" style={{ background: cfg?.color }}>{cfg?.label}</span>
                </div>
                <div className="order-card-items">
                  {order.items?.slice(0, 2).map((item, i) => (
                    <div key={i} className="order-card-item">
                      <img src={item.image || 'https://via.placeholder.com/70'} alt={item.name} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                  {order.items?.length > 2 && <span className="more-items">+{order.items.length - 2} more</span>}
                </div>
                <div className="order-card-footer">
                  <span>₹{order.finalAmount?.toFixed(0)}</span>
                  <span className="view-details">View Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}