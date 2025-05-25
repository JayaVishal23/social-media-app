import React from "react";
import Home from "./components/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Createposts from "./components/pages/Createposts";
import Autopost from "./components/pages/Autopost";
import Profileself from "./components/pages/Profileself";
import Userprofile from "./components/pages/Userprofile";
import UserProfileMain from "./components/pages/UserProfileMain";
import CreateP from "./components/CreateP";
import Settings from "./components/pages/Settings";

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
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profileself />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <UserProfileMain />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/edit/:postId"
          element={
            <ProtectedRoute>
              <Createposts />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </Router>
  );
};

export default App;
