import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// שים לב שהוספנו את fetchTopRated לייבוא
import { fetchTrending, fetchPopular, fetchByGenre, fetchTopRated } from "../../api/tmdb";
import MovieRow from "../../components/movie/MovieRow/MovieRow";
import CategoryFilter from "../../components/movie/CategoryFilter/CategoryFilter";
import "./Home.css";

function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]); // ה-State החדש שלנו
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const categories = [
    { id: "all", name: "All" },
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" }
  ];

  useEffect(() => {
    const loadMovies = async () => {
      try {
        // משכנו גם את topRated ב-Promise.all
        const [trendingData, popularData, topRatedData] = await Promise.all([
          fetchTrending(), 
          fetchPopular(),
          fetchTopRated()
        ]);
        
        setTrending(trendingData);
        setPopular(popularData);
        setTopRated(topRatedData);
      } catch (error) {
        console.error("Error loading movies:", error);
      }
    };
    loadMovies();
  }, []);

  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trending.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [trending]);

  const [filteredMovies, setFilteredMovies] = useState([]);

  useEffect(() => {
      const loadFiltered = async () => {
          const results = await fetchByGenre(activeCategory);
          setFilteredMovies(results);
      };
      loadFiltered();
  }, [activeCategory]);

  const currentMovie = trending[currentIndex];

  return (
    <div className="home-container">
      {currentMovie && (
        <div 
          className="hero" 
          style={{ backgroundImage: `url('https://image.tmdb.org/t/p/original/${currentMovie.backdrop_path}')` }}
          onClick={() => navigate(`/movie/${currentMovie.id}`)}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>{currentMovie.title}</h1>
            <p className="hero-overview">
              {currentMovie.overview.length > 200 
                ? `${currentMovie.overview.substring(0, 200)}...` 
                : currentMovie.overview}
            </p>
          </div>
        </div>
      )}
      
      <div className="content-wrapper">
        <div className="rows-container">
          <MovieRow title="Trending This Week" movies={trending} />
          <MovieRow title="Popular Movies" movies={popular} />
          
          {/* השורה החדשה שהוספנו */}
          <MovieRow title="Top Rated of All Time" movies={topRated} />

          <section className="section-spacing">
              <h2 className="browse-title">Browse by Category</h2>
              <CategoryFilter 
                categories={categories} 
                activeCategory={activeCategory} 
                onSelect={setActiveCategory} 
              />
              
              {filteredMovies.length > 0 && (
                <MovieRow 
                  title={`${categories.find(c => c.id === activeCategory)?.name || ""} Movies`} 
                  movies={filteredMovies} 
                />
              )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Home;