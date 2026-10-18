import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // להצגת שגיאות מהשרת

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); 

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    
    const payload = isLogin 
      ? { email, password } 
      : { email, password, full_name: fullName };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong. Please try again.");
      }

      localStorage.setItem("isLoggedIn", "true");
      
      window.location.href = "/";
      
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
  <div className="auth-container">
    <header className="auth-header">
      <Link to="/" className="auth-logo">
        <span className="logo-accent">Watch</span>Time
      </Link>
    </header>

    <div 
      className="auth-bg" 
      style={{ backgroundImage: "url('https://media.themoviedb.org/t/p/w1066_and_h600_face/2ssWTSVklAEc98frZUQhgtGHx7s.jpg')" }}
    ></div>

    <div className="auth-wrapper">
      

        <div className="auth-benefits">
          <h2>Why join WatchTime?</h2>
          <ul>
            <li><strong>Your Watchlist</strong><br />Track your future views and get reminders.</li>
            <li><strong>Your ratings</strong><br />Rate and remember what you watch.</li>
            <li><strong>Contribute to WatchTime</strong><br />Add data that helps millions of fans.</li>
          </ul>
        </div>
      
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? "Sign In" : "Sign Up"}</h2>
        
        {errorMsg && (
          <div className="auth-error">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              className="auth-input" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          )}
          
          <input 
            type="email" 
            placeholder="Email Address" 
            className="auth-input" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            className="auth-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            minLength="6"
          />
          
          <button type="submit" className="auth-button">
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "New to WatchTime? " : "Already have an account? "}
          <span onClick={() => {
            setIsLogin(!isLogin);
            setErrorMsg(""); 
          }}>
            {isLogin ? "Sign up now" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  </div>
);
}