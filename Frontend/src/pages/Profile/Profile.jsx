import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("watchlist");

  // State עבור המשתמש והרשימות מהשרת
  const [user, setUser] = useState(null);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }

    // שליפת פרטי המשתמש המחובר והסרטים שלו במקביל מה-Backend
    const fetchProfileData = async () => {
      try {
        const [userRes, favRes, watchRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/user-movies/favorites'),
          fetch('/api/user-movies/watchlist')
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        } else {
          // אם הטוקן פג תוקף או שאינו מורשה
          localStorage.removeItem("isLoggedIn");
          navigate("/auth");
          return;
        }

        if (favRes.ok && watchRes.ok) {
          const favData = await favRes.json();
          const watchData = await watchRes.json();
          setFavoriteMovies(favData);
          setWatchlistMovies(watchData);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  // פונקציית יציאה מהחשבון
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  if (loading || !user) {
    return (
      <div className="profile-container">
        <div className="profile-content-wrapper" style={{ textAlign: "center", padding: "100px" }}>
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  // יצירת אווטאר דינמי לפי השם של המשתמש שנרשם
  const displayName = user.full_name || user.email.split("@")[0];
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=14b8a6&color=fff&size=128`;

  const currentList = activeTab === "watchlist" ? watchlistMovies : favoriteMovies;

  const handleRemoveMovie = async (tmdbId) => {
    const endpoint = activeTab === "watchlist" 
      ? `/api/user-movies/watchlist/${tmdbId}` 
      : `/api/user-movies/favorites/${tmdbId}`;

    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      if (res.ok) {
        // עדכון ה-State המקומי כך שהסרט יוסר מיד מהטבלה בדפדפן
        if (activeTab === "watchlist") {
          setWatchlistMovies(watchlistMovies.filter(m => m.tmdb_id !== tmdbId));
        } else {
          setFavoriteMovies(favoriteMovies.filter(m => m.tmdb_id !== tmdbId));
        }
      } else {
        console.error("Failed to remove movie");
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-content-wrapper">
        
        {/* אזור פרטי המשתמש האמיתיים מה-DB */}
        <div className="profile-header">
          <img src={avatarUrl} alt={displayName} className="profile-avatar" />
          <div className="profile-info">
            <h2>{displayName}</h2>
            <p className="profile-email">{user.email}</p>
            <p className="profile-date">Active Account</p>
          </div>
          
          <div className="profile-actions-wrapper">
            <button className="profile-logout-btn" onClick={handleLogout}>
              Logout
            </button>
            <div className="profile-stats">
              <div className="stat-box">
                <h3>{watchlistMovies.length}</h3>
                <span>Watchlist</span>
              </div>
              <div className="stat-box">
                <h3>{favoriteMovies.length}</h3>
                <span>Favorites</span>
              </div>
            </div>
          </div>
        </div>

        {/* טאבים לניווט בין הטבלאות */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === "watchlist" ? "active" : ""}`}
            onClick={() => setActiveTab("watchlist")}
          >
            My Watchlist
          </button>
          <button 
            className={`tab-btn ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            Favorite Movies
          </button>
        </div>

        {/* טבלת הסרטים */}
        <div className="table-container">
          {currentList.length > 0 ? (
            <table className="movies-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Release Year</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((movie) => (
                  <tr key={movie.id}>
                    <td className="td-title">
                      <Link to={`/movie/${movie.tmdb_id}`}>{movie.title}</Link>
                    </td>
                    <td className="td-year">{movie.release_year}</td>
                    <td className="td-action">
                      <button 
                        className="remove-btn" 
                        onClick={() => handleRemoveMovie(movie.tmdb_id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>Your {activeTab} is empty.</p>
              <Link to="/" className="explore-btn">Explore Movies</Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}