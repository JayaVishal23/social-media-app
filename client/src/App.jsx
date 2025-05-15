import React from "react";
import Home from "./components/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Createposts from "./components/pages/Createposts";
import Autopost from "./components/pages/Autopost";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <Createposts />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/vautopost"
          element={
            <ProtectedRoute>
              <Autopost />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </Router>
  );
};

export default App;
