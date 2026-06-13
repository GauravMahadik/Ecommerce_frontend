import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, getAllOrders, updateOrderStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiPackage,
  FiShoppingBag, FiUsers, FiDollarSign,
  FiLogOut, FiHome
} from 'react-icons/fi';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 100 }),
      getAllOrders()
    ]).then(([pRes, oRes]) => {
      setProducts(pRes.data.products);
      setOrders(oRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Error deleting'); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success('Status updated');
    } catch { toast.error('Error updating status'); }
  };

  const stats = {
    products: products.length,
    orders: orders.length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + (o.finalAmount || 0), 0),
    pending: orders.filter(o => o.status === 'pending').length,
  };

  const statusOptions = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

  const statusColors = {
    pending: '#ff9800', confirmed: '#2196f3', shipped: '#9c27b0',
    out_for_delivery: '#e91e8c', delivered: '#4caf50', cancelled: '#f44336',
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">👗 Sani Fashion</div>
        <nav className="admin-nav">
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
            <FiShoppingBag /> Products
          </button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            <FiPackage /> Orders
            {stats.pending > 0 && <span className="badge">{stats.pending}</span>}
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="sidebar-link"><FiHome /> View Store</Link>
          <button className="sidebar-logout" onClick={() => { logout(); navigate('/login'); }}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1>{activeTab === 'products' ? 'Products' : 'Orders'}</h1>
          <div className="admin-user">Welcome, {user?.name}</div>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="stat-card blue"><FiShoppingBag /><div><p>Products</p><h3>{stats.products}</h3></div></div>
          <div className="stat-card pink"><FiPackage /><div><p>Total Orders</p><h3>{stats.orders}</h3></div></div>
          <div className="stat-card green"><FiDollarSign /><div><p>Revenue</p><h3>₹{stats.revenue.toLocaleString()}</h3></div></div>
          <div className="stat-card yellow"><FiUsers /><div><p>Pending</p><h3>{stats.pending}</h3></div></div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="section-actions">
              <h2>All Products</h2>
              <Link to="/admin/add-product" className="add-btn"><FiPlus /> Add Product</Link>
            </div>
            {loading ? <p>Loading...</p> : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id}>
                        <td>
                          <img
                            src={p.images?.[0] || 'https://via.placeholder.com/50'}
                            alt={p.name} className="product-thumb"
                          />
                        </td>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="category-tag">{p.category}</span></td>
                        <td>₹{p.price}</td>
                        <td>{p.discount > 0 ? <span className="discount-tag">{p.discount}%</span> : '—'}</td>
                        <td>{p.stock}</td>
                        <td>⭐ {p.ratings?.toFixed(1) || '0.0'}</td>
                        <td>
                          <div className="action-btns">
                            <Link to={`/admin/edit-product/${p._id}`} className="edit-btn"><FiEdit2 /></Link>
                            <button className="delete-btn" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

       {activeTab === 'orders' && (
  <div className="admin-section">
    <h2>All Orders</h2>
    {loading ? <p>Loading...</p> : (
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td><strong>#{order._id.slice(-6).toUpperCase()}</strong></td>
                <td>
                  <p><strong>{order.userId?.name}</strong></p>
                  <small>{order.userId?.email}</small>
                </td>
                <td>
                  
                  <small>{order.shippingAddress?.phone}</small>
                  <small style={{display:'block'}}>{order.shippingAddress?.street}</small>
                  <small>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</small>
                </td>
                <td>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{marginBottom:4}}>
                      <small><strong>{item.name}</strong></small><br/>
                      <small>Qty: {item.quantity} | Size: {item.size || '—'}</small><br/>
                      <small>₹{(item.price * item.quantity).toFixed(0)}</small>
                    </div>
                  ))}
                </td>
                <td><strong>₹{order.finalAmount}</strong></td>
                <td>{order.paymentMethod}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className="order-status" style={{ background: statusColors[order.status] }}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={e => handleStatusUpdate(order._id, e.target.value)}
                    className="status-select"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
      </main>
    </div>
  );
}