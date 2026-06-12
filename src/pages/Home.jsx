import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts, getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const categories = [
  { name: 'Saree', emoji: '🥻', color: '#fce4ec' },
  { name: 'Kurti', emoji: '👘', color: '#e8f5e9' },
  { name: 'Lehenga', emoji: '👗', color: '#e3f2fd' },
  { name: 'Gown', emoji: '✨', color: '#f3e5f5' },
  { name: 'Suit', emoji: '🎽', color: '#fff3e0' },
  { name: 'Dress', emoji: '💃', color: '#e0f7fa' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFeaturedProducts(),
      getProducts({ limit: 8, sort: 'newest' })
    ]).then(([featRes, newRes]) => {
      setFeatured(featRes.data);
      setNewArrivals(newRes.data.products);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero Banner */}
      <div className="hero">
        <div className="hero-content">
          <h1>Beautiful Dresses<br />for Every Occasion</h1>
          <p>Handcrafted with love — Sarees, Kurtis, Lehengas & more</p>
          <div className="hero-btns">
            <Link to="/shop" className="btn-primary">Shop Now</Link>
            <Link to="/shop?category=Lehenga" className="btn-outline">View Collection</Link>
          </div>
        </div>
        <div className="hero-badge">
          <span>NEW</span>
          <span>COLLECTION</span>
          <span>2024</span>
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <Link to="/shop">View All →</Link>
        </div>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link
              key={cat.name}
              to={`/shop?category=${cat.name}`}
              className="category-card"
              style={{ background: cat.color }}
            >
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>⭐ Featured Collection</h2>
            <Link to="/shop">View All →</Link>
          </div>
          {loading ? (
            <div className="loading-grid">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>
      )}

      {/* New Arrivals */}
      <section className="section">
        <div className="section-header">
          <h2>🆕 New Arrivals</h2>
          <Link to="/shop">View All →</Link>
        </div>
        {loading ? (
          <div className="loading-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          <div className="products-grid">
            {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Banner Strip */}
      <div className="banner-strip">
        <div className="banner-item">🚚 Free Delivery on orders above ₹999</div>
        <div className="banner-item">↩️ Easy 7-day Returns</div>
        <div className="banner-item">✅ 100% Genuine Products</div>
        <div className="banner-item">💳 Cash on Delivery Available</div>
      </div>
    </div>
  );
}