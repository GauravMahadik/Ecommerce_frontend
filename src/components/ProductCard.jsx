import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const discountedPrice = product.price - (product.price * product.discount / 100);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Please login to add to cart'); return; }
    const success = await addToCart(
      product._id, 1,
      product.sizes?.[0],
      product.colors?.[0]
    );
    if (success) toast.success('Added to cart!');
    else toast.error('Error adding to cart');
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={product.name}
          className="product-image"
        />
        {product.discount > 0 && (
          <span className="discount-badge">{product.discount}% OFF</span>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <div className="product-rating">
          <FiStar fill="#ffc107" color="#ffc107" />
          <span>{product.ratings?.toFixed(1) || '0.0'}</span>
          <span className="review-count">({product.numReviews})</span>
        </div>
        <div className="product-price">
          <span className="final-price">₹{discountedPrice.toFixed(0)}</span>
          {product.discount > 0 && (
            <span className="original-price">₹{product.price}</span>
          )}
        </div>
        {user?.role !== 'admin' && (
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            <FiShoppingCart /> Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
}