import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Column 1: Logo & Description */}
        <div className="footer-col">
          <Link to="/" className="footer-logo">
            <span className="logo-accent">Watch</span>Time
          </Link>
          <p className="footer-desc">
            Your ultimate destination to discover movies, track your watchlist, and share honest reviews with a community of fans.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4>Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/auth">Sign In / Sign Up</Link></li>
            <li><Link to="/profile">My Profile</Link></li>
          </ul>
        </div>

        {/* Column 3: API Credit */}
        <div className="footer-col">
          <h4>Powered By</h4>
          <p className="footer-credit">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>

      </div>

      {/* Bottom Bar: Copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} WatchTime. All rights reserved.</p>
      </div>
    </footer>
  );
}