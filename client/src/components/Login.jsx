import React from "react";
import dotenv from "dotenv";

const Login = () => {
  const backend = import.meta.env.VITE_API_URL;
  const handleGoogleLogin = () => {
    window.location.href = `${backend}/auth/google`;
  };

  return (
    <div className="login-container">
      <div className="login-card-wrapper">
        <div className="login-image" />
        <div className="login-content">
          <div className="logo-container">
            <h2>Welcome</h2>
          </div>
          <div className="login-card">
            <h2>Sign in</h2>
            <p>to continue to your account</p>

            <button onClick={handleGoogleLogin} className="google-btn">
              <div className="google-icon-wrapper">
                <img
                  src="https://img.icons8.com/fluency/48/google-logo.png"
                  alt="Google logo"
                  className="google-icon"
                />
              </div>
              <span className="btn-text">Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
