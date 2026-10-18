import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMovieDetails, getImageUrl } from "../../api/tmdb";
import "./MovieDetails.css"; 

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(10);
  
  // ניהול מצב הכפתורים החדשים (זמני לפרונטאנד)
  const [isFavorite, setIsFavorite] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchMovieDetails(id);
        setMovie(data);
      } catch (error) {
        console.error(error);
      }
    };

    const loadReviews = async () => {
      try {
        const res = await fetch(`/api/movies/${id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        } else {
          throw new Error("Backend route not ready");
        }
      } catch (error) {
        setReviews([
          { _id: "1", user: "John Doe", rating: 9, text: "Amazing movie, the cinematography is stunning!", date: "2026-07-18" },
          { _id: "2", user: "Jane Smith", rating: 7, text: "Good story but a bit too long.", date: "2026-07-19" }
        ]);
      }
    };

    const checkUserLists = async () => {
      if (!isLoggedIn) return;
      try {
        const [favRes, watchRes] = await Promise.all([
          fetch('/api/user-movies/favorites'),
          fetch('/api/user-movies/watchlist')
        ]);

        if (favRes.ok) {
          const favorites = await favRes.json();
          // האם הסרט הנוכחי נמצא ברשימת המועדפים?
          const isFav = favorites.some(movie => movie.tmdb_id === Number(id));
          setIsFavorite(isFav);
        }

        if (watchRes.ok) {
          const watchlist = await watchRes.json();
          // האם הסרט הנוכחי נמצא ברשימת ה-Watchlist?
          const isWatch = watchlist.some(movie => movie.tmdb_id === Number(id));
          setInWatchlist(isWatch);
        }
      } catch (error) {
        console.error("Error checking user lists:", error);
      }
    };

    loadDetails();
    loadReviews();
    checkUserLists();
  }, [id, isLoggedIn]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    
    const reviewPayload = {
      movie_id: Number(id),
      rating: newReviewRating,
      text: newReviewText
    };

    try {
      const res = await fetch('/api/reviews', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewPayload)
      });

      if (res.ok) {
        const addedReview = await res.json();
        setReviews([addedReview, ...reviews]);
      } else {
        throw new Error("Backend route missing");
      }
    } catch (error) {
      const fallbackReview = {
        _id: Date.now().toString(), 
        user: "Current User",
        rating: newReviewRating,
        text: newReviewText,
        date: new Date().toISOString().split('T')[0]
      };
      setReviews([fallbackReview, ...reviews]);
    }

    setNewReviewText("");
    setNewReviewRating(10);
  };

  if (!movie) return <div className="loading">Loading...</div>;

  const trailer = movie.videos?.results?.find(
    (vid) => vid.type === "Trailer" && vid.site === "YouTube"
  );

  // פונקציה להוספה או הסרה ממועדפים
  const handleToggleFavorite = async () => {
    try {
      const res = await fetch('/api/user-movies/favorites', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdb_id: Number(id),
          title: movie.title,
          release_year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 2026
        })
      });

      if (res.ok) {
        setIsFavorite(!isFavorite); // הופך את מצב הכפתור בדפדפן רק אם השרת אישר
      } else {
        console.error("Failed to update favorite");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // פונקציה להוספה או הסרה מ-Watchlist (Watch Later)
  const handleToggleWatchlist = async () => {
    try {
      const res = await fetch('/api/user-movies/watchlist', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdb_id: Number(id),
          title: movie.title,
          release_year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 2026
        })
      });

      if (res.ok) {
        setInWatchlist(!inWatchlist); // הופך את מצב הכפתור בדפדפן רק אם השרת אישר
      } else {
        console.error("Failed to update watchlist");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="details-container">   
      <div
        className="hero-backdrop"
        style={{ backgroundImage: `url('${getImageUrl(movie.backdrop_path)}')` }}
      ></div>

      <div className="content-wrapper">
        
        {/* --- אזור עליון: פוסטר ומידע על הסרט --- */}
        <div className="movie-header-section">
          <img
            src={getImageUrl(movie.poster_path, "w500")}
            alt={movie.title}
            className="poster-image"
          />
          
          <div className="info-section">
            <h1 className="movie-title">{movie.title}</h1>
            <div className="movie-meta">
              <span>{movie.release_date?.substring(0, 4)}</span>
              <span>•</span>
              <span>{movie.runtime} min</span>
              <span>•</span>
              <span>{movie.vote_average?.toFixed(1)}/10</span>
            </div>

            {isLoggedIn && (
              <div className="movie-actions">
                {/* כפתור מועדפים */}
                <button 
                  className={`action-btn ${isFavorite ? "favorite-active" : ""}`}
                  onClick={handleToggleFavorite}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>{isFavorite ? "Favorited" : "Favorite"}</span>
                </button>

                {/* כפתור Watch Later */}
                <button 
                  className={`action-btn ${inWatchlist ? "watchlist-active" : ""}`}
                  onClick={handleToggleWatchlist}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={inWatchlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>{inWatchlist ? "In Watchlist" : "Watch Later"}</span>
                </button>
              </div>
            )}

            <p className="movie-overview">{movie.overview}</p>
            
            {trailer && (
              <div className="trailer-container">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        </div> {/* סגירת אזור עליון */}

        {/* --- אזור תחתון: ביקורות (ממורכז מתחת למידע) --- */}
        <div className="reviews-section">
          <h2 className="reviews-title">User Reviews</h2>
          
          {isLoggedIn ? (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <div className="review-form-header">
                <label>Rating:</label>
                <select 
                  value={newReviewRating} 
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="review-select"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} / 10</option>
                  ))}
                </select>
              </div>
              <textarea 
                className="review-textarea"
                placeholder="What did you think about the movie?"
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                rows="3"
              />
              <button type="submit" className="review-submit-btn">Post Review</button>
            </form>
          ) : (
            <div className="login-prompt" style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#111", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ color: "#aaa", marginBottom: "10px" }}>Want to share your thoughts?</p>
              <Link to="/auth" style={{ color: "#14b8a6", fontWeight: "bold", textDecoration: "underline" }}>
                Sign in to post a review
              </Link>
            </div>
          )}

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <span className="review-user">{review.user}</span>
                    <span className="review-rating"> {review.rating}/10</span>
                  </div>
                  <p className="review-text">{review.text}</p>
                  <span className="review-date">{review.date}</span>
                </div>
              ))
            ) : (
              <p className="no-reviews">Be the first to review this movie!</p>
            )}
          </div>
        </div> {/* סגירת אזור ביקורות */}
        
      </div>
    </div>
  );
}

export default MovieDetails;