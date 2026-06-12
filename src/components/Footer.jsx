import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>👗 DressStore</h2>
          <p>Beautiful handcrafted dresses for every occasion.</p>
        </div>
        <div className="footer-links">
          <h4>Shop</h4>
          {['Saree','Kurti','Lehenga','Gown'].map(c => (
            <Link key={c} to={`/shop?category=${c}`}>{c}</Link>
          ))}
        </div>
        <div className="footer-links">
          <h4>Help</h4>
          <Link to="/orders">My Orders</Link>
          <a href="#">Returns</a>
          <a href="#">Size Guide</a>
          <a href="#">Contact Us</a>
        </div>
        <div className="footer-links">
          <h4>Contact</h4>
          <p>📱 +91 9172530071</p>
          <p>📧 sani@gmail.com</p>

          <p>📍 Hadapsar,Dist. pune, Maharashtra</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 DressStore. All rights reserved.</p>
      </div>
    </footer>
  );
}