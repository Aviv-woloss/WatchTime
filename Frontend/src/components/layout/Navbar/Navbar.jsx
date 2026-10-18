import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchSpotlight from "../../SearchSpotlight/SearchSpotlight";
import "./Navbar.css";

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-left">
        <Link to="/" className="logo">
          <span className="logo-accent">Watch</span>Time
        </Link>
      </div>
      
      <div className="nav-center">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <SearchSpotlight query={searchQuery} onClose={() => setSearchQuery("")} />
        </div>
      </div>

      <div className="nav-right">
        {isLoggedIn ? (
          /* כאשר המשתמש מחובר, נציג רק את כפתור הפרופיל */
          <Link to="/profile" className="login-btn">Profile</Link>
        ) : (
          /* כאשר המשתמש מנותק, נציג את כפתור ההתחברות */
          <Link to="/auth" className="login-btn">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;