import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../../api/tmdb";
import "./MovieRow.css";

function MovieRow({ title, movies }) {
  const rowRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // פונקציית הגלילה הידנית בלחיצה על החיצים
  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" 
        ? scrollLeft - clientWidth + 100 
        : scrollLeft + clientWidth - 100;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // אפקט גלילה אוטומטית (סרט נע) רציף וחלק
  useEffect(() => {
    const row = rowRef.current;
    if (!row || !movies || movies.length === 0) return;

    let animationFrameId;
    const speed = 0.4; // מהירות הגלילה (ניתן להקטין או להגדיל)

    const startScrolling = () => {
      if (!isHovered) {
        row.scrollLeft += speed;
        
        // כשהגלילה מגיעה לסוף, חוזרים להתחלה בצורה חלקה
        if (row.scrollLeft >= row.scrollWidth - row.clientWidth - 1) {
          row.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(startScrolling);
    };

    animationFrameId = requestAnimationFrame(startScrolling);

    // ניקוי האנימציה ב-Unmount של הקומפוננטה
    return () => cancelAnimationFrame(animationFrameId);
  }, [movies, isHovered]);

  return (
    <div className="movie-row">
      <h2 className="section-title">{title}</h2>
      <div 
        className="row-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button className="scroll-btn left" onClick={() => scroll("left")}>&#10094;</button>
        <div className="row-posters" ref={rowRef}>
          {movies.map((movie) => {
            const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : "";
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "";

            return (
              <Link key={movie.id} to={`/movie/${movie.id}`} className="poster-link">
                <div className="poster-container">
                  <img src={getImageUrl(movie.poster_path, "w500")} alt={movie.title} className="row-poster" />
                </div>
                <div className="movie-item-info">
                  <h4 className="movie-item-title">{movie.title}</h4>
                  <div className="movie-item-meta">
                    {/* השנה תופיע בצד ימין */}
                    {releaseYear && <span className="movie-item-year">{releaseYear}</span>}
                    
                    {/* הדירוג עם הכוכב יופיע בצד שמאל */}
                    {rating && (
                      <div className="movie-item-rating">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>{rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <button className="scroll-btn right" onClick={() => scroll("right")}>&#10095;</button>
      </div>
    </div>
  );
}

export default MovieRow;