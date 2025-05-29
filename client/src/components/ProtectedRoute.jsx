import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import dotenv from "dotenv";

const ProtectedRoute = ({ children }) => {
  const backend = import.meta.env.VITE_API_URL;
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    axios
      .get(`${backend}/auth/check`, { withCredentials: true })
      .then((res) => setAuth(res.data.authenticated))
      .catch(() => setAuth(false));
  }, []);
  if (auth === null) {
    return <div>Loading....</div>;
  }
  if (!auth) return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;
