import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?search=${search}`);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const categories = ['Saree', 'Kurti', 'Lehenga', 'Gown', 'Suit', 'Dress'];

  return (
    <nav className="navbar">
      <div className="nav-top">
        <Link to="/" className="nav-logo">👗 DressStore</Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <input placeholder="Search dresses..." value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit"><FiSearch /></button>
        </form>

        <div className="nav-actions">
          {user ? (
            <div className="nav-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <FiUser /> <span>{user.name.split(' ')[0]}</span>
              {dropdownOpen && (
                <div className="dropdown">
                  {user.role === 'admin' ? (
                    <>
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}><FiSettings /> Dashboard</Link>
                      <Link to="/admin/add-product" onClick={() => setDropdownOpen(false)}><FiPackage /> Add Product</Link>
                    </>
                  ) : (
                    <Link to="/orders" onClick={() => setDropdownOpen(false)}><FiPackage /> My Orders</Link>
                  )}
                  <button onClick={handleLogout}><FiLogOut /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-login-btn">Login</Link>
          )}

          {user?.role !== 'admin' && (
            <Link to="/cart" className="nav-cart">
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}

          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      <div className={`nav-categories ${menuOpen ? 'open' : ''}`}>
        <Link to="/shop" onClick={() => setMenuOpen(false)}>All</Link>
        {categories.map(c => (
          <Link key={c} to={`/shop?category=${c}`} onClick={() => setMenuOpen(false)}>{c}</Link>
        ))}
      </div>
    </nav>
  );
}