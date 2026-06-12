import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProduct } from '../services/api';
import { toast } from 'react-toastify';
import { FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';
import './AddProduct.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CATEGORIES = ['Saree', 'Kurti', 'Lehenga', 'Gown', 'Suit', 'Dress', 'Other'];

const empty = {
  name: '', description: '', price: '', discount: '0',
  category: 'Kurti', stock: '', sizes: [], colors: '',
  tags: '', isFeatured: false,
};

export default function AddProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(empty);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (isEdit) {
    getProduct(id).then(res => {
      const p = res.data;
      setForm({
        name: p.name, description: p.description, price: p.price,
        discount: p.discount, category: p.category, stock: p.stock,
        sizes: p.sizes || [], colors: p.colors?.join(', ') || '',
        tags: p.tags?.join(', ') || '', isFeatured: p.isFeatured,
      });
      setExistingImages(p.images || []);
    });
  }
}, [id, isEdit]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('discount', form.discount);
      formData.append('category', form.category);
      formData.append('stock', form.stock);
      formData.append('isFeatured', form.isFeatured);
      formData.append('sizes', JSON.stringify(form.sizes));
      formData.append('colors', JSON.stringify(form.colors.split(',').map(c => c.trim()).filter(Boolean)));
      formData.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      images.forEach(img => formData.append('images', img));

      if (isEdit) {
        await updateProduct(id, formData);
        toast.success('Product updated!');
      } else {
        await createProduct(formData);
        toast.success('Product added!');
      }
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally { setLoading(false); }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-header">
        <button className="back-btn" onClick={() => navigate('/admin')}><FiArrowLeft /> Back</button>
        <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-layout">
          {/* Left Column */}
          <div className="form-left">
            <div className="form-card">
              <h3>Product Details</h3>
              <div className="form-group">
                <label>Product Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Beautiful Banarasi Saree" required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the dress — fabric, occasion, design details..." rows={5} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="999" required min="1" />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })}
                    placeholder="0" min="0" max="90" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    placeholder="50" required min="0" />
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3>Variants</h3>
              <div className="form-group">
                <label>Available Sizes</label>
                <div className="sizes-grid">
                  {SIZES.map(s => (
                    <button key={s} type="button"
                      className={`size-btn ${form.sizes.includes(s) ? 'active' : ''}`}
                      onClick={() => toggleSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Colors <small>(comma separated)</small></label>
                <input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })}
                  placeholder="Red, Blue, Green, Yellow" />
              </div>
              <div className="form-group">
                <label>Tags <small>(comma separated)</small></label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="wedding, traditional, festive, cotton" />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={form.isFeatured}
                    onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
                  Mark as Featured Product (shows on homepage)
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="form-right">
            <div className="form-card">
              <h3>Product Images</h3>
              <p className="image-hint">Upload up to 5 images. First image will be the main display image.</p>

              {/* Existing images (edit mode) */}
              {existingImages.length > 0 && (
                <div className="existing-images">
                  <p><strong>Current Images:</strong></p>
                  <div className="image-previews">
                    {existingImages.map((img, i) => (
                      <div key={i} className="image-preview">
                        <img src={`http://localhost:5000${img}`} alt={`existing ${i}`} />
                        <span className="image-label">Current</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload area */}
              <label className="upload-area">
                <FiUpload size={32} color="#e91e8c" />
                <p>Click to upload images</p>
                <small>JPG, PNG, WEBP — Max 5MB each</small>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
              </label>

              {/* New image previews */}
              {previews.length > 0 && (
                <div className="image-previews">
                  {previews.map((src, i) => (
                    <div key={i} className="image-preview">
                      <img src={src} alt={`preview ${i}`} />
                      <button type="button" className="remove-image" onClick={() => removeNewImage(i)}><FiX /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Preview */}
            {form.price && (
              <div className="form-card price-preview">
                <h3>Price Preview</h3>
                <div className="preview-price">
                  <span className="preview-final">
                    ₹{(form.price - (form.price * form.discount / 100)).toFixed(0)}
                  </span>
                  {form.discount > 0 && (
                    <>
                      <span className="preview-original">₹{form.price}</span>
                      <span className="preview-discount">{form.discount}% OFF</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-submit">
          <button type="button" className="cancel-btn" onClick={() => navigate('/admin')}>Cancel</button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}