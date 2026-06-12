import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiX } from 'react-icons/fi';
import './Shop.css';

const categories = ['Saree', 'Kurti', 'Lehenga', 'Gown', 'Suit', 'Dress', 'Other'];
const sortOptions = [
  { value: '', label: 'Latest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const page = searchParams.get('page') || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    setLoading(true);
    getProducts({ category, search, sort, page, minPrice, maxPrice, limit: 12 })
      .then(res => {
        setProducts(res.data.products);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }).finally(() => setLoading(false));
  }, [category, search, sort, page, minPrice, maxPrice]);

  const setParam = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params[key] = value; else delete params[key];
    delete params.page;
    setSearchParams(params);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div>
          <h1>All Dresses</h1>
          <p>{total} products found {search && `for "${search}"`} {category && `in ${category}`}</p>
        </div>
        <div className="shop-controls">
          <select value={sort} onChange={e => setParam('sort', e.target.value)} className="sort-select">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="filter-toggle-btn" onClick={() => setFilterOpen(!filterOpen)}>
            <FiFilter /> Filters
          </button>
        </div>
      </div>

      <div className="shop-layout">
        {/* Filters Sidebar */}
        <aside className={`filters-sidebar ${filterOpen ? 'open' : ''}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            <button onClick={() => setFilterOpen(false)}><FiX /></button>
          </div>

          <div className="filter-group">
            <h4>Category</h4>
            <div className="filter-options">
              <label>
                <input type="radio" name="cat" checked={!category} onChange={() => setParam('category', '')} />
                All
              </label>
              {categories.map(c => (
                <label key={c}>
                  <input type="radio" name="cat" checked={category === c} onChange={() => setParam('category', c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input type="number" placeholder="Min ₹" value={minPrice}
                onChange={e => setParam('minPrice', e.target.value)} />
              <span>—</span>
              <input type="number" placeholder="Max ₹" value={maxPrice}
                onChange={e => setParam('maxPrice', e.target.value)} />
            </div>
          </div>

          <button className="clear-filters-btn" onClick={() => setSearchParams({})}>Clear All Filters</button>
        </aside>

        {/* Products Grid */}
        <div className="shop-products">
          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" style={{ height: 320 }} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>😕 No products found</p>
              <button onClick={() => setSearchParams({})}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {pages > 1 && (
                <div className="pagination">
                  {[...Array(pages)].map((_, i) => (
                    <button key={i} className={+page === i + 1 ? 'active' : ''}
                      onClick={() => setParam('page', i + 1)}>{i + 1}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}