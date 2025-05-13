import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/check", { withCredentials: true })
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
