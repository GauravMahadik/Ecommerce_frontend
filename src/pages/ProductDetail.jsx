import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getReviews, addReview } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiStar, FiShoppingCart, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    getProduct(id).then(res => {
      setProduct(res.data);
      if (res.data.sizes?.length) setSelectedSize(res.data.sizes[0]);
      if (res.data.colors?.length) setSelectedColor(res.data.colors[0]);
    });
    getReviews(id).then(res => setReviews(res.data));
  }, [id]);

  const discountedPrice = product ? product.price - (product.price * product.discount / 100) : 0;

  const handleAddToCart = async () => {
    if (!user) { toast.info('Please login'); navigate('/login'); return; }
    const success = await addToCart(product._id, quantity, selectedSize, selectedColor);
    if (success) toast.success('Added to cart!');
  };

  const handleBuyNow = async () => {
    if (!user) { toast.info('Please login'); navigate('/login'); return; }
    await addToCart(product._id, quantity, selectedSize, selectedColor);
    navigate('/cart');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      const res = await addReview(id, reviewForm);
      setReviews(prev => [res.data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  if (!product) return <div className="loading-page">Loading...</div>;

  return (
    <div className="product-detail">
      <div className="detail-container">
        {/* Images */}
        <div className="detail-images">
          <div className="thumbnails">
            {product.images?.map((img, i) => (
             <img
               src={img}
              alt={`product view ${i + 1}`}
               className={selectedImage === i ? 'active' : ''}
               onClick={() => setSelectedImage(i)}
             />
            ))}
          </div>
          <div className="main-image">
            <img
           src={product.images?.[selectedImage] || 'https://via.placeholder.com/500x600?text=No+Image'}
           alt={product.name}
          />
            {product.discount > 0 && <span className="detail-badge">{product.discount}% OFF</span>}
          </div>
        </div>

        {/* Info */}
        <div className="detail-info">
          <p className="detail-category">{product.category}</p>
          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-rating">
            {[1,2,3,4,5].map(s => (
              <FiStar key={s} fill={s <= product.ratings ? '#ffc107' : 'none'} color="#ffc107" />
            ))}
            <span>{product.ratings?.toFixed(1)}</span>
            <span className="review-count">({product.numReviews} reviews)</span>
          </div>

          <div className="detail-price">
            <span className="detail-final-price">₹{discountedPrice.toFixed(0)}</span>
            {product.discount > 0 && (
              <>
                <span className="detail-original-price">₹{product.price}</span>
                <span className="detail-discount-text">{product.discount}% off</span>
              </>
            )}
          </div>

          {product.sizes?.length > 0 && (
            <div className="detail-option">
              <h4>Size: <span>{selectedSize}</span></h4>
              <div className="options-row">
                {product.sizes.map(s => (
                  <button key={s} className={`option-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="detail-option">
              <h4>Color: <span>{selectedColor}</span></h4>
              <div className="options-row">
                {product.colors.map(c => (
                  <button key={c} className={`option-btn ${selectedColor === c ? 'active' : ''}`}
                    onClick={() => setSelectedColor(c)}>{c}</button>
                ))}
              </div>
            </div>
          )}

          <div className="detail-option">
            <h4>Quantity</h4>
            <div className="qty-control">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

          {user?.role !== 'admin' && (
            <div className="detail-actions">
              <button className="btn-add-cart" onClick={handleAddToCart}><FiShoppingCart /> Add to Cart</button>
              <button className="btn-buy-now" onClick={handleBuyNow}>Buy Now</button>
            </div>
          )}

          <div className="detail-features">
            <div className="feature"><FiTruck /> Free delivery above ₹999</div>
            <div className="feature"><FiRefreshCw /> Easy 7-day returns</div>
            <div className="feature"><FiShield /> 100% genuine product</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <div className="tabs-header">
          {['description', 'reviews'].map(tab => (
            <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'reviews' && `(${reviews.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="tab-content">
            <p>{product.description}</p>
            {product.tags?.length > 0 && (
              <div className="tags-row">
                {product.tags.map(t => <span key={t} className="tag">#{t}</span>)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="tab-content">
            {user && user.role !== 'admin' && (
              <form onSubmit={handleReview} className="review-form">
                <h4>Write a Review</h4>
                <div className="star-select">
                  {[1,2,3,4,5].map(s => (
                    <FiStar key={s} fill={s <= reviewForm.rating ? '#ffc107' : 'none'}
                      color="#ffc107" style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })} />
                  ))}
                </div>
                <textarea placeholder="Share your experience..." value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={3} required />
                <button type="submit">Submit Review</button>
              </form>
            )}
            <div className="reviews-list">
              {reviews.length === 0 ? <p>No reviews yet. Be the first!</p> : reviews.map(r => (
                <div key={r._id} className="review-card">
                  <div className="review-header">
                    <strong>{r.userId?.name}</strong>
                    <div className="review-stars">
                      {[1,2,3,4,5].map(s => <FiStar key={s} fill={s <= r.rating ? '#ffc107' : 'none'} color="#ffc107" size={14} />)}
                    </div>
                    <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p>{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}